'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  getItemKey,
  overscan = 5,
  className,
  onScroll,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => {
          const key = getItemKey ? getItemKey(item, index) : index;
          const style = {
            position: 'absolute' as const,
            top: index * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          };

          return (
            <div key={key} style={style}>
              {renderItem(item, index, style)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook for infinite scrolling
export function useInfiniteScroll(
  fetchMore: () => Promise<void>,
  hasMore: boolean,
  threshold = 100
) {
  const [isLoading, setIsLoading] = useState(false);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        setIsLoading(true);
        fetchMore().finally(() => setIsLoading(false));
      }
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [fetchMore, hasMore, isLoading, threshold]);

  return { scrollElementRef, isLoading };
}

// Memoized list item component
export const MemoizedListItem = React.memo(
  <T,>({
    item,
    index,
    renderItem,
  }: {
    item: T;
    index: number;
    renderItem: (item: T, index: number) => React.ReactNode;
  }) => {
    return <>{renderItem(item, index)}</>;
  }
);

MemoizedListItem.displayName = 'MemoizedListItem';
