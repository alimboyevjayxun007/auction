import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule { }
