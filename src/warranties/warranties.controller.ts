import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';
import {
  WarrantyListResponseDto,
  WarrantyResponseDto,
} from './dto/warranty-response.dto';
import { WarrantiesService } from './warranties.service';

@ApiTags('Warranties')
@Controller('warranties')
export class WarrantiesController {
  constructor(private readonly warrantiesService: WarrantiesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a warranty' })
  @ApiResponse({
    status: 201,
    description: 'Warranty registered',
    type: WarrantyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or product is inactive',
  })
  @ApiResponse({
    status: 404,
    description: 'Product, customer, or seller not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Serial number already exists for this product',
  })
  create(@Body() dto: CreateWarrantyDto) {
    return this.warrantiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List warranties' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Paginated warranties',
    type: WarrantyListResponseDto,
  })
  findAll(@Query() pagination: PaginationDto) {
    return this.warrantiesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a warranty by id, including inactive warranties',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Warranty details',
    type: WarrantyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'The id is not a valid UUID' })
  @ApiResponse({ status: 404, description: 'Warranty not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.warrantiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace a warranty' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Warranty replaced',
    type: WarrantyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input, UUID, or inactive product',
  })
  @ApiResponse({
    status: 404,
    description: 'Warranty or related record not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Serial number already exists for this product',
  })
  replace(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateWarrantyDto,
  ) {
    return this.warrantiesService.replace(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a warranty' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Warranty updated',
    type: WarrantyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input, UUID, or inactive product',
  })
  @ApiResponse({
    status: 404,
    description: 'Warranty or related record not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Serial number already exists for this product',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWarrantyDto,
  ) {
    return this.warrantiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a warranty (soft delete)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description:
      'Warranty deactivated; repeat deletes return the inactive warranty',
    type: WarrantyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'The id is not a valid UUID' })
  @ApiResponse({ status: 404, description: 'Warranty not found' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.warrantiesService.remove(id);
  }
}
