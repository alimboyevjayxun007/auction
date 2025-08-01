import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [AuthModule,
    ConfigModule.forRoot({envFilePath:".env",isGlobal:true}),
    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      useFactory:async (configService:ConfigService) =>({
        uri : configService.get<string>('MONGODB_URI')
      }),
      inject:[ConfigService],
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
