import 'dotenv/config';
import envVar from 'env-var';

export const env = {
  PORT: envVar.get('PORT').required().asPortNumber(),
  MAPBOX_TOKEN: envVar.get('MAPBOX_TOKEN').required().asString(),
  MAILER_EMAIL: envVar.get('MAILER_EMAIL').required().asString(),
  MAILER_PASSWORD: envVar.get('MAILER_PASSWORD').required().asString(),
  MAILER_SERVICE: envVar.get('MAILER_SERVICE').required().asString(),
  DB_HOST: envVar.get('DB_HOST').required().asString(),
  DB_PORT: envVar.get('DB_PORT').required().asPortNumber(),
  DB_USER: envVar.get('DB_USER').required().asString(),
  DB_PASSWORD: envVar.get('DB_PASSWORD').required().asString(),
  DB_NAME: envVar.get('DB_NAME').required().asString(),
  REDIS_HOST: envVar.get('REDIS_HOST').required().asString(),
  REDIS_PORT: envVar.get('REDIS_PORT').required().asPortNumber(),
};
