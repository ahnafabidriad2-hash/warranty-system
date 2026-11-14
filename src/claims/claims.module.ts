import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claims } from './entities/claims.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Claims])],
  exports: [TypeOrmModule],
})
export class ClaimsModule {}
