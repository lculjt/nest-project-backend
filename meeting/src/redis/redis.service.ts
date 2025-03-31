import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
    @Inject('REDIS_SERVICE')
    private readonly redis: RedisClientType;

    async get(key: string) {
        return await this.redis.get(key);
    }

    async set(key: string, value: string | number, expiresIn?: number) {
        await this.redis.set(key, value);

        if (expiresIn) {
            await this.redis.expire(key, expiresIn);
        }
    }
}
