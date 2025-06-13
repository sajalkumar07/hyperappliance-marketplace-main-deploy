import Redis from 'ioredis';

// Add Redis to the NodeJS global type
declare global {
  var redis: Redis | undefined;
}

// Initialize Redis client with fallback to localhost
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a new Redis instance
export const redis = global.redis || new Redis(redisUrl);

// In development, preserve the Redis instance across hot-reloads
if (process.env.NODE_ENV !== 'production') {
  global.redis = redis;
}

export default redis; 