import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from '../products/entities/products.entity';
import { Users } from '../users/entities/users.entity';
import { Warranties } from './entities/warranties.entity';
import { WarrantiesController } from './warranties.controller';
import { WarrantiesService } from './warranties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Warranties, Products, Users])],
  controllers: [WarrantiesController],
  providers: [WarrantiesService],
  exports: [TypeOrmModule],
})
export class WarrantiesModule {}
