import * as dotenv from 'dotenv';

dotenv.config();
export const globalConfigs = {
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dynasty-showdown',
  serverPort: process.env.SERVER_PORT || 5001,
  jwtSecret: process.env.JWT_SECRET || 'TGBDynastyShowdownGameServerJWTSecret',
};
