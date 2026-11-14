import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { RepairParts } from '../repairs/entities/repair-parts.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Parts } from './entities/parts.entity';

@Injectable()
export class PartsService {
  constructor(
  
    @InjectRepository(Parts)
    private readonly partsRepo: Repository<Parts>,

    @InjectRepository(RepairParts)
    private readonly repairPartsRepo: Repository<RepairParts>,
  ) {}

  async create(dto: CreatePartDto) {
    const exists = await this.partsRepo.findOne({ where: { sku: dto.sku } });
    if (exists) {
      throw new ConflictException(`SKU ${dto.sku} already exists`); 
    }
    const part = this.partsRepo.create(dto);
    return this.partsRepo.save(part);
  }

  async findAll(query: PaginationDto) {
    const [items, total] = await this.partsRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });
    return paginate(items, total, query);
  }

  async findOne(id: string) {
    const part = await this.partsRepo.findOne({ where: { id } });
    if (!part) {
      throw new NotFoundException(`Part ${id} not found`); // 404
    }
    return part;
  }


  async update(id: string, dto: UpdatePartDto) {
    const part = await this.findOne(id);
    Object.assign(part, dto);
    return this.partsRepo.save(part);
  }


  async remove(id: string) {
    const part = await this.findOne(id);

    const usedCount = await this.repairPartsRepo.count({
      where: { part: { id } },
    });
    if (usedCount > 0) {
      throw new ConflictException('Part is used in a repair');
    }

    await this.partsRepo.remove(part);
    return { message: `Part ${id} deleted` };
  }
}