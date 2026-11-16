import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairsModule } from '../repairs/repairs.module';
import { Warranties } from '../warranties/entities/warranties.entity';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { Claims } from './entities/claims.entity';

@Module({
  imports: [
    // Warranties ekhane lagbe, karon claim submit e warranty khuji
    TypeOrmModule.forFeature([Claims, Warranties]),
    // RepairsModule theke RepairsService ashe (assign technician er jonno)
    RepairsModule,
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [TypeOrmModule],
})
export class ClaimsModule {}