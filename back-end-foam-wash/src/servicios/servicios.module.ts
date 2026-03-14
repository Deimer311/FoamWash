import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';


@Module({
  controllers: [ServiciosController],
  providers: [ServiciosService],
})
export class ServiciosModule {}