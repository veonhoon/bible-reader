import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery } from '@tanstack/react-query';
import { BibleChapter } from '@/mocks/bibleData';
import { fetchChapter, clearBibleCache, getCacheSize, getCurrentBibleVersion, setCurrentBibleVersion } from '@/services/bibleApi';
import { useLanguage } from '@/contexts/LanguageContext';

interface BibleContextValue {
  clearCache: () => Promise<void>;
  cacheSize: number;
  refreshCacheSize: () => Promise<void>;
  bibleVersion: string;
}

export const [BibleProvider, useBible] = createContextHook<BibleContextValue>(() => {
  const [cacheSize, setCacheSize] = useState(0);
  const { language } = useLanguage();
  
  // Set Bible version based on language
  const bibleVersion = language === 'ko' ? 'KRV' : 'NIV';
  
  useEffect(() => {
    setCurrentBibleVersion(bibleVersion);
  }, [bibleVersion]);

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
    bibleVersion,
  };
});

export function useChapter(bookId: string, chapter: number) {
  const { language } = useLanguage();
  const version = language === 'ko' ? 'KRV' : 'NIV';
  
  // Set version before fetch
  useEffect(() => {
    setCurrentBibleVersion(version);
  }, [version]);
  
  return useQuery<BibleChapter, Error>({
    // Include version in queryKey so it refetches when language changes
    queryKey: ['chapter', bookId, chapter, version],
    queryFn: async () => {
      console.log(`[useChapter] Fetching ${bookId} chapter ${chapter} (${version})`);
      // Ensure version is set before fetching
      setCurrentBibleVersion(version);
      const data = await fetchChapter(bookId, chapter);
      console.log(`[useChapter] Successfully loaded ${data.verses.length} verses`);
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: 2,
  });
}
