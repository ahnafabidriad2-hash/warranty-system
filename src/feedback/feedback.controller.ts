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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @ApiOperation({ summary: 'List feedback with pagination' })
  findAll(@Query() query: PaginationDto) {
    return this.feedbackService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one feedback' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Customer gives feedback on a completed repair' })
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Change rating or comment' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.remove(id);
  }
}