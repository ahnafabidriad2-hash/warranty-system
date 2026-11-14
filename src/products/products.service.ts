import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from '../categories/entities/categories.entity';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { Users } from '../users/entities/users.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/products.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,
    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
  ) {}

  async create(dto: CreateProductDto): Promise<Products> {
    const category = await this.findCategory(dto.categoryId);
    const seller = await this.findSeller(dto.sellerId);

    const product = this.productsRepo.create({
      name: dto.name,
      brand: dto.brand ?? null,
      warrantyMonths: dto.warrantyMonths,
      category,
      seller,
    });

    return this.productsRepo.save(product);
  }

  async findAll(pagination: PaginationDto) {
    const [products, total] = await this.productsRepo.findAndCount({
      where: { isActive: true },
      relations: { category: true, seller: true },
      order: { createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return paginate(products, total, pagination);
  }

  async findOne(id: string): Promise<Products> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { category: true, seller: true },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Products> {
    const product = await this.findOne(id);

    if (dto.categoryId !== undefined) {
      product.category = await this.findCategory(dto.categoryId);
    }
    if (dto.sellerId !== undefined) {
      product.seller = await this.findSeller(dto.sellerId);
    }
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.brand !== undefined) product.brand = dto.brand;
    if (dto.warrantyMonths !== undefined) {
      product.warrantyMonths = dto.warrantyMonths;
    }

    return this.productsRepo.save(product);
  }

  async replace(id: string, dto: CreateProductDto): Promise<Products> {
    const product = await this.findOne(id);
    const category = await this.findCategory(dto.categoryId);
    const seller = await this.findSeller(dto.sellerId);

    product.name = dto.name;
    product.brand = dto.brand ?? null;
    product.warrantyMonths = dto.warrantyMonths;
    product.category = category;
    product.seller = seller;

    return this.productsRepo.save(product);
  }

  async remove(id: string): Promise<Products> {
    const product = await this.findOne(id);
    if (!product.isActive) return product;

    product.isActive = false;
    return this.productsRepo.save(product);
  }

  private async findCategory(id: string): Promise<Categories> {
    const category = await this.categoriesRepo.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  private async findSeller(id: string): Promise<Users> {
    const seller = await this.usersRepo.findOneBy({ id });
    if (!seller) {
      throw new NotFoundException(`User ${id} not found`);
    }
    if (seller.role !== Role.SELLER) {
      throw new BadRequestException(`User ${id} is not a seller`);
    }
    return seller;
  }
}
