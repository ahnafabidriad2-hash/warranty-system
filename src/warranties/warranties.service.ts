import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Products } from '../products/entities/products.entity';
import { Users } from '../users/entities/users.entity';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';
import { Warranties } from './entities/warranties.entity';

@Injectable()
export class WarrantiesService {
  constructor(
    @InjectRepository(Warranties)
    private readonly warrantiesRepo: Repository<Warranties>,
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
  ) {}

  async create(dto: CreateWarrantyDto): Promise<Warranties> {
    const [product, customer, seller] = await Promise.all([
      this.findProduct(dto.productId),
      this.findUser(dto.customerId),
      this.findUser(dto.sellerId),
    ]);

    return this.save(
      this.warrantiesRepo.create({
        serialNumber: dto.serialNumber,
        purchaseDate: dto.purchaseDate,
        expiryDate: dto.expiryDate,
        product,
        customer,
        seller,
      }),
    );
  }

  async findAll(pagination: PaginationDto) {
    const [warranties, total] = await this.warrantiesRepo.findAndCount({
      where: { isActive: true },
      relations: { product: true, customer: true, seller: true },
      order: { createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return paginate(warranties, total, pagination);
  }

  async findOne(id: string): Promise<Warranties> {
    const warranty = await this.warrantiesRepo.findOne({
      where: { id },
      relations: { product: true, customer: true, seller: true },
    });

    if (!warranty) {
      throw new NotFoundException(`Warranty ${id} not found`);
    }

    return warranty;
  }

  async replace(id: string, dto: CreateWarrantyDto): Promise<Warranties> {
    const [warranty, product, customer, seller] = await Promise.all([
      this.findOne(id),
      this.findProduct(dto.productId),
      this.findUser(dto.customerId),
      this.findUser(dto.sellerId),
    ]);

    warranty.serialNumber = dto.serialNumber;
    warranty.purchaseDate = dto.purchaseDate;
    warranty.expiryDate = dto.expiryDate;
    warranty.product = product;
    warranty.customer = customer;
    warranty.seller = seller;

    return this.save(warranty);
  }

  async update(id: string, dto: UpdateWarrantyDto): Promise<Warranties> {
    const warranty = await this.findOne(id);

    if (dto.productId !== undefined) {
      warranty.product = await this.findProduct(dto.productId);
    }
    if (dto.customerId !== undefined) {
      warranty.customer = await this.findUser(dto.customerId);
    }
    if (dto.sellerId !== undefined) {
      warranty.seller = await this.findUser(dto.sellerId);
    }
    if (dto.serialNumber !== undefined)
      warranty.serialNumber = dto.serialNumber;
    if (dto.purchaseDate !== undefined)
      warranty.purchaseDate = dto.purchaseDate;
    if (dto.expiryDate !== undefined) warranty.expiryDate = dto.expiryDate;

    return this.save(warranty);
  }

  async remove(id: string): Promise<Warranties> {
    const warranty = await this.findOne(id);
    if (!warranty.isActive) return warranty;

    warranty.isActive = false;
    return this.save(warranty);
  }

  private async findProduct(id: string): Promise<Products> {
    const product = await this.productsRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    if (!product.isActive) {
      throw new BadRequestException(`Product ${id} is inactive`);
    }
    return product;
  }

  private async findUser(id: string): Promise<Users> {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  private async save(warranty: Warranties): Promise<Warranties> {
    try {
      return await this.warrantiesRepo.save(warranty);
    } catch (error: unknown) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException(
          `Serial number ${warranty.serialNumber} already exists for product ${warranty.product.id}`,
        );
      }
      throw error;
    }
  }

  private isDuplicateEntry(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;

    const driverError: unknown = error.driverError;
    return (
      typeof driverError === 'object' &&
      driverError !== null &&
      'code' in driverError &&
      driverError.code === 'ER_DUP_ENTRY'
    );
  }
}
