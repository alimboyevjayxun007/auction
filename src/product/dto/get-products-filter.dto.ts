import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ProductStatus } from "../schemas/product.schema";

export class GetProductsFilterDto {
    @ApiProperty({ description: "mahsulot nomi bo\'yicha qidiruv ", required: false, example: "Telefon" })
    @IsOptional()
    @IsString({ message: "Qidiruv matn bo\'lishi kerak" })
    search?: string

    @ApiProperty({ description: "minimal narx ", required: false, example: 500 })
    @IsOptional()
    @Type(() => Number) //Query parametrlari string boladi shuni numberga o'tkazamiz
    @IsNumber({}, { message: "Minimal narx raqam bo\'lishi kerak " })
    @Min(0, { message: "Minimal narx manfiy bo\'lmasligi kerak " })
    minPrice?: number

    @ApiProperty({ description: "maksimal narx ", required: false, example: 2000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "maksimal narx number bo\'lishi kerak" })
    maxPrice?: number

    @ApiProperty({ description: "Mahsulot holati", required: false, enum: ProductStatus, example: ProductStatus.ACTIVE })
    @IsOptional()
    @IsEnum(ProductStatus, { message: "yaroqsiz mahsulot holati " })
    status?: ProductStatus

    @ApiProperty({ description: "Sarlavha bo\'icha saralash ", required: false, example: "name:asc" })
    @IsOptional()
    @IsString({ message: "Saralash matn bo\lishi kerak (masalan , name:asc,price:desc)" })
    sortBy?: string //name:asc,price:desc

    @ApiProperty({ description: "Auksion boshlash sanasidan keyin", required: false, example: "2025-08-01T00:00:00Z" })
    @IsOptional()
    @IsDateString({},{ message: "Yaroqli sana formati kerak" })
    startDateAfter?: Date

    @ApiProperty({description:"Auksion tugash sanasidan oldin ",required:false,example:"2025-08-01T00:00:00Z"})
    @IsOptional()
    @IsDateString({},{message:"Yaroqli sana formati kerak "})
    endDateBefore?:Date

}