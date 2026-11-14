import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairParts } from '../repairs/entities/repair-parts.entity';
import { Parts } from './entities/parts.entity';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Parts, RepairParts])],
  controllers: [PartsController],
  providers: [PartsService],
  exports: [TypeOrmModule],
})
export class PartsModule {}