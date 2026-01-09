import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery } from '@tanstack/react-query';
import { BibleChapter } from '@/mocks/bibleData';
import { fetchChapter, clearBibleCache, getCacheSize } from '@/services/bibleApi';

interface BibleContextValue {
  clearCache: () => Promise<void>;
  cacheSize: number;
  refreshCacheSize: () => Promise<void>;
}

export const [BibleProvider, useBible] = createContextHook<BibleContextValue>(() => {
  const [cacheSize, setCacheSize] = useState(0);

  const refreshCacheSizeInternal = useCallback(async () => {
    const size = await getCacheSize();
    setCacheSize(size);
  }, []);

  useEffect(() => {
    refreshCacheSizeInternal();
  }, [refreshCacheSizeInternal]);

  const clearCache = useCallback(async () => {
    await clearBibleCache();
    await refreshCacheSizeInternal();
  }, [refreshCacheSizeInternal]);

  const refreshCacheSize = refreshCacheSizeInternal;

  return {
    clearCache,
    cacheSize,
    refreshCacheSize,
  };
});

export function useChapter(bookId: string, chapter: number) {
  return useQuery<BibleChapter, Error>({
    queryKey: ['chapter', bookId, chapter],
    queryFn: async () => {
      console.log(`[useChapter] Fetching ${bookId} chapter ${chapter}`);
      const data = await fetchChapter(bookId, chapter);
      console.log(`[useChapter] Successfully loaded ${data.verses.length} verses`);
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: 2,
  });
}
