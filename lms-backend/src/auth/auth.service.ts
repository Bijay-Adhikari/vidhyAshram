import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import * as crypto from 'crypto'; 

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const sessionId = crypto.randomUUID(); 
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { currentSessionId: sessionId },
    });

    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
      sessionId: sessionId 
    };

    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async register(dto: any) {
    const hash = await bcrypt.hash(dto.password, 10);
    
    // FIX: Changed TEACHER to TUTOR to match your database
    let userRole: Role = Role.STUDENT; 

    if (dto.role === 'ADMIN') {
        userRole = Role.ADMIN;
    } else if (dto.role === 'TUTOR') { // <--- UPDATED HERE
        userRole = Role.TUTOR;     // <--- UPDATED HERE
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        fullName: dto.fullName,
        role: userRole, 
      },
    });
    
    const { passwordHash, ...result } = user;
    return result;
  }
}