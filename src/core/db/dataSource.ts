import { DataSource, DataSourceOptions } from 'typeorm';

import { env } from 'src/config/env';
import { LostPet } from './entities/LostPet.entity';
import { FoundPet } from './entities/FoundPet.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  entities: [LostPet, FoundPet],
  synchronize: false,
  migrations: ['dist/core/db/migrations/*'],
};

export const dataSource = new DataSource(dataSourceOptions);
