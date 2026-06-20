import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkOrder } from './work-orders/entities/work-order.entity';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';



@Module({
  imports: [ 
    ConfigModule.forRoot({
    isGlobal: true,
  }),
  AuthModule, 
  UsersModule, 
  WorkOrder, 
  HealthModule, 
  PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
