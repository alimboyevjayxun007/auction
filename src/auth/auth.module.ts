import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports:[UserModule,PassportModule,
    JwtModule.registerAsync({
      imports:[ConfigModule],
      useFactory:async (configService:ConfigService)=>({
        secret:configService.get<string>('JWT_SECRET'),
        signOptions:{expiresIn:configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION')},
      }),
      inject:[ConfigService]
    }),
  ],
  controllers: [],
  providers: [JwtStrategy],
  exports:[JwtModule,PassportModule]
})
export class AuthModule {}
