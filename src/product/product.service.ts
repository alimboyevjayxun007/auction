import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument, ProductStatus } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/user/schemas/user.schema';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
import { ApproveProductDto } from './dto/approve-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name)

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,) { }

  async createProduct(createProductDto: CreateProductDto, user: UserDocument): Promise<Product> {
    this.logger.log(`User ${user.email} attempting to create product:${createProductDto.name}`)

    const newProduct = new this.productModel({
      ...createProductDto,
      owner: user.id,
      status: ProductStatus.PENDING,
      currentPrice: createProductDto.initialPrice,

    })

    try {
      const savedProduct = await newProduct.save()
      this.logger.log(`Product ${savedProduct.name} created by ${user.email}. Status pending`)
      return savedProduct
    } catch (error) {
      this.logger.error(`Failed to create Product for user ${user.email}: ${error.message}`, error.stack)
      throw new BadRequestException("Mahsulot yaratishda xatolik yuz berdi ")
    }
  }

  async getAllProducts(filterDto: GetProductsFilterDto): Promise<Product[]> {
    this.logger.log(`Fetching all products with filters`)
    const { search, minPrice, maxPrice, status, sortBy, startDateAfter, endDateBefore } = filterDto
    const query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    if (minPrice !== undefined) {
      query.currentPrice = { ...query.currentPrice, $gte: minPrice }
    }

    if (maxPrice !== undefined) {
      query.currentPrice = { ...query.currentPrice, $lte: maxPrice }
    }

    if (status) {
      query.status = status
    }

    if (startDateAfter) {
      query.startDate = { ...query.startDate, $gte: new Date(startDateAfter) }
    }

    if (endDateBefore) {
      query.endDate = { ...query.endDate, $lte: new Date(endDateBefore) }
    }

    const sortOptions = {}
    if (sortBy) {
      const [field, order] = sortBy.split(':')
      sortOptions[field] = order === 'desc' ? -1 : 1
    } else {
      sortOptions['createdAt'] = -1 //eng yangilarini birinchi ko'rsatish 
    }
    try {
      //populate('owner') orqali ma'lumotlarni ham olamiz 
      const products = await this.productModel.find(query).sort(sortOptions).populate('owner', 'name email').exec()
      this.logger.log(`Found ${products.length} products`)
      return products
    } catch (error) {
      this.logger.error(`Error fetching products:${error.message}`, error.stack)
      throw new InternalServerErrorException('Mahsulotlarni olishda xatolik yuz berdi ')
    }
  }

  async getProductById(id: string): Promise<Product> {
    this.logger.log(`fetching product by id:${id}`)
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Noto\'g\'ri mahsulot ID si ')
    }

    const product = await this.productModel.findById(id).populate('owner', 'name email').populate('approvedBy', 'name email').exec()
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found `)
      throw new NotFoundException("Mahsulot topilmadi ")
    }
    return product
  }
  async updateProduct(id: string, updateProductDto: UpdateProductDto, user: UserDocument): Promise<Product> {
    this.logger.log(`User ${user.email} attempting to update product  ID :  ${id}`)
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Noto\'g\'ri mahsulot IDsi ")
    }

    const product = await this.productModel.findById(id)
    if (!product) {
      this.logger.warn(`Product with ID  ${id} not found for update `)
      throw new NotFoundException("Mahsulot topilmadi ")
    }

    //Faqat mahsulot egasi o'zgartirishi mumkin 
    if (product.owner.toString() !== user.id.toString()) {
      this.logger.warn(`User ${user.email} is not authorized to update Product ID : ${id}`)
      throw new UnauthorizedException("Siz ushbu mahsulotni o'zgartirish huquqiga ega emassiz ")
    }

    //Faqat PENDING yoki REJECTED holatdagilarni o'zgartirishi mumkin 
    if (product.status === ProductStatus.APPROVED || product.status === ProductStatus.ACTIVE || product.status === ProductStatus.FINISHED) {
      this.logger.warn(`Product ID ${id} status is ${product.status} cannot by updated by user `)
      throw new BadRequestException("Tasdiqlangan yoki faol auksiondagi mahsulotni o'zgartirish mumkin emas ")
    }
    Object.assign(product, updateProductDto)

    try {
      const updatedProduct = await product.save()
      this.logger.log(`Product ${updatedProduct.name} ID: ${id} updated by ${user.email}`)
      return updatedProduct
    } catch (error) {
      this.logger.error(`Error updating product ID ${id} : ${error.message}`, error.stack)
      throw new BadRequestException("Mahsulotni yangilashda xatolik yuz berdi ")
    }
  }

  async deleteProduct(id: string, user: UserDocument): Promise<{ message: string }> {
    this.logger.log(`User ${user.email} attempting to delete product ID : ${id}`)
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Notogri mahsulot IDsi ")
    }

    const product = await this.productModel.findById(id)
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found for deletion`)
      throw new NotFoundException('Mahsulot topilmadi ')
    }

    //faqat mahsulot egasi o'chira oladi 
    if (product.owner.toString() !== user.id.toString()) {
      this.logger.warn(`User ${user.email} is not authorized to delete product ID:${id}`)
      throw new UnauthorizedException("Siz ushbu mahsulotni o'chirish huquqiga ega emassiz ")
    }

    if (product.status === ProductStatus.APPROVED || product.status === ProductStatus.ACTIVE || product.status === ProductStatus.FINISHED) {
      this.logger.warn(`Product ID ${id} status is ${product.status} cannot by updated by user `)
      throw new BadRequestException("Tasdiqlangan yoki faol auksiondagi mahsulotni o'zgartirish mumkin emas ")
    }

    try {
      await product.deleteOne() //remove o'rniga deleteOne() ishlatish 
      this.logger.log(`Product ${product.name} (ID : ${id}) deleted by ${user.email}`)
      return { message: "Mahsulot muvaffaqiyatli o'chirildi " }
    } catch (error) {
      this.logger.error(`Error deleting product ID  ${id} : ${error.message}`, error.stack)
      throw new InternalServerErrorException("Mahsulotni o'chirishda xatolik yuz berdi ")
    }
  }
  async approveProduct(
    id: string,
    approveProductDto: ApproveProductDto,
    admin: UserDocument
  ): Promise<Product> {
    this.logger.log(`Admin ${admin.email} attempting to change status of product ID ${id} to ${approveProductDto.status}`);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Noto'g'ri mahsulot IDsi");
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      this.logger.warn(`Product with ID ${id} not found for status update`);
      throw new NotFoundException("Mahsulot topilmadi");
    }

    // faqat pending holatidagi mahsulotlarni tasdiqlash yoki rad etish mumkin
    if (product.status !== ProductStatus.PENDING) {
      this.logger.warn(`Product ID ${id} is not PENDING status ${product.status}`);
      throw new BadRequestException(
        `Mahsulot allaqachon ${product.status} holatda, faqat pending holatdagilarni tasdiqlash/rad etish mumkin`
      );
    }

    product.status = approveProductDto.status;
    product.approvedBy = admin.id; // kim tasdiqlaganini yozamiz

    try {
      const updatedProduct = await product.save();
      this.logger.log(
        `Product ${updatedProduct.name} ID: ${id} status updated to ${updatedProduct.status} by admin ${admin.email}`
      );
      return updatedProduct as Product; // bu yerda endi to‘g‘ri tip
    } catch (error) {
      this.logger.error(`Error approving product ID: ${id} ${error.message}`, error.stack);
      throw new InternalServerErrorException("Mahsulot holatini yangilashda xatolik yuz berdi");
    }
  }

}