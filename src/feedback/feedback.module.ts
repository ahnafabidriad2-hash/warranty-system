import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Repairs } from '../repairs/entities/repairs.entity';
import { Users } from '../users/entities/users.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Repairs, Users])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [TypeOrmModule],
})
export class FeedbackModule {}