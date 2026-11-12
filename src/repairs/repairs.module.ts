import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repairs } from './entities/repairs.entity';
import { RepairParts } from './entities/repair-parts.entity';
import { Claims } from '../claims/entities/claims.entity';
import { Users } from '../users/entities/users.entity';
import { Parts } from '../parts/entities/parts.entity';
import { RepairsService } from './repairs.service';
import { RepairsController } from './repairs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repairs, RepairParts, Claims, Users, Parts]),
  ],
  controllers: [RepairsController],
  providers: [RepairsService],
  exports: [TypeOrmModule, RepairsService],
})
export class RepairsModule {}