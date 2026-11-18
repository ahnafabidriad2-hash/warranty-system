import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { ClaimStatus } from '../common/enums/claim-status.enum';
import { Role } from '../common/enums/role.enum'; // notun
import { RepairsService } from '../repairs/repairs.service';
import { Warranties } from '../warranties/entities/warranties.entity';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { Claims } from './entities/claims.entity';

type CurrentUser = { id: string; role: Role };
@Injectable()
export class ClaimsService {
  constructor(
  
    @InjectRepository(Claims)
    private readonly claimsRepo: Repository<Claims>,
    
    @InjectRepository(Warranties)
    private readonly warrantiesRepo: Repository<Warranties>,
  
    private readonly repairsService: RepairsService,
  ) {}

  async create(dto: CreateClaimDto, user: CurrentUser) {
  const warranty = await this.warrantiesRepo.findOne({
    where: { id: dto.warrantyId },
  });
  if (!warranty) {
    throw new NotFoundException(`Warranty ${dto.warrantyId} not found`); // 404
  }

  await this.checkWarrantyOwner(warranty.id, user);

  
  const today = new Date().toISOString().slice(0, 10);
  if (warranty.expiryDate < today) {
    throw new BadRequestException('Warranty has expired');
  }

  const claim = this.claimsRepo.create({
    issueDescription: dto.issueDescription,
    warranty,
  });
  return this.claimsRepo.save(claim);
}

  async findAll(query: PaginationDto) {
    const [items, total] = await this.claimsRepo.findAndCount({
      relations: { warranty: true }, 
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });
    return paginate(items, total, query);
  }

  
  async findOne(id: string) {
    const claim = await this.claimsRepo.findOne({
      where: { id },
      relations: { warranty: true },
    });
    if (!claim) {
      throw new NotFoundException(`Claim ${id} not found`); // 404
    }
    return claim;
  }

  async update(id: string, dto: UpdateClaimDto) {
    const claim = await this.findOne(id);
    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException(
        `Only a PENDING claim can be edited (this one is ${claim.status})`,
      ); 
    }
    if (dto.issueDescription !== undefined) {
      claim.issueDescription = dto.issueDescription;
    }
    return this.claimsRepo.save(claim);
  }

  async approve(id: string) {
    const claim = await this.findOne(id);
    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException(
        `Only a PENDING claim can be approved (this one is ${claim.status})`,
      ); 
    }
    claim.status = ClaimStatus.APPROVED;
    return this.claimsRepo.save(claim);
  }

  async reject(id: string, dto: RejectClaimDto) {
    const claim = await this.findOne(id);
    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException(
        `Only a PENDING claim can be rejected (this one is ${claim.status})`,
      );
    }
    claim.status = ClaimStatus.REJECTED;
    claim.rejectionReason = dto.rejectionReason;
    return this.claimsRepo.save(claim);
  }

  assignTechnician(claimId: string, dto: AssignTechnicianDto) {
    return this.repairsService.create({
      claimId,
      technicianId: dto.technicianId,
    });
  }
  async remove(id: string) {
    const claim = await this.findOne(id);
    await this.claimsRepo.remove(claim);
    return { message: `Claim ${id} deleted` };
  }

private async checkWarrantyOwner(warrantyId: string, user: CurrentUser) {
  if (user.role !== Role.CUSTOMER) {
    return;
  }
  const isOwner = await this.warrantiesRepo.exists({
    where: { id: warrantyId, customer: { id: user.id } },
  });
  if (!isOwner) {
    throw new ForbiddenException('This warranty is not yours'); // 403
  }
}
}