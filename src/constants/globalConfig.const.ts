export const globalConfigs = {
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dynasty-showdown-game-server',
  serverPort: process.env.SERVER_PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'TGBDynastyShowdownGameServerJWTSecret',
};
