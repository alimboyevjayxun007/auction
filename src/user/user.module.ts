import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports:[MongooseModule.forFeature([{
    name:User.name,
    schema:UserSchema
  }]),JwtModule,MailModule,ConfigModule],
  controllers: [UserController],
  providers: [UserService],
  exports:[UserService,MongooseModule]
})
export class UserModule {}
