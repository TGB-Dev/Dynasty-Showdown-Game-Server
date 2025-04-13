import * as dotenv from 'dotenv';

dotenv.config();
export const globalConfigs = {
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dynasty-showdown2',
  serverPort: process.env.SERVER_PORT || 5001,
  jwtSecret: process.env.JWT_SECRET || 'TGBDynastyShowdownGameServerJWTSecret',
  assetsRoot: process.env.ASSETS_ROOT || '/tmp/dynasty-showdown',
};
