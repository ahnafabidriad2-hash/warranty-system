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
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsService } from './parts.service';

@ApiTags('parts')
@Controller('parts') 
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post() 
  create(@Body() dto: CreatePartDto) {
    return this.partsService.create(dto);
  }

  @Get() 
  findAll(@Query() query: PaginationDto) {
    return this.partsService.findAll(query);
  }

  @Get(':id') 
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.partsService.findOne(id);
  }

  @Patch(':id') 
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartDto,
  ) {
    return this.partsService.update(id, dto);
  }

  @Delete(':id') 
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.partsService.remove(id);
  }
}