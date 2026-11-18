import {
  Body,Controller,Delete,Get,Param,ParseUUIDPipe,Patch,Post,Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PartsService } from './parts.service';

@ApiTags('parts')
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('parts') 
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post() 
  @Roles(Role.ADMIN)
  create(@Body() dto: CreatePartDto) {
    return this.partsService.create(dto);
  }

  @Get() 
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  findAll(@Query() query: PaginationDto) {
    return this.partsService.findAll(query);
  }

  @Get(':id') 
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.partsService.findOne(id);
  }

  @Patch(':id') 
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartDto,
  ) {
    return this.partsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) 
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.partsService.remove(id);
  }
}