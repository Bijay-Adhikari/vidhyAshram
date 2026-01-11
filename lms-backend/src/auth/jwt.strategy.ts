import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // IMPORTANT: This MUST match the secret in auth.module.ts
      secretOrKey: 'SUPER-SECRET-KEY', 
    });
  }

  async validate(payload: any) {
    // This function runs after the token is verified.
    // The object we return here becomes `req.user` in your controllers.
    
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role // <--- Crucial! We need to pass the Role to the Guard
    };
  }
}