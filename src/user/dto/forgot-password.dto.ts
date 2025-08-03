import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty({ description: 'Foydalanuvchi emaili', example: 'test@example.com' })
    @IsNotEmpty({ message: 'Email majburiy' })
    @IsEmail({}, { message: 'Yaroqli email kiriting' })
    email: string;

}