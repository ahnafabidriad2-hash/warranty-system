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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RepairsService } from './repairs.service';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { CompleteRepairDto } from './dto/complete-repair.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiPaginated } from '../common/decorators/api-paginated.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Repairs')
@ApiBearerAuth() // Swagger er Authorize button er token ei route gulo te jabe
@UseGuards(JwtAuthGuard, RolesGuard) // age token check (401), tarpor role check (403)
@Controller('repairs')
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'List repairs with pagination (Admin, Technician)' })
  @ApiPaginated('Repairs, newest first')
  findAll(@Query() query: PaginationDto) {
    return this.repairsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Get one repair with its claim, technician and parts (Admin, Technician)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.repairsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign a technician to an approved claim (Admin)' })
  create(@Body() dto: CreateRepairDto) {
    return this.repairsService.create(dto);
  }

  @Post(':id/complete')
  // POST default e 201 dey. Eta notun kichu banay na, tai 200.
  @HttpCode(200)
  @Roles(Role.TECHNICIAN)
  @ApiOperation({ summary: 'Complete own repair: use parts, reduce stock, resolve the claim (Technician)' })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteRepairDto,
    @CurrentUser() user: AuthenticatedUser, // login kora user (token theke)
  ) {
    return this.repairsService.complete(id, dto, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Change technician (Admin), notes or status (Admin, own Technician)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRepairDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.repairsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a repair that is not completed (Admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.repairsService.remove(id);
  }
}