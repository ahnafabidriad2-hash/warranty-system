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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiPaginated } from '../common/decorators/api-paginated.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List feedback with pagination (Admin)' })
  @ApiPaginated('Feedback, newest first')
  findAll(@Query() query: PaginationDto) {
    return this.feedbackService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  @ApiOperation({ summary: 'Get one feedback (Admin, own Customer)' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.feedbackService.findOne(id, user);
  }

  @Post()
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Give feedback on your completed repair (Customer)' })
  create(@Body() dto: CreateFeedbackDto, @CurrentUser() user: AuthenticatedUser) {
    return this.feedbackService.create(dto, user);
  }

  @Patch(':id')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Change rating or comment of your feedback (Customer)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeedbackDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.feedbackService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  @ApiOperation({ summary: 'Delete feedback (Admin, own Customer)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.feedbackService.remove(id, user);
  }
}