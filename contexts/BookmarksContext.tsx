import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Bookmark {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: number;
}

const BOOKMARKS_STORAGE_KEY = 'bible_app_bookmarks';
const HIGHLIGHTS_STORAGE_KEY = 'bible_app_highlights';

export const [BookmarksProvider, useBookmarks] = createContextHook(() => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookmarksData, highlightsData] = await Promise.all([
          AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY),
          AsyncStorage.getItem(HIGHLIGHTS_STORAGE_KEY),
        ]);

        if (bookmarksData) {
          setBookmarks(JSON.parse(bookmarksData));
        }
        if (highlightsData) {
          setHighlights(JSON.parse(highlightsData));
        }
        console.log('Bookmarks and highlights loaded');
      } catch (error) {
        console.log('Error loading bookmarks/highlights:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addBookmark = useCallback(async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `${bookmark.bookId}-${bookmark.chapter}-${bookmark.verse}-${Date.now()}`,
      createdAt: Date.now(),
    };

    const existingIndex = bookmarks.findIndex(
      b => b.bookId === bookmark.bookId && b.chapter === bookmark.chapter && b.verse === bookmark.verse
    );

    let updated: Bookmark[];
    if (existingIndex >= 0) {
      updated = bookmarks.filter((_, i) => i !== existingIndex);
      console.log('Bookmark removed');
    } else {
      updated = [...bookmarks, newBookmark];
      console.log('Bookmark added');
    }

    setBookmarks(updated);
    try {
      await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving bookmarks:', error);
    }
  }, [bookmarks]);

  const removeBookmark = useCallback(async (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    try {
      await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
      console.log('Bookmark removed');
    } catch (error) {
      console.log('Error removing bookmark:', error);
    }
  }, [bookmarks]);

  const isBookmarked = useCallback((bookId: string, chapter: number, verse: number) => {
    return bookmarks.some(
      b => b.bookId === bookId && b.chapter === chapter && b.verse === verse
    );
  }, [bookmarks]);

  const addHighlight = useCallback(async (highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: `${highlight.bookId}-${highlight.chapter}-${highlight.verse}-${Date.now()}`,
      createdAt: Date.now(),
    };

    const existingIndex = highlights.findIndex(
      h => h.bookId === highlight.bookId && h.chapter === highlight.chapter && h.verse === highlight.verse
    );

    let updated: Highlight[];
    if (existingIndex >= 0) {
      updated = highlights.filter((_, i) => i !== existingIndex);
      console.log('Highlight removed');
    } else {
      updated = [...highlights, newHighlight];
      console.log('Highlight added');
    }

    setHighlights(updated);
    try {
      await AsyncStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Error saving highlights:', error);
    }
  }, [highlights]);

  const removeHighlight = useCallback(async (id: string) => {
    const updated = highlights.filter(h => h.id !== id);
    setHighlights(updated);
    try {
      await AsyncStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(updated));
      console.log('Highlight removed');
    } catch (error) {
      console.log('Error removing highlight:', error);
    }
  }, [highlights]);

  const isHighlighted = useCallback((bookId: string, chapter: number, verse: number) => {
    return highlights.some(
      h => h.bookId === bookId && h.chapter === chapter && h.verse === verse
    );
  }, [highlights]);

  const sortedBookmarks = useMemo(() => {
    return [...bookmarks].sort((a, b) => b.createdAt - a.createdAt);
  }, [bookmarks]);

  const sortedHighlights = useMemo(() => {
    return [...highlights].sort((a, b) => b.createdAt - a.createdAt);
  }, [highlights]);

  return {
    bookmarks: sortedBookmarks,
    highlights: sortedHighlights,
    isLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    addHighlight,
    removeHighlight,
    isHighlighted,
  };
});
