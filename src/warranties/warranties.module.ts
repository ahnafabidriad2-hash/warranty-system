import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warranties } from './entities/warranties.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warranties])],
  exports: [TypeOrmModule],
})
export class WarrantiesModule {}