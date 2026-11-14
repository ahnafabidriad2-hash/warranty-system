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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiResponse({ status: 201, description: 'Product created' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List active products' })
  @ApiResponse({ status: 200, description: 'Paginated active products' })
  findAll(@Query() pagination: PaginationDto) {
    return this.productsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product, including inactive products' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 400, description: 'The id is not a valid UUID' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace a product' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product replaced' })
  @ApiResponse({ status: 400, description: 'Invalid input or UUID' })
  @ApiResponse({
    status: 404,
    description: 'Product or related record not found',
  })
  replace(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.replace(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a product' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 400, description: 'Invalid input or UUID' })
  @ApiResponse({
    status: 404,
    description: 'Product or related record not found',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a product (soft delete)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Product deactivated' })
  @ApiResponse({ status: 400, description: 'The id is not a valid UUID' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productsService.remove(id);
  }
}
