import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express'; // Response tipini import qilish
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { stringify } from 'querystring';


@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  async register(registerUserDto: RegisterUserDto): Promise<{ message: string }> {
    const { name, email, password } = registerUserDto
    this.logger.log(`Register attempt for email : ${email}`)

    const existingUser = await this.userModel.findOne({ email })
    if (existingUser) {
      this.logger.warn(`User with email ${email} already exists.`)
      throw new BadRequestException('ushbu email allaqachon royhatdan otgan ')
    }

    //OTP yaratish  
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    //otp amal qilish muddati 
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    const newUser = new this.userModel({
      name,
      email,
      password,
      otp,
      otpExpiry,
      isVerified: false,
      role: UserRole.USER
    })
    try {
      await newUser.save()
      await this.mailService.sendOtpEmail(email, otp)
      this.logger.log(`User email ${email} registered , OTP sent to your email `)
      return { message: "Your successfuly registered " }
    } catch (error) {
      this.logger.error(`Error registering User ${email} : ${error.message}`, error.stack)
      throw new InternalServerErrorException(`Foydalanuvchini royhatdan otkazishda xatolik yuz berdi `)
    }

  }
  async verifyOtp(verifyOtpDto: VerifyUserDto): Promise<{ message: string }> {
    const { email, otp } = verifyOtpDto
    this.logger.log(`OTP verification attempt for email ${email}`)

    const user = await this.userModel.findOne({ email })
    if (!user) {
      this.logger.warn(`User with email ${email} not found during OTP Verification `)
      throw new NotFoundException("user not found ")
    }
    if (user.isVerified) {
      this.logger.warn(`User ${email} is  already verified `)
      return { message: "email allaqachon tasdiqlangan " }
    }
    if (!user.otp || !user.otpExpiry) {
      this.logger.warn(`No OTP found or expired for user ${email}`)
      throw new BadRequestException("otp topilmadi yoki muddati tugagan iltimos qaytadan royhatdan oting yoki parolni tiklashga urinib koring ")

    }
    if (user.otp !== otp) {
      this.logger.warn(`Invalid OTP provided for user ${email}`)
      throw new BadRequestException('Noto\'g\'ri OTP kodi ')

    }
    if (new Date() > user.otpExpiry) {
      this.logger.warn(`OTP expired for user ${email}`)
      throw new BadRequestException('OTP muddati tugagan iltimos qaytadan urinib ko\'ring')
    }
    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()
    this.logger.log(`User ${email} successfully verified.`)
    return { message: "emailingiz muvaffaqiyatli tasdiqlandi. Endi tizimga kirishingiz mumkin! " }

  }

  async login(loginUserDto: LoginUserDto, res: Response): Promise<{ message: string, user: any, accessToken: string, refreshToken: string }> {
    const { email, password } = loginUserDto
    this.logger.log(`Login attempt for email :  ${email}`)

    const user = await this.userModel.findOne({ email })
    if (!user) {
      this.logger.warn(`User with email ${email} not found during login`)
      throw new UnauthorizedException(`Noto\'g\'ri email yoki parol `)
    }
    if (!user.isVerified) {
      this.logger.warn(`User ${email} is not verified !`)
      throw new UnauthorizedException('Iltimos avval emailingizni tasdiqlang !')

    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      this.logger.warn(`Incorrect password for user ${email}`)
      throw new UnauthorizedException('Noto\'g\'ri email yoki parol .')
    }

    //Access token yaratish 
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified
    }
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION')

    })

    //Refresh token yaratish 
    const refreshToken = this.jwtService.sign({ sub: user._id }, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION')
    })

    //Tokenlarni cookiega saqlash 
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 //7 kun
    })
    this.logger.log(`User ${email} logged in successfully`)
    return {
      message: `Muvaffaqiyatli tizimga kirdingiz ,`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      accessToken,
      refreshToken

    }

  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto
    this.logger.log(`Forgot password attempt for email  ${email}`)
    const user = await this.userModel.findOne({ email })
    if (!user) {
      this.logger.warn(`User with email ${email} not found during forgot password `)
      throw new NotFoundException('Ushbu email bilan foydalanuvchi topilmadi ')
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    try {
      await this.mailService.sendOtpEmail(email, otp)
      this.logger.log(`Forgot password OTP send to ${email}`)
      return { message: "Parolni tiklash uchun otp emailingizga yuborildi " }
    } catch (error) {
      this.logger.error(`Error sending forgot password OTP to ${email}:${error.message}`, error.stack)
      throw new InternalServerErrorException('Parolni tiklash  kodini yuborishda xatolik yuz berdi ')
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = resetPasswordDto
    this.logger.log(`Reset password attempt for email ${email}`)

    const user = await this.userModel.findOne({ email })
    if (!user) {
      this.logger.warn(`User with email ${email} not found during password reset.`)
      throw new NotFoundException('Foydalanuvchi topilmadi !')
    }

    if (!user.otp || !user.otpExpiry) {
      this.logger.warn(`No otp found or expired for user ${email} during password reset`)
      throw new BadRequestException('Parolni tiklash kodi topilmadi yoki muddati tugagan . Iltimos qaytadan so\'rov yuboring ')
    }

    if (user.otp !== otp) {
      this.logger.warn(`Invalid OTP provided for user ${email} during password reset`)
      throw new BadRequestException('Noto\'g\'ri OTP kodi ')
    }

    if (new Date() > user.otpExpiry) {
      this.logger.warn(`OTP expired for user ${email} during password reset `)
      throw new BadRequestException('OTP muddati tugagan iltimos qaytadan urinib ko\'ring')
    }

    user.password = newPassword
    user.otp = null
    user.otpExpiry = null
    user.isVerified = true
    await user.save()
    this.logger.log(`Password reset successfully for user ${email}.`)
    return { message: "Parolingiz muvaffaqiyatli tiklandi. Endi yangi parol bilan tizimga kirishingiz mumkin " }

  }
  async findById(id: string): Promise < UserDocument | null > {
     return this.userModel.findById(id).exec();
   }

}
