import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const [users, total] = await this.usersRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return paginate(users, total, pagination);
  }

  async findOne(id: string): Promise<Users> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`); 
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<Users> {
    await this.ensureEmailFree(dto.email);
    const user = this.usersRepo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
    });
    const saved = await this.usersRepo.save(user);
    return this.findOne(saved.id); 
  }

  async update(id: string, dto: UpdateUserDto): Promise<Users> {
    const user = await this.findOne(id);

    if (dto.email !== undefined && dto.email !== user.email) {
      await this.ensureEmailFree(dto.email);
      user.email = dto.email;
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password !== undefined) {
      user.password = await bcrypt.hash(dto.password, 10); 
    }

    await this.usersRepo.save(user);
    return this.findOne(id);
  }


  async remove(id: string): Promise<Users> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.usersRepo.save(user);
    return this.findOne(id);
  }

  private async ensureEmailFree(email: string) {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }
  }
}