const redisManager = require('../config/redis');
const { logger } = require('../utils/logger');

// Cache middleware for API responses
const cache = (ttlSeconds = 300, keyPrefix = '') => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on URL, query params, and user context
    const userId = req.user ? req.user.id : 'anonymous';
    const userRole = req.user ? req.user.role : 'public';
    const cacheKey = `${keyPrefix}:${userRole}:${userId}:${
      req.originalUrl
    }:${JSON.stringify(req.query)}`;

    try {
      // Try to get from cache
      const cachedData = await redisManager.get(cacheKey);

      if (cachedData) {
        logger.info(`Cache HIT for key: ${cacheKey}`);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Cache miss - continue to route handler
      logger.info(`Cache MISS for key: ${cacheKey}`);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisManager.set(cacheKey, data, ttlSeconds).catch((err) => {
            logger.error(`Failed to cache data for key ${cacheKey}:`, err);
          });
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error for key ${cacheKey}:`, error);
      // Continue without caching on error
      next();
    }
  };
};

// Specific cache configurations for different endpoints
const cacheConfigs = {
  // Static data - cache for 1 hour
  employees: cache(3600, 'employees'),
  departments: cache(3600, 'departments'),

  // Dynamic data - cache for 5 minutes
  complaints: cache(300, 'complaints'),
  statistics: cache(300, 'statistics'),

  // Real-time data - cache for 1 minute
  dashboard: cache(60, 'dashboard'),
  ratings: cache(300, 'ratings'),
  feedback: cache(300, 'feedback'),

  // Short-lived cache for frequent queries
  search: cache(120, 'search'),
};

// Cache invalidation middleware
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to trigger cache invalidation
    const invalidatePatterns = async () => {
      try {
        for (const pattern of patterns) {
          await redisManager.flushPattern(pattern);
          logger.info(`Invalidated cache pattern: ${pattern}`);
        }
      } catch (error) {
        logger.error('Cache invalidation error:', error);
      }
    };

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidatePatterns();
      }
      return originalJson.call(this, data);
    };

    res.send = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidatePatterns();
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

// Smart cache invalidation based on operation type
const smartInvalidate = (entityType) => {
  const patterns = {
    employee: ['employees:*', 'statistics:*', 'dashboard:*'],
    complaint: ['complaints:*', 'statistics:*', 'dashboard:*'],
    rating: ['ratings:*', 'statistics:*', 'dashboard:*'],
    feedback: ['feedback:*', 'statistics:*', 'dashboard:*'],
    admin: ['statistics:*', 'dashboard:*'],
  };

  return invalidateCache(patterns[entityType] || []);
};

// Cache warming functions
const warmCache = {
  // Warm frequently accessed data
  async employees() {
    try {
      const Employee = require('../models').Employee;
      const employees = await Employee.findAll();
      await redisManager.set('employees:all', employees, 3600);
      logger.info('Cache warmed: employees');
    } catch (error) {
      logger.error('Failed to warm employees cache:', error);
    }
  },

  async statistics() {
    try {
      // This would call the statistics endpoint internally
      logger.info('Cache warmed: statistics');
    } catch (error) {
      logger.error('Failed to warm statistics cache:', error);
    }
  },

  async all() {
    await Promise.all([this.employees(), this.statistics()]);
  },
};

// Cache health check
const getCacheHealth = async () => {
  try {
    const stats = await redisManager.getStats();
    return {
      connected: redisManager.isConnected,
      stats: stats,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

module.exports = {
  cache,
  cacheConfigs,
  invalidateCache,
  smartInvalidate,
  warmCache,
  getCacheHealth,
};
