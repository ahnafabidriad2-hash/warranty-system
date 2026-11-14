import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ClaimsService } from './claims.service';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@ApiTags('claims')
@Controller('claims') // shob URL /claims diye shuru
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post() // POST /claims
  create(@Body() dto: CreateClaimDto) {
    return this.claimsService.create(dto);
  }

  @Get() // GET /claims?page=1&limit=10
  findAll(@Query() query: PaginationDto) {
    return this.claimsService.findAll(query);
  }

  @Get(':id') // GET /claims/<id>
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.findOne(id);
  }

  @Patch(':id') // PATCH /claims/<id>
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClaimDto,
  ) {
    return this.claimsService.update(id, dto);
  }

  @Patch(':id/approve') // PATCH /claims/<id>/approve
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.approve(id);
  }

  @Patch(':id/reject') // PATCH /claims/<id>/reject
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectClaimDto,
  ) {
    return this.claimsService.reject(id, dto);
  }

  @Patch(':id/assign') // PATCH /claims/<id>/assign
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTechnicianDto,
  ) {
    return this.claimsService.assignTechnician(id, dto);
  }

  @Delete(':id') // DELETE /claims/<id>
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.remove(id);
  }
}