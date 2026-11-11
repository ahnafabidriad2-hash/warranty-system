import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Products])],
  exports: [TypeOrmModule],
})
export class ProductsModule {}