import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // <--- Add this
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <--- Add this
})
export class PrismaModule {}