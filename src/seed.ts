import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { UserRole } from './common/enum/roles.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const seedUsers: any[] = [
    {
      username: 'admin',
      password: 'admin',
      teamName: 'TGB | Dynasty Showdown',
      role: UserRole.ADMIN,
    },
  ];

  await userModel.deleteMany({});

  await userModel.insertMany(seedUsers);
  console.log('Database seeding successfully!');

  await app.close();
}

void bootstrap();
