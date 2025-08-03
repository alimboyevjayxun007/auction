import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {
    @ApiProperty({ description: 'Foydalanuvchi emaili', example: 'test@example.com' })
    @IsNotEmpty({ message: 'Email majburiy' })
    @IsEmail({}, { message: 'Yaroqli email kiriting' })
    email: string;

    @ApiProperty({ description: 'Foydalanuvchi paroli', example: 'StrongPassword123' })
    @IsNotEmpty({ message: 'Parol majburiy' })
    @IsString({ message: 'Parol matn bo\'lishi kerak' })
    @MinLength(8, { message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' })
    @MaxLength(30, { message: 'Parol ko\'pi bilan 30 ta belgidan iborat bo\'lishi kerak' })
    password: string;
}