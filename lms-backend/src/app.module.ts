import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AcademicModule } from './academic/academic.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PrismaModule } from './prisma/prisma.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [AuthModule, UsersModule, AcademicModule, EnrollmentModule, WebhooksModule, PrismaModule, CoursesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
