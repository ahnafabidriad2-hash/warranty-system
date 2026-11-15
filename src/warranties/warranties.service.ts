import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
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
      this.findCustomer(dto.customerId),
      this.findSeller(dto.sellerId),
    ]);

    return this.save(
      this.warrantiesRepo.create({
        serialNumber: dto.serialNumber,
        purchaseDate: dto.purchaseDate,
        expiryDate: this.calculateExpiryDate(
          dto.purchaseDate,
          product.warrantyMonths,
        ),
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

  async findForCustomer(customerId: string, pagination: PaginationDto) {
    await this.findCustomer(customerId);
    const [warranties, total] = await this.warrantiesRepo.findAndCount({
      where: { customer: { id: customerId }, isActive: true },
      relations: { product: true, customer: true, seller: true },
      order: { createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return paginate(warranties, total, pagination);
  }

  async checkValidity(id: string) {
    const warranty = await this.findOne(id);

    return {
      isValid:
        warranty.isActive &&
        warranty.expiryDate >= new Date().toISOString().slice(0, 10),
      expiryDate: warranty.expiryDate,
    };
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
      this.findCustomer(dto.customerId),
      this.findSeller(dto.sellerId),
    ]);

    warranty.serialNumber = dto.serialNumber;
    warranty.purchaseDate = dto.purchaseDate;
    warranty.expiryDate = this.calculateExpiryDate(
      dto.purchaseDate,
      product.warrantyMonths,
    );
    warranty.product = product;
    warranty.customer = customer;
    warranty.seller = seller;

    return this.save(warranty);
  }

  async update(id: string, dto: UpdateWarrantyDto): Promise<Warranties> {
    const warranty = await this.findOne(id);
    let recalculateExpiry = false;

    if (dto.productId !== undefined) {
      warranty.product = await this.findProduct(dto.productId);
      recalculateExpiry = true;
    }
    if (dto.customerId !== undefined) {
      warranty.customer = await this.findCustomer(dto.customerId);
    }
    if (dto.sellerId !== undefined) {
      warranty.seller = await this.findSeller(dto.sellerId);
    }
    if (dto.serialNumber !== undefined)
      warranty.serialNumber = dto.serialNumber;
    if (dto.purchaseDate !== undefined) {
      warranty.purchaseDate = dto.purchaseDate;
      recalculateExpiry = true;
    }
    if (recalculateExpiry) {
      warranty.expiryDate = this.calculateExpiryDate(
        warranty.purchaseDate,
        warranty.product.warrantyMonths,
      );
    }

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

  private async findCustomer(id: string): Promise<Users> {
    const customer = await this.findUser(id);
    if (customer.role !== Role.CUSTOMER) {
      throw new BadRequestException(`User ${id} is not a customer`);
    }
    return customer;
  }

  private async findSeller(id: string): Promise<Users> {
    const seller = await this.findUser(id);
    if (seller.role !== Role.SELLER) {
      throw new BadRequestException(`User ${id} is not a seller`);
    }
    return seller;
  }

  private calculateExpiryDate(purchaseDate: string, warrantyMonths: number) {
    const [year, month, day] = purchaseDate.slice(0, 10).split('-').map(Number);
    const expiry = new Date(Date.UTC(year, month - 1 + warrantyMonths, 1));
    const lastDayOfMonth = new Date(
      Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth() + 1, 0),
    ).getUTCDate();
    expiry.setUTCDate(Math.min(day, lastDayOfMonth));
    return expiry.toISOString().slice(0, 10);
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
