import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { getBook } from '@/mocks/bibleData';

const READING_PROGRESS_KEY = 'reading_progress';
const SESSION_KEY = 'reading_session';

interface ReadingProgress {
  bookId: string;
  bookName: string;
  chapter: number;
  timestamp: number;
  sessionActive: boolean;
}

interface ReadingProgressContextType {
  lastRead: ReadingProgress | null;
  isLoading: boolean;
  saveProgress: (bookId: string, chapter: number) => void;
  clearProgress: () => void;
  shouldAutoNavigate: boolean;
  markSessionEnded: () => void;
}

export const [ReadingProgressProvider, useReadingProgress] = createContextHook<ReadingProgressContextType>(() => {
  const [lastRead, setLastRead] = useState<ReadingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldAutoNavigate, setShouldAutoNavigate] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      console.log('[ReadingProgress] Loading saved progress...');
      const stored = await AsyncStorage.getItem(READING_PROGRESS_KEY);
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      
      if (stored) {
        const progress: ReadingProgress = JSON.parse(stored);
        console.log('[ReadingProgress] Found saved progress:', progress);
        setLastRead(progress);

        const now = Date.now();
        const timeSinceLastRead = now - progress.timestamp;
        const thirtyMinutes = 30 * 60 * 1000;

        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session.active && timeSinceLastRead < thirtyMinutes) {
            console.log('[ReadingProgress] Session still active, should auto-navigate');
            setShouldAutoNavigate(true);
          }
        }
      }
    } catch (error) {
      console.error('[ReadingProgress] Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = useCallback(async (bookId: string, chapter: number) => {
    try {
      const book = getBook(bookId);
      if (!book) {
        console.warn('[ReadingProgress] Book not found:', bookId);
        return;
      }

      const progress: ReadingProgress = {
        bookId,
        bookName: book.name,
        chapter,
        timestamp: Date.now(),
        sessionActive: true,
      };

      console.log('[ReadingProgress] Saving progress:', progress);
      await AsyncStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ active: true, timestamp: Date.now() }));
      setLastRead(progress);
      setShouldAutoNavigate(false);
    } catch (error) {
      console.error('[ReadingProgress] Error saving progress:', error);
    }
  }, []);

  const markSessionEnded = useCallback(async () => {
    try {
      console.log('[ReadingProgress] Marking session as ended');
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ active: false, timestamp: Date.now() }));
      setShouldAutoNavigate(false);
    } catch (error) {
      console.error('[ReadingProgress] Error marking session ended:', error);
    }
  }, []);

  const clearProgress = useCallback(async () => {
    try {
      console.log('[ReadingProgress] Clearing progress');
      await AsyncStorage.removeItem(READING_PROGRESS_KEY);
      await AsyncStorage.removeItem(SESSION_KEY);
      setLastRead(null);
      setShouldAutoNavigate(false);
    } catch (error) {
      console.error('[ReadingProgress] Error clearing progress:', error);
    }
  }, []);

  return {
    lastRead,
    isLoading,
    saveProgress,
    clearProgress,
    shouldAutoNavigate,
    markSessionEnded,
  };
});
