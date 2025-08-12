import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [AuthModule,
    ConfigModule.forRoot({envFilePath:".env",isGlobal:true}),
    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      useFactory:async (configService:ConfigService) =>({
        uri : configService.get<string>('MONGODB_URI')
      }),
      inject:[ConfigService],
    }),
    UserModule,
    MailModule,
    AuthModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
