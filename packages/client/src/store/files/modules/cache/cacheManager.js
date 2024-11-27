import { makeAutoObservable } from "mobx";

export class CacheManager {
  caches = new Map();
  cacheConfigs = new Map();
  defaultConfig = {
    maxSize: 100,
    ttl: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 60 * 1000 // 1 minute
  };

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
    this.startCleanupInterval();
  }

  // Cache Configuration
  createCache = (cacheName, config = {}) => {
    if (this.caches.has(cacheName)) {
      return;
    }

    const cacheConfig = {
      ...this.defaultConfig,
      ...config
    };

    this.caches.set(cacheName, new Map());
    this.cacheConfigs.set(cacheName, cacheConfig);
  };

  configureCache = (cacheName, config) => {
    if (!this.caches.has(cacheName)) {
      this.createCache(cacheName);
    }

    this.cacheConfigs.set(cacheName, {
      ...this.defaultConfig,
      ...this.cacheConfigs.get(cacheName),
      ...config
    });
  };

  // Cache Operations
  set = (cacheName, key, value) => {
    if (!this.caches.has(cacheName)) {
      this.createCache(cacheName);
    }

    const cache = this.caches.get(cacheName);
    const config = this.cacheConfigs.get(cacheName);

    // Enforce cache size limit
    if (cache.size >= config.maxSize) {
      this.evictOldest(cacheName);
    }

    cache.set(key, {
      value,
      timestamp: Date.now()
    });
  };

  get = (cacheName, key) => {
    const cache = this.caches.get(cacheName);
    if (!cache) return null;

    const entry = cache.get(key);
    if (!entry) return null;

    const config = this.cacheConfigs.get(cacheName);
    if (this.isExpired(entry, config)) {
      cache.delete(key);
      return null;
    }

    return entry.value;
  };

  delete = (cacheName, key) => {
    const cache = this.caches.get(cacheName);
    if (cache) {
      cache.delete(key);
    }
  };

  has = (cacheName, key) => {
    const cache = this.caches.get(cacheName);
    if (!cache) return false;

    const entry = cache.get(key);
    if (!entry) return false;

    const config = this.cacheConfigs.get(cacheName);
    if (this.isExpired(entry, config)) {
      cache.delete(key);
      return false;
    }

    return true;
  };

  // Cache Maintenance
  clear = (cacheName) => {
    if (cacheName) {
      this.caches.get(cacheName)?.clear();
    } else {
      this.caches.forEach(cache => cache.clear());
    }
  };

  invalidate = (cacheName, predicate) => {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    if (predicate) {
      for (const [key, entry] of cache.entries()) {
        if (predicate(entry.value, key)) {
          cache.delete(key);
        }
      }
    } else {
      cache.clear();
    }
  };

  evictOldest = (cacheName) => {
    const cache = this.caches.get(cacheName);
    if (!cache || cache.size === 0) return;

    let oldestKey = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  };

  // Cache Cleanup
  cleanup = () => {
    const now = Date.now();

    this.caches.forEach((cache, cacheName) => {
      const config = this.cacheConfigs.get(cacheName);
      
      for (const [key, entry] of cache.entries()) {
        if (this.isExpired(entry, config)) {
          cache.delete(key);
        }
      }
    });
  };

  startCleanupInterval = () => {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.defaultConfig.cleanupInterval);
  };

  stopCleanupInterval = () => {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  };

  // Helper Methods
  isExpired = (entry, config) => {
    return Date.now() - entry.timestamp > config.ttl;
  };

  // Cache Information
  getCacheSize = (cacheName) => {
    return this.caches.get(cacheName)?.size || 0;
  };

  getCacheConfig = (cacheName) => {
    return { ...this.cacheConfigs.get(cacheName) };
  };

  getCacheStats = (cacheName) => {
    const cache = this.caches.get(cacheName);
    if (!cache) return null;

    const config = this.cacheConfigs.get(cacheName);
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    cache.forEach(entry => {
      if (this.isExpired(entry, config)) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      totalEntries: cache.size,
      validEntries,
      expiredEntries,
      maxSize: config.maxSize,
      ttl: config.ttl,
      utilizationPercentage: (cache.size / config.maxSize) * 100
    };
  };

  // Cleanup
  dispose = () => {
    this.stopCleanupInterval();
    this.clear();
    this.caches.clear();
    this.cacheConfigs.clear();
  };
}

export default CacheManager;
