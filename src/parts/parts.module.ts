import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parts } from './entities/parts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parts])],
  exports: [TypeOrmModule],
})
export class PartsModule {}