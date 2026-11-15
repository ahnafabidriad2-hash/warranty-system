import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Products } from '../products/entities/products.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Categories } from './entities/categories.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>,
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const [categories, total] = await this.categoriesRepo.findAndCount({
      order: { name: 'ASC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return paginate(categories, total, pagination);
  }

  async findOne(id: string): Promise<Categories> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`); 
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Categories> {
    await this.ensureNameFree(dto.name);
    const category = this.categoriesRepo.create({
      name: dto.name,
      description: dto.description ?? null,
    });
    return this.categoriesRepo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Categories> {
    const category = await this.findOne(id);
    if (dto.name !== undefined && dto.name !== category.name) {
      await this.ensureNameFree(dto.name);
      category.name = dto.name;
    }
    if (dto.description !== undefined) category.description = dto.description;
    return this.categoriesRepo.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    const used = await this.productsRepo.count({
      where: { category: { id } },
    });
    if (used > 0) {
      throw new ConflictException(
        'Category has ' + used + ' product(s); move or deactivate them first',
      );
    }
    await this.categoriesRepo.remove(category);
    return { message: 'Category ' + id + ' deleted' };
  }

  private async ensureNameFree(name: string) {
    const exists = await this.categoriesRepo.findOne({ where: { name } });
    if (exists) {
      throw new ConflictException('Category name already exists');
    }
  }
}