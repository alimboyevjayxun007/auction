import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString, IsUrl, Max, MaxLength, Min } from "class-validator";

export class CreateProductDto {
    @ApiProperty({ description: 'mahsulot nomi ', example: 'Samsung S24 Ultra' })
    @IsNotEmpty({ message: 'Mahsulot nomi majburiy ' })
    @IsString({ message: 'Mahsulot nomi String bo\'lishi kerak ' })
    @MaxLength(100, { message: "Mahsulot nomi 100 belgidan oshmasligi kerak " })
    name: string

    @ApiProperty({ description: 'Mahsulot tavsifi ', example: "Yangi telefon ajoyib camera va batareya quvvati" })
    @IsString({ message: 'Tavsif Matn bo\'lishi kerak ' })
    @MaxLength(500, { message: "Tavsif 500 belgidan oshmasligi kerak " })
    description: string

    @ApiProperty({description:'Mahsulot rsamlari URL manzillari massivi ',example:['http://example.com/img1','http://example.com/img2']})
    @IsArray({message:'Rasmlar massiv bo\'lishi kerak '})
    @IsUrl({},{each:true,message:'Har bir rasm URL manzili yaroqli bo\'lishi kerak '})
    @IsNotEmpty({message:"Kamida bitta rasm URL manzilli majburiy "})
    imageUrls:string[]

    @ApiProperty({ description: "Boshlang\'ich auksion narxi ", example: 1000 })
    @IsNotEmpty({ message: "Boshlang\'ich narx majburiy " })
    @IsNumber({}, { message: 'Boshlang\'ich narx Number bo\'lishi kerak ' })
    @Min(0, { message: "Boshlang\'ich narx manfiy bo\'lmasligi kerak " })
    initialPrice: number

    @ApiProperty({description:"Auksion boshlanish vaqti va sanasi (ISO 8601 formatida)  ",example:"2025-08-05T10:00:00Z"})
    @IsNotEmpty({message:"Boshlanish sanasi majburiy"})
    @IsDateString({},{message:"Boshlanish sanasi yaroqli sana formatida bo\'lishi kerak (ISO 8601)"})
    startDate:string

    @ApiProperty({description:"Auksion tugash sanasi  va vaqti (ISO 8601) formatida "})
    @IsNotEmpty({message:"Tugash sanasi majburiy"})
    @IsDateString({},{message:"Tugash sanasi yaroqli sana formatida bo\'lishi kerak (ISO 8601 formatida)"})
    endDate:string
    

}