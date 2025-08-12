import {
  Controller, Get, Post, Body, Patch, Param, Delete, Logger,
  UseGuards, HttpStatus, Req, Query, HttpCode
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/user/schemas/user.schema';
import { Product, ProductStatus } from './schemas/product.schema';
import { Request } from 'express';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
import { ApproveProductDto } from './dto/approve-product.dto';
import { UserDocument } from 'src/user/schemas/user.schema';

@ApiTags('Products & Auctions')
@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: "Yangi auksion mahsuloti yaratish (foydalanuvchilar uchun)" })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: HttpStatus.CREATED, description: "Mahsulot muvaffaqiyatli yaratildi", type: Product })
  async createProduct(@Body() createProductDto: CreateProductDto, @Req() req: Request): Promise<Product> {
    this.logger.log(`Create product endpoint called`);
    const user = req.user as any;
    return this.productService.createProduct(createProductDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Barcha auksion mahsulotlarini olish filterlar bilan" })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'startDateAfter', required: false, type: Date })
  @ApiQuery({ name: 'endDateBefore', required: false, type: Date })
  @ApiOkResponse({ description: "Mahsulot ro'yxati", type: [Product] })
  async getAllProducts(@Query() filterDto: GetProductsFilterDto): Promise<Product[]> {
    this.logger.log("Get all products endpoint called");
    return this.productService.getAllProducts(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: "ID bo‘yicha auksion mahsulot olish" })
  @ApiParam({ name: 'id', description: 'Mahsulot IDsi' })
  @ApiOkResponse({ description: "Mahsulot ma'lumotlari", type: Product })
  async getProductById(@Param('id') id: string): Promise<Product> {
    this.logger.log(`Get product by ID endpoint called for ID: ${id}`);
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({ summary: "Mavjud auksion mahsulotlarini yangilash (Foydalanuvchilar uchun)" })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: "Mahsulot muvaffaqiyatli yangilandi", type: Product })
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: Request): Promise<Product> {
    this.logger.log(`Update product endpoint called for ID ${id}`);
    return this.productService.updateProduct(id, updateProductDto, req.user as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER,UserRole.ADMIN)

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mavjud auksion mahsulotini o‘chirish (foydalanuvchilar uchun)" })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: "Mahsulot muvaffaqiyatli o‘chirildi" })
  async deleteProduct(@Param('id') id: string, @Req() req: Request): Promise<{ message: string }> {
    this.logger.log(`Delete Product endpoint called for ID: ${id}`);
    return this.productService.deleteProduct(id, req.user as any);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Auksion mahsulot holatini o‘zgartirish (faqat adminlar uchun)" })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: "Mahsulot IDsi" })
  @ApiResponse({ status: HttpStatus.OK, description: 'Mahsulot holati muvaffaqiyatli yangilandi.', type: Product })
  async approveProduct(
    @Param('id') id: string,
    @Body() approveProductDto: ApproveProductDto,
    @Req() req: Request
  ): Promise<Product> {
    this.logger.log(`Admin product status update endpoint called for ID: ${id}`);
    const user = req.user as UserDocument;
    return this.productService.approveProduct(id, approveProductDto, user) as unknown as Product;
  }
}
