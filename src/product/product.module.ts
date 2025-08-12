import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Product.name,schema:ProductSchema}]),
    UserModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports:[ProductService,MongooseModule]
})
export class ProductModule {}
