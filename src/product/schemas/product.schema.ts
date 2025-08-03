import { Schema } from "@nestjs/mongoose";

export type ProductDocument = Product & Document


export enum ProductStatus {
    PENDING = 'PENDING', //foydalanuvchi tomonidan kiritilgan admin tasdiqlashi kerak 
    APPROVED = 'APPROVED', // admin tomonidan tasdiqlangan , hali boshlanmagan 
    REJECTED = 'REJECTED', // admin tomonidan rad etilgan 
    ACTIVE = 'ACTIVE', // auksion faol , takliflar qabul qilinmoqda 
    FINISHED = 'FINISHED', // auksion tugagan   
}

@Schema({timestamps:true})
export class Product {

}
