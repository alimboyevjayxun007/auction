import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, HttpStatus, HttpCode, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth & Users')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name)
  constructor(private readonly userService: UserService) { }

  @Post('register')
  @ApiOperation({ summary: "Yangi foydalanuvchini ro\'yhatdan o\'tkazish " })
  @ApiOkResponse({ description: "Ro\'yhatdan o\'tish muvvafaqiyatli . OTP emailingizga yuborildi" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Email allaqachon ro\'yhatdan o\'tgan validatsiya  xatosi " })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: "Server xatosi " })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<{ message: string }> {
    this.logger.log(`Register endpoint called`)
    return this.userService.register(registerUserDto)
  }
  @Post('verify')
  @ApiOperation({ summary: 'OTP (One-Time Password) orqali emailni tasdiqlash' })
  @ApiOkResponse({ description: 'Email muvaffaqiyatli tasdiqlandi.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Noto\'g\'ri OTP yoki muddati tugagan.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Foydalanuvchi topilmadi.' })
  async verifyOtp(@Body() verifyOtpDto: VerifyUserDto): Promise<{ message: string }> {
    this.logger.log('Verify OTP endpoint called.');
    return this.userService.verifyOtp(verifyOtpDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Foydalanuvchini tizimga kiritish (Login)" })
  @ApiOkResponse({
    description: "Muvaffaqiyatli tizimga kirildi ",
    schema: {
      example: {
        message: "Muvaffaqiyatli tizimga kirdingiz ",
        user: {
          id: "60c72b2f9b1e8e001c8a1b2d",
          name: "Test User",
          email: "test@example.com",
          role: "USER",
          isVerified: true
        },
        accessToken: "eyJhbGciOiJIUzI1Ni...",
        refreshToken: "eyJhbGciOiJIUzI1Ni..."
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Noto\'g\'ri email yoki parol  yoki tasdiqlanmagan email " })
  async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    this.logger.log('Login endpoint called.')
    const result = await this.userService.login(loginUserDto, res)
    return result
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary:"Foydalanuvchini tizimdan chiqarish(Logout)"})
  @ApiOkResponse({description:"Muvaffaqiyatli tizimdan chiqildi "})
  logout(@Res({passthrough:true}) res:Response):{message:string} {
    this.logger.log('Logout endpoint called')
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    return {message:"Tizimdan muvaffaqiyatli chiqdingiz"}
  }

   @Post('forgot-password')
  @ApiOperation({ summary: 'Parolni tiklash uchun so\'rov yuborish' })
  @ApiOkResponse({ description: 'Parolni tiklash kodi emailingizga yuborildi.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Foydalanuvchi topilmadi.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Email yuborishda xatolik.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    this.logger.log('Forgot password endpoint called.');
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Yangi parol o\'rnatish' })
  @ApiOkResponse({ description: 'Parolingiz muvaffaqiyatli tiklandi.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Noto\'g\'ri OTP yoki muddati tugagan.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Foydalanuvchi topilmadi.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    this.logger.log('Reset password endpoint called.');
    return this.userService.resetPassword(resetPasswordDto);
  }

}
