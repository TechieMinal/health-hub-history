/**
 * Redis config with in-memory fallback.
 * Set REDIS_ENABLED=true in .env to use a real Redis server.
 * Otherwise an in-process Map is used — fine for development / single-server deploys.
 */
const logger = require("../utils/logger");

// ── In-memory fallback ────────────────────────────────────────
const memStore = new Map();

const inMemoryCache = {
  async get(key) {
    const entry = memStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      memStore.delete(key);
      return null;
    }
    return entry.value;
  },
  async set(key, value, ttlSeconds) {
    memStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return "OK";
  },
  async del(key) {
    memStore.delete(key);
    return 1;
  },
};

// ── Redis client ──────────────────────────────────────────────
let cache = inMemoryCache;
let redisClient = null;

const connectRedis = async () => {
  if (process.env.REDIS_ENABLED !== "true") {
    logger.info("ℹ️  Redis disabled — using in-memory cache");
    return;
  }

  try {
    const Redis = require("ioredis");
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => (times > 3 ? null : times * 500),
    });

    await redisClient.connect();
    logger.info("✅  Redis connected");

    // Wrap Redis with the same interface as our in-memory cache
    cache = {
      async get(key) {
        const val = await redisClient.get(key);
        try { return val ? JSON.parse(val) : null; } catch { return val; }
      },
      async set(key, value, ttlSeconds) {
        const str = typeof value === "string" ? value : JSON.stringify(value);
        if (ttlSeconds) return redisClient.set(key, str, "EX", ttlSeconds);
        return redisClient.set(key, str);
      },
      async del(key) {
        return redisClient.del(key);
      },
    };
  } catch (err) {
    logger.warn(`⚠️  Redis unavailable (${err.message}) — falling back to in-memory cache`);
  }
};

module.exports = { cache, connectRedis, getRedisClient: () => redisClient };
