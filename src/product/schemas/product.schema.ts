import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from 'mongoose';
import { timeStamp } from "console";
import { Types } from "mongoose";
import { ref } from "process";

// export type ProductDocument = HydratedDocument<Product>;
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
    @Prop({required:true})
    name:string

    @Prop()
    description:string

    @Prop([String])
    imageUrls:string[]

    @Prop({required:true})
    initialPrice:number

    @Prop({default:0})
    currentPrice:number //hozirgi narx dastlab 0 yoki initialPricega teng bo'lishi mumkin 

    // @Prop({type:[{user:{type:Types.ObjectId,ref:'User'},bid:Number,timeStamp:Date}]})
    // bidHistory:{user:Types.ObjectId; bid:number; timestamp:Date}[]

    @Prop({enum:ProductStatus,default:ProductStatus.PENDING})
    status:ProductStatus

    @Prop({required:true})
    startDate:Date

    @Prop({required:true})
    endDate:Date

    @Prop({type:Types.ObjectId,ref:'User',required:true}) //Mahsulot egasi
    owner:Types.ObjectId

    @Prop({type:Types.ObjectId,ref:'User',default:null}) //Admin tomonidan tasdiqlangan 
    approvedBy:Types.ObjectId
}

export const ProductSchema = SchemaFactory.createForClass(Product)

