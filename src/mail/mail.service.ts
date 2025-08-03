import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';
import { from } from 'rxjs';
@Injectable()
export class MailService {
    private transporter: Mail
    private readonly logger = new Logger(MailService.name)

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: this.configService.get<string>('EMAIL_SERVICE'),
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS')
            },

        })
        this.logger.log('Nodemailer transporter configured.')
    }
    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const mailOptionss = {
            from: this.configService.get<string>('EMAIL_USER'),
            to: to,
            subject: 'Auksion platformasi email tasdiqlash kodingiz ',
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #0056b3;">Salom!</h2>
                        <p>Auksion platformasida ro'yxatdan o'tishni yakunlash uchun quyidagi tasdiqlash kodidan foydalaning:</p>
                        <h3 style="background-color: #f2f2f2; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; color: #d9534f;">${otp}</h3>
                        <p>Ushbu kod 5 daqiqa ichida amal qiladi. Agar siz bu so'rovni yubormagan bo'lsangiz, ushbu emailni e'tiborsiz qoldiring.</p>
                        <p>Hurmat bilan,<br/>Auksion Platformasi Jamoasi</p>
                    </div>`,
        }
        try {
            await this.transporter.sendMail(mailOptionss)
            this.logger.log(`OTP email send to ${to}`)

        }
        catch (error) {
            this.logger.log(`Falied to send OTP email to ${to} : ${error.message}`, error.stack)
            throw new Error('Email yuborishda xatolik yuz berdi . Iltimos keyinroq urinib ko\'ring ')
        }
    }
}
