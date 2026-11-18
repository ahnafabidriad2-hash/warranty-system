import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { Users } from '../users/entities/users.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Email already registered'); // 409 conflict bujhay
    }
    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      role: Role.CUSTOMER,
    });
    const saved = await this.usersRepo.save(user);
    // select: false, tai findOne e password ferot ashe na
    return this.usersRepo.findOne({ where: { id: saved.id } });
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      select: { id: true, email: true, password: true, role: true, isActive: true },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password'); // 401 authorized na
    }
    if (!user.isActive) {
      throw new ForbiddenException('This account is disabled'); // 403 forbidden, user active na thakle access dite parbe na
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}