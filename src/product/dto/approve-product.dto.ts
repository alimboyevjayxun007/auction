import { ApiProperty } from "@nestjs/swagger";
import { ProductStatus } from "../schemas/product.schema";
import { IsEnum, IsNotEmpty } from "class-validator";

export class ApproveProductDto {
    @ApiProperty({description:"Mahsulot holati (Approved yoki Rejected)",enum:[ProductStatus.APPROVED,ProductStatus.REJECTED],example:ProductStatus.APPROVED})
    @IsNotEmpty({message:'Holat majburiy'})
    @IsEnum([ProductStatus.APPROVED,ProductStatus.REJECTED],{message:"Holat faqat APPROVED yoki REJECTED bo\'lishi mumkin"})
    status:ProductStatus.APPROVED | ProductStatus.REJECTED
}