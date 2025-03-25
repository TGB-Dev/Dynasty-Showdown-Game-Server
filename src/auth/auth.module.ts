import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { DbUser, DbUserSchema } from '../schemas/dbUser.schema';
import { globalConfigs } from '../constants/globalConfig.const';

@Module({
  imports: [
    JwtModule.register({ secret: globalConfigs.jwtSecret }),
    MongooseModule.forFeature([
      {
        name: DbUser.name,
        schema: DbUserSchema,
      },
    ]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
