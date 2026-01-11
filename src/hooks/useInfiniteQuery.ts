import { useState, useEffect, useCallback, useRef } from 'react';

interface InfiniteQueryOptions<T> {
  fetchFn: (page: number) => Promise<{
    data: T[];
    hasMore: boolean;
    nextPage?: number;
  }>;
  initialPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface InfiniteQueryResult<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteQuery<T>({
  fetchFn,
  initialPage = 1,
  pageSize = 10,
  enabled = true,
}: InfiniteQueryOptions<T>): InfiniteQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(async (page: number, isRefetch = false) => {
    if (!enabled) return;

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await fetchFn(page);
      
      if (!abortControllerRef.current.signal.aborted) {
        if (isRefetch) {
          setData(result.data);
        } else {
          setData(prev => page === initialPage ? result.data : [...prev, ...result.data]);
        }
        
        setHasNextPage(result.hasMore);
        setCurrentPage(result.nextPage || page + 1);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setIsError(true);
        setError(error);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, initialPage, enabled]);

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) return;
    await fetchPage(currentPage);
  }, [fetchPage, currentPage, hasNextPage, isLoading]);

  const refetch = useCallback(async () => {
    setData([]);
    setCurrentPage(initialPage);
    setHasNextPage(true);
    await fetchPage(initialPage, true);
  }, [fetchPage, initialPage]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setHasNextPage(true);
    setIsLoading(false);
    setIsError(false);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [initialPage]);

  useEffect(() => {
    if (enabled && data.length === 0) {
      fetchPage(initialPage);
    }
  }, [fetchPage, initialPage, enabled, data.length]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
    reset,
  };
}
