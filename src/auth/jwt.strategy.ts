import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private configService: ConfigService,
        private userService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    if (req && req.cookies){
                        return req.cookies['accessToken']
                    }
                    return null
                },

            ]),
            ignoreExpiration:false,
            secretOrKey:configService.get<string>('JWT_SECRET')! // <--- Added non-null assertion
        })
    }
    async validate(payload:any){
        const user=await this.userService.findById(payload.sub)
        if(!user){
            throw new UnauthorizedException('Foydalanuvchi topilmadi ')
        }
        return {
            id:user._id,
            email:user.email,
            name:user.name,
            role:user.role,
            isVerified:user.isVerified
        }
    }
}