import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repairs } from './entities/repairs.entity';
import { RepairParts } from './entities/repair-parts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Repairs, RepairParts])],
  exports: [TypeOrmModule],
})
export class RepairsModule {}
