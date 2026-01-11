import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;
  private defaultTtl: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTtl = options.ttl || 5 * 60 * 1000; // 5 minutes default
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for this
    };
  }

  // Preload multiple entries
  preload<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  // Get multiple entries
  getMultiple<T>(keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({
      key,
      data: this.get<T>(key),
    }));
  }

  // Set multiple entries
  setMultiple<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }
}

// Global cache instance
export const queryCache = new QueryCache({
  maxSize: 200,
  ttl: 10 * 60 * 1000, // 10 minutes
});

// Cache hook for React
export function useQueryCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(() => queryCache.get<T>(key));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { enabled = true, staleTime = 0 } = options;

  useEffect(() => {
    if (!enabled) return;

    // Check cache first
    const cachedData = queryCache.get<T>(key);
    if (cachedData && (!staleTime || Date.now() - queryCache.getStats().size < staleTime)) {
      setData(cachedData);
      return;
    }

    // Fetch fresh data
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((fetchedData) => {
        setData(fetchedData);
        queryCache.set(key, fetchedData, options.ttl);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key, fetcher, enabled, staleTime, options.ttl]);

  const refetch = useCallback(() => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    fetcher()
      .then((fetchedData) => {
        setData(fetchedData);
        queryCache.set(key, fetchedData, options.ttl);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key, fetcher, enabled, options.ttl]);

  const invalidate = useCallback(() => {
    queryCache.delete(key);
  }, [key]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
  };
}

// Periodic cleanup
setInterval(() => {
  queryCache.cleanup();
}, 60 * 1000); // Clean up every minute

export { QueryCache };
