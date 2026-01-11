import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module'; // <--- Import the Module, not the Service!

@Module({
  imports: [AuthModule], // <--- This gives UsersController access to AuthService
  controllers: [UsersController],
  providers: [], // Leave this empty for now
})
export class UsersModule {}