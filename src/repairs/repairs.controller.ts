import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RepairsService } from './repairs.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { CompleteRepairDto } from './dto/complete-repair.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Repairs')
@Controller('repairs')
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  @Get()
  @ApiOperation({ summary: 'List repairs with pagination' })
  findAll(@Query() query: PaginationDto) {
    return this.repairsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one repair with its claim, technician and parts' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.repairsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Assign a technician to an approved claim' })
  create(@Body() dto: CreateRepairDto) {
    return this.repairsService.create(dto);
  }

  @Post(':id/complete')
  // POST default e 201 (notun kichu banano) dey. Eta notun kichu banay na,
  // ager repair ke shesh kore, tai 200.
  @HttpCode(200)
  @ApiOperation({ summary: 'Complete a repair: use parts, reduce stock, resolve the claim' })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteRepairDto,
  ) {
    return this.repairsService.complete(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Change technician, notes or status (not COMPLETED)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRepairDto,
  ) {
    return this.repairsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a repair that is not completed' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.repairsService.remove(id);
  }
}