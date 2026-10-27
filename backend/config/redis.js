import Redis from 'ioredis';

// ── Redis connection ──────────────────────────────────────────────────────────
// Falls back gracefully if Redis is not running — app still works, just no cache
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('⚠️  Redis unavailable — running without cache');
      return null; // stop retrying
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => {
  if (!err.message.includes('ECONNREFUSED')) {
    console.error('Redis error:', err.message);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null; // cache miss — safe to ignore
  }
};

export const setCache = async (key, value, ttlSeconds = 60) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // silent fail — app works without cache
  }
};

export const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch {}
};

export const deleteCachePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {}
};

export default redis;
