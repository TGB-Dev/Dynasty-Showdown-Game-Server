import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { UserRole } from './common/enum/roles.enum';
import { INestApplicationContext } from '@nestjs/common';
import { RokMatrixState } from './schemas/rok/rokMatrixState.schema';

// Ring 0 starts from the center of the matrix
// And increases as the cell is becoming farther from the center
// prettier-ignore
const ROK_RING_DEPTH = [
  4, 4, 4, 4, 4, 4, 4, 4, 4,
  4, 3, 3, 3, 3, 3, 3, 3, 4,
  4, 3, 2, 2, 2, 2, 2, 3, 4,
  4, 3, 2, 1, 1, 1, 2, 3, 4,
  4, 3, 2, 1, 0, 1, 2, 3, 4,
  4, 3, 2, 1, 1, 1, 2, 3, 4,
  4, 3, 2, 2, 2, 2, 2, 3, 4,
  4, 3, 3, 3, 3, 3, 3, 3, 4,
  4, 4, 4, 4, 4, 4, 4, 4, 4,
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  await seedUsers(app);
  await seedRokMatrix(app);

  console.log('Database seeding successfully!');

  await app.close();
}

async function seedUsers(app: INestApplicationContext) {
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const seedUsers: User[] = [
    {
      username: 'admin',
      password: 'admin',
      teamName: 'TGB | Dynasty Showdown',
      role: UserRole.ADMIN,
    },
  ];

  await userModel.deleteMany({});

  await userModel.insertMany(seedUsers);
}

async function seedRokMatrix(app: INestApplicationContext) {
  const rokMatrixStateModel = app.get<Model<RokMatrixState>>(getModelToken(RokMatrixState.name));

  const seedMatrix: RokMatrixState[] = Array.from({ length: 81 }, (_, i) => {
    return {
      cityId: i,
      points: calculatePoints(i),
      owner: undefined,
    };
  });

  await rokMatrixStateModel.deleteMany({});

  await rokMatrixStateModel.insertMany(seedMatrix);
}

function calculatePoints(i: number) {
  const cellRing = ROK_RING_DEPTH[i];
  switch (cellRing) {
    case 4:
      return 10;
    case 3:
      return 10;
    case 2:
      return 20;
    case 1:
      return 35;
    case 0:
      return 75;
    default:
      throw new Error('Unsupported range');
  }
}

void bootstrap();
