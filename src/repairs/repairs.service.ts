import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Repairs } from './entities/repairs.entity';
import { RepairParts } from './entities/repair-parts.entity';
import { Claims } from '../claims/entities/claims.entity';
import { Users } from '../users/entities/users.entity';
import { Parts } from '../parts/entities/parts.entity';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { CompleteRepairDto } from './dto/complete-repair.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { ClaimStatus } from '../common/enums/claim-status.enum';
import { RepairStatus } from '../common/enums/repair-status.enum';
import { Role } from '../common/enums/role.enum';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class RepairsService {
  constructor(
    @InjectRepository(Repairs)
    private readonly repairsRepo: Repository<Repairs>,
    @InjectRepository(Claims)
    private readonly claimsRepo: Repository<Claims>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    // DataSource holo pura database connection. Transaction shuru korte eta lage.
    private readonly dataSource: DataSource,
  ) {}

  // GET /repairs?page=1&limit=10
  async findAll(query: PaginationDto) {
    const [items, total] = await this.repairsRepo.findAndCount({
      relations: { claim: true, technician: true },
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  // GET /repairs/:id
  async findOne(id: string) {
    const repair = await this.repairsRepo.findOne({
      where: { id },
      relations: {
        claim: true,
        technician: true,
        repairParts: { part: true },
      },
    });
    if (!repair) {
      throw new NotFoundException('Repair ' + id + ' not found');
    }
    return repair;
  }

  // POST /repairs (Admin), also called by ClaimsService for PATCH /claims/:id/assign
  async create(dto: CreateRepairDto) {
    // 1. the claim must exist
    const claim = await this.claimsRepo.findOne({ where: { id: dto.claimId } });
    if (!claim) {
      throw new NotFoundException('Claim ' + dto.claimId + ' not found');
    }

    // 2. one claim can have only one repair (before the status check, so 409)
    const existing = await this.repairsRepo.findOne({
      where: { claim: { id: dto.claimId } },
    });
    if (existing) {
      throw new ConflictException('This claim already has a repair');
    }

    // 3. the claim must be APPROVED
    if (claim.status !== ClaimStatus.APPROVED) {
      throw new BadRequestException(
        'Only an APPROVED claim can get a repair (this one is ' +
          claim.status +
          ')',
      );
    }

    // 4. the technician must exist, be active and have the TECHNICIAN role
    const technician = await this.findTechnician(dto.technicianId);

    // 5. save the repair, then move the claim to IN_REPAIR
    const repair = this.repairsRepo.create({
      claim,
      technician,
      notes: dto.notes ?? null,
      status: RepairStatus.ASSIGNED,
    });
    const saved = await this.repairsRepo.save(repair);

    claim.status = ClaimStatus.IN_REPAIR;
    await this.claimsRepo.save(claim);

    return this.findOne(saved.id);
  }

  // PATCH /repairs/:id
  async update(id: string, dto: UpdateRepairDto, user: AuthenticatedUser) {
    const repair = await this.findOne(id);

    // technician shudhu nijer repair bodlate pare
    if (user.role === Role.TECHNICIAN && repair.technician.id !== user.id) {
      throw new ForbiddenException('This repair is assigned to another technician');
    }
    // technician bodlano shudhu Admin er kaj
    if (user.role === Role.TECHNICIAN && dto.technicianId) {
      throw new ForbiddenException('Only an admin can change the technician');
    }

    if (repair.status === RepairStatus.COMPLETED) {
      throw new BadRequestException('A completed repair cannot be changed');
    }

    if (dto.technicianId) {
      repair.technician = await this.findTechnician(dto.technicianId);
    }
    if (dto.notes !== undefined) {
      repair.notes = dto.notes;
    }
    if (dto.status) {
      repair.status = dto.status;
    }

    await this.repairsRepo.save(repair);
    return this.findOne(id);
  }

  // POST /repairs/:id/complete  (THE TRANSACTION)
  async complete(id: string, dto: CompleteRepairDto, user: AuthenticatedUser) {
    // dataSource.transaction(...) er bhitorer shob kaj ekta packet.
    // Bhitore kothao throw hole MySQL shob change ferot dey (rollback).
    await this.dataSource.transaction(async (manager) => {
      // Bhitore this.repairsRepo na, shudhu "manager" use korte hobe.

      // 1. repair ache?
      const repair = await manager.findOne(Repairs, {
        where: { id },
        relations: { claim: true, technician: true },
      });
      if (!repair) {
        throw new NotFoundException('Repair ' + id + ' not found');
      }

      // 2. shudhu je technician ke assign kora, se-i complete korte pare
      if (repair.technician.id !== user.id) {
        throw new ForbiddenException('This repair is assigned to another technician');
      }

      // 3. already complete?
      if (repair.status === RepairStatus.COMPLETED) {
        throw new BadRequestException('This repair is already completed');
      }

      // 4. claim IN_REPAIR e thakte hobe
      if (repair.claim.status !== ClaimStatus.IN_REPAIR) {
        throw new BadRequestException(
          'The claim must be IN_REPAIR (this one is ' + repair.claim.status + ')',
        );
      }

      // 5. protiti part: ache kina, stock ache kina, stock komao, usage save
      for (const item of dto.parts) {
        const part = await manager.findOne(Parts, { where: { id: item.partId } });
        if (!part) {
          throw new NotFoundException('Part ' + item.partId + ' not found');
        }
        if (part.stock < item.quantity) {
          // ei throw e ROLLBACK hoy: ager part er stock kome thakle o ferot ashe
          throw new BadRequestException(
            'Not enough stock for ' +
              part.name +
              ' (have ' +
              part.stock +
              ', need ' +
              item.quantity +
              ')',
          );
        }

        part.stock = part.stock - item.quantity;
        await manager.save(part);

        const used = manager.create(RepairParts, {
          repair,
          part,
          quantity: item.quantity,
        });
        await manager.save(used);
      }

      // 6. repair COMPLETED
      repair.status = RepairStatus.COMPLETED;
      repair.completedAt = new Date();
      if (dto.notes !== undefined) {
        repair.notes = dto.notes;
      }
      await manager.save(repair);

      // 7. claim RESOLVED
      repair.claim.status = ClaimStatus.RESOLVED;
      await manager.save(repair.claim);
    });

    // transaction shesh (commit hoye geche), ekhon parts shoho ferot dao
    return this.findOne(id);
  }

  // DELETE /repairs/:id
  async remove(id: string) {
    const repair = await this.findOne(id);

    if (repair.status === RepairStatus.COMPLETED) {
      throw new BadRequestException('A completed repair cannot be deleted');
    }

    // the claim goes back to APPROVED so a new repair can be made
    repair.claim.status = ClaimStatus.APPROVED;
    await this.claimsRepo.save(repair.claim);

    await this.repairsRepo.remove(repair);
    return { message: 'Repair ' + id + ' deleted' };
  }

  // helper used by create and update
  private async findTechnician(technicianId: string) {
    const user = await this.usersRepo.findOne({ where: { id: technicianId } });
    if (!user) {
      throw new NotFoundException('User ' + technicianId + ' not found');
    }
    if (user.role !== Role.TECHNICIAN) {
      throw new BadRequestException('User ' + technicianId + ' is not a technician');
    }
    if (!user.isActive) {
      throw new BadRequestException('Technician ' + technicianId + ' is not active');
    }
    return user;
  }
}