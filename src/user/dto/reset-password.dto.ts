import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty({ description: 'Foydalanuvchi emaili', example: 'test@example.com' })
    @IsNotEmpty({ message: 'Email majburiy' })
    @IsEmail({}, { message: 'Yaroqli email kiriting' })
    email: string;

    @ApiProperty({ description: 'Emailga yuborilgan OTP kodi', example: '123456' })
    @IsNotEmpty({ message: 'OTP majburiy' })
    @IsString({ message: 'OTP matn bo\'lishi kerak' })
    @Length(6, 6, { message: 'OTP 6 xonali bo\'lishi kerak' })
    otp: string;


    @ApiProperty({ description: 'Yangi parol', example: 'NewStrongPassword456' })
    @IsNotEmpty({ message: 'Yangi parol majburiy' })
    @IsString({ message: 'Yangi parol matn bo\'lishi kerak' })
    @MinLength(8, { message: 'Yangi parol kamida 8 ta belgidan iborat bo\'lishi kerak' })
    @MaxLength(30, { message: 'Yangi parol ko\'pi bilan 30 ta belgidan iborat bo\'lishi kerak' })
    newPassword: string;
}