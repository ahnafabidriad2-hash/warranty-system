import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Repairs } from '../repairs/entities/repairs.entity';
import { Users } from '../users/entities/users.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { RepairStatus } from '../common/enums/repair-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Repairs)
    private readonly repairsRepo: Repository<Repairs>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
  ) {}

  // GET /feedback?page=1&limit=10
  async findAll(query: PaginationDto) {
    const [items, total] = await this.feedbackRepo.findAndCount({
      relations: { repair: true, customer: true },
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return paginate(items, total, query);
  }

  // GET /feedback/:id
  async findOne(id: string) {
    const feedback = await this.feedbackRepo.findOne({
      where: { id },
      relations: { repair: true, customer: true },
    });
    if (!feedback) {
      throw new NotFoundException('Feedback ' + id + ' not found');
    }
    return feedback;
  }

  // POST /feedback
  async create(dto: CreateFeedbackDto) {
    // 1. repair ache? shathe claim -> warranty -> customer o ano,
    //    jate pore malik check kora jay (3 dhap er relation ek shathe)
    const repair = await this.repairsRepo.findOne({
      where: { id: dto.repairId },
      relations: { claim: { warranty: { customer: true } } },
    });
    if (!repair) {
      throw new NotFoundException('Repair ' + dto.repairId + ' not found');
    }

    // 2. ei repair e age feedback ache? thakle 409
    const existing = await this.feedbackRepo.findOne({
      where: { repair: { id: dto.repairId } },
    });
    if (existing) {
      throw new ConflictException('This repair already has feedback');
    }

    // 3. kaj shesh na hole feedback na
    if (repair.status !== RepairStatus.COMPLETED) {
      throw new BadRequestException(
        'Feedback is allowed only after the repair is COMPLETED (this one is ' +
          repair.status +
          ')',
      );
    }

    // 4. customer ache ar role CUSTOMER?
    const customer = await this.usersRepo.findOne({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException('User ' + dto.customerId + ' not found');
    }
    if (customer.role !== Role.CUSTOMER) {
      throw new BadRequestException('User ' + dto.customerId + ' is not a customer');
    }

    // 5. shudhu warranty r malik feedback dite parbe
    if (repair.claim.warranty.customer.id !== customer.id) {
      throw new BadRequestException(
        'Only the owner of this warranty can give feedback',
      );
    }

    // 6. save
    const feedback = this.feedbackRepo.create({
      rating: dto.rating,
      comment: dto.comment ?? null,
      repair,
      customer,
    });
    const saved = await this.feedbackRepo.save(feedback);
    return this.findOne(saved.id);
  }

  // PATCH /feedback/:id
  async update(id: string, dto: UpdateFeedbackDto) {
    const feedback = await this.findOne(id);

    if (dto.rating !== undefined) {
      feedback.rating = dto.rating;
    }
    if (dto.comment !== undefined) {
      feedback.comment = dto.comment;
    }

    await this.feedbackRepo.save(feedback);
    return this.findOne(id);
  }

  // DELETE /feedback/:id
  async remove(id: string) {
    const feedback = await this.findOne(id);
    await this.feedbackRepo.remove(feedback);
    return { message: 'Feedback ' + id + ' deleted' };
  }
}