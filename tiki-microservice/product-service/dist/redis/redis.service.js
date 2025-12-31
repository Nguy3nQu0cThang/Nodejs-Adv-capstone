"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    client;
    logger = new common_1.Logger(RedisService_1.name);
    isConnected = false;
    async onModuleInit() {
        try {
            this.client = new ioredis_1.default({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                retryStrategy: (times) => {
                    if (times > 3) {
                        this.logger.warn('Redis retry limit reached, running without cache');
                        return null;
                    }
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                lazyConnect: true,
            });
            this.client.on('connect', () => {
                this.isConnected = true;
                this.logger.log('✅ Redis connected successfully');
            });
            this.client.on('error', (err) => {
                this.isConnected = false;
                this.logger.warn('⚠️ Redis connection error (running without cache):', err.message);
            });
            this.client.on('close', () => {
                this.isConnected = false;
                this.logger.warn('⚠️ Redis connection closed');
            });
            await this.client.connect();
        }
        catch (error) {
            this.logger.warn('⚠️ Redis initialization failed, service will run without cache:', error.message);
            this.isConnected = false;
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
    async get(key) {
        if (!this.isConnected) {
            return null;
        }
        try {
            return await this.client.get(key);
        }
        catch (error) {
            this.logger.error(`Redis GET error for key ${key}, returning null:`, error.message);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.isConnected) {
            return;
        }
        try {
            if (ttl) {
                await this.client.setex(key, ttl, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
            this.logger.error(`Redis SET error for key ${key}:`, error.message);
        }
    }
    async del(key) {
        if (!this.isConnected) {
            return;
        }
        try {
            await this.client.del(key);
        }
        catch (error) {
            this.logger.error(`Redis DEL error for key ${key}:`, error);
        }
    }
    async delPattern(pattern) {
        if (!this.isConnected) {
            return;
        }
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        }
        catch (error) {
            this.logger.error(`Redis DEL pattern error for ${pattern}:`, error);
        }
    }
    getStatus() {
        return this.isConnected;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map