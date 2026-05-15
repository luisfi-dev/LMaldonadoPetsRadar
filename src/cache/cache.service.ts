import { Injectable } from '@nestjs/common';

import Redis from 'ioredis';

import { env } from 'src/config/env';
import { logger } from 'src/config/logger';

@Injectable()
export class CacheService {
  private readonly redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  });

  async get<T>(key: string): Promise<T | null> {
    logger.info(`Cache: iniciando lectura de la clave "${key}"`);
    const data = await this.redis.get(key);
    if (!data) {
      logger.info(`Cache: no se encontraron registros para la clave "${key}"`);
      return null;
    }

    const object = JSON.parse(data) as T;
    const count = Array.isArray(object) ? object.length : 1;
    logger.info(
      `Cache: lectura exitosa de la clave "${key}" (${count} registro(s))`,
    );
    return object;
  }

  async set(key: string, value: any) {
    const count = Array.isArray(value) ? value.length : 1;
    const json = JSON.stringify(value);
    await this.redis.set(key, json);
    logger.info(
      `Cache: guardado en la clave "${key}" (${count} registro(s))`,
    );
  }

  async delete(key: string) {
    await this.redis.del(key);
    logger.info(`Cache: limpiada la clave "${key}"`);
  }
}
