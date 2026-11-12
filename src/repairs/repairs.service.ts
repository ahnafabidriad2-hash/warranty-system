import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repairs } from './entities/repairs.entity';
import { Claims } from '../claims/entities/claims.entity';
import { Users } from '../users/entities/users.entity';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { ClaimStatus } from '../common/enums/claim-status.enum';
import { RepairStatus } from '../common/enums/repair-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RepairsService {
  constructor(
    @InjectRepository(Repairs)
    private readonly repairsRepo: Repository<Repairs>,
    @InjectRepository(Claims)
    private readonly claimsRepo: Repository<Claims>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
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

  // POST /repairs
  async create(dto: CreateRepairDto) {
    // 1. the claim must exist and be APPROVED
    const claim = await this.claimsRepo.findOne({ where: { id: dto.claimId } });
    if (!claim) {
      throw new NotFoundException('Claim ' + dto.claimId + ' not found');
    }
    if (claim.status !== ClaimStatus.APPROVED) {
      throw new BadRequestException(
        'Only an APPROVED claim can get a repair (this one is ' +
          claim.status +
          ')',
      );
    }

    // 2. one claim can have only one repair
    const existing = await this.repairsRepo.findOne({
      where: { claim: { id: dto.claimId } },
    });
    if (existing) {
      throw new ConflictException('This claim already has a repair');
    }

    // 3. the technician must exist, be active and have the TECHNICIAN role
    const technician = await this.findTechnician(dto.technicianId);

    // 4. save the repair, then move the claim to IN_REPAIR
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
  async update(id: string, dto: UpdateRepairDto) {
    const repair = await this.findOne(id);

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