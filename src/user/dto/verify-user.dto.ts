import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyUserDto {
    @ApiProperty({description:"foydalanuvchi emaili ", example:"test@gmail.com"})
    @IsNotEmpty({message:"email majburiy"})
    @IsEmail({},{message:"yaroqli email kiriting "})
    email:string

    @ApiProperty({description:"Emailga yuborilgan otp",example:"123456"})
    @IsNotEmpty({message:"bo'sh bo'lishi mumkin emas "})
    @IsString({message:"otp matn bolishi kerak "})
    @Length(6,6,{message:"otp 6 xonali bolishi kerak "})
    otp:string

}