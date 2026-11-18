import {Body,Controller, Delete,Get,Param,ParseUUIDPipe,Patch,Post,Query,Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { ClaimsService } from './claims.service';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@ApiTags('claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) 
@Controller('claims') 
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

@Post()
@Roles(Role.CUSTOMER)
create(
  @Body() dto: CreateClaimDto,
  @Req() req: { user: { id: string; role: Role } },
) {
  return this.claimsService.create(dto, req.user);
}

  @Get() 
  @Roles(Role.ADMIN, Role.CUSTOMER)
  findAll(@Query() query: PaginationDto) {
    return this.claimsService.findAll(query);
  }

  @Get(':id') 
  @Roles(Role.ADMIN, Role.CUSTOMER)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.findOne(id);
  }

  @Patch(':id') 
  @Roles(Role.CUSTOMER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClaimDto,
  ) {
    return this.claimsService.update(id, dto);
  }

  @Patch(':id/approve') 
   @Roles(Role.ADMIN)
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.approve(id);
  }

  @Patch(':id/reject') 
  @Roles(Role.ADMIN)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectClaimDto,
  ) {
    return this.claimsService.reject(id, dto);
  }

  @Patch(':id/assign') 
  @Roles(Role.ADMIN)
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTechnicianDto,
  ) {
    return this.claimsService.assignTechnician(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.remove(id);
  }
}