import { Injectable } from '@nestjs/common';

import Redis from 'ioredis';

import { env } from 'src/config/env';

@Injectable()
export class CacheService {
  private readonly redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  });

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;

    const object = JSON.parse(data) as T;
    return object;
  }

  async set(key: string, value: any) {
    const json = JSON.stringify(value);
    await this.redis.set(key, json);
  }

  async delete(key: string) {
    await this.redis.del(key);
  }
}
