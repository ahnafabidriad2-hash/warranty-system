import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

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

  // GET /feedback?page=1&limit=10 (Admin)
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
  // user deya hole: customer shudhu nijer feedback dekhte pare
  async findOne(id: string, user?: AuthenticatedUser) {
    const feedback = await this.feedbackRepo.findOne({
      where: { id },
      relations: { repair: true, customer: true },
    });
    if (!feedback) {
      throw new NotFoundException('Feedback ' + id + ' not found');
    }
    if (user && user.role === Role.CUSTOMER && feedback.customer.id !== user.id) {
      throw new ForbiddenException('This is not your feedback');
    }
    return feedback;
  }

  // POST /feedback (Customer)
  async create(dto: CreateFeedbackDto, user: AuthenticatedUser) {
    // 1. repair ache? shathe claim -> warranty -> customer o ano (malik check er jonno)
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

    // 4. shudhu warranty r malik feedback dite parbe
    if (repair.claim.warranty.customer.id !== user.id) {
      throw new ForbiddenException('Only the owner of this warranty can give feedback');
    }

    // 5. login kora customer ke database theke ano
    const customer = await this.usersRepo.findOne({ where: { id: user.id } });
    if (!customer) {
      throw new NotFoundException('User ' + user.id + ' not found');
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

  // PATCH /feedback/:id (Customer, own only)
  async update(id: string, dto: UpdateFeedbackDto, user: AuthenticatedUser) {
    const feedback = await this.findOne(id, user); // onner hole 403

    if (dto.rating !== undefined) {
      feedback.rating = dto.rating;
    }
    if (dto.comment !== undefined) {
      feedback.comment = dto.comment;
    }

    await this.feedbackRepo.save(feedback);
    return this.findOne(id);
  }

  // DELETE /feedback/:id (Admin, or the customer who wrote it)
  async remove(id: string, user: AuthenticatedUser) {
    const feedback = await this.findOne(id, user);
    await this.feedbackRepo.remove(feedback);
    return { message: 'Feedback ' + id + ' deleted' };
  }
}