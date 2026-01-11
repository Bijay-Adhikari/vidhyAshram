import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(private authService: AuthService) {}

  // 1. Get My Profile (Any logged-in user)
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  // 2. Create a New User (ONLY ADMINS ALLOWED)
  @UseGuards(AuthGuard('jwt'), RolesGuard) // <--- Apply the Guards
  @Roles('ADMIN') // <--- Only ADMIN can access this
  @Post()
  createUser(@Body() dto: any) {
    return this.authService.register(dto);
  }
}