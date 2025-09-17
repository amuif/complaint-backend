const redis = require('redis');
const { logger } = require('../utils/logger');

class RedisManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis Client Ready');
      });

      this.client.on('end', () => {
        logger.warn('⚠️ Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    }
  }

  async get(key) {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.isConnected) return false;

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async flushPattern(pattern) {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(`Redis FLUSH PATTERN error for pattern ${pattern}:`, error);
      return false;
    }
  }

  async getStats() {
    if (!this.isConnected) return null;

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace,
      };
    } catch (error) {
      logger.error('Redis STATS error:', error);
      return null;
    }
  }

  // Cache invalidation helpers
  async invalidateEmployeeCache(department = null, section = null) {
    const patterns = ['employees:*'];
    if (department) patterns.push(`employees:department:${department}:*`);
    if (section) patterns.push(`employees:section:${section}:*`);

    for (const pattern of patterns) {
      await this.flushPattern(pattern);
    }
  }

  async invalidateComplaintCache(department = null, section = null) {
    const patterns = ['complaints:*', 'statistics:*'];
    if (department) patterns.push(`complaints:department:${department}:*`);
    if (section) patterns.push(`complaints:section:${section}:*`);

    for (const pattern of patterns) {
      await this.flushPattern(pattern);
    }
  }

  async invalidateStatisticsCache() {
    await this.flushPattern('statistics:*');
    await this.flushPattern('dashboard:*');
  }
}

// Create singleton instance
const redisManager = new RedisManager();

module.exports = redisManager;
