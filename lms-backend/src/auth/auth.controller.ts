import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <--- Make sure this comes from PASSPORT
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // "local" refers to the Username/Password strategy
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    // req.user now contains the { id, email, role } from the database
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() req) {
    return this.authService.register(req);
  }
}