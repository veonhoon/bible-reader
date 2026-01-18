import { useState, useCallback, useMemo } from 'react';
import {
  getVerse as getVerseUtil,
  getChapter as getChapterUtil,
  getChapterVerses as getChapterVersesUtil,
  getBook as getBookUtil,
  searchVerses as searchVersesUtil,
  getAllBookNames as getAllBookNamesUtil,
  getBookInfo as getBookInfoUtil,
  getVerseRange as getVerseRangeUtil,
  formatVerseReference as formatVerseReferenceUtil,
} from '@/utils/bibleUtils';
import { BibleVerse, BibleChapter, SearchResult } from '@/types/bible';

/**
 * Custom hook for accessing Korean Bible data
 * Provides convenient methods for retrieving verses, chapters, and searching
 *
 * @example
 * const { getVerse, getChapter, searchVerses } = useBible();
 * const verse = getVerse('john', 3, 16);
 * const chapter = getChapter('genesis', 1);
 * const results = searchVerses('사랑');
 */
export const useBible = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Get a specific verse
   */
  const getVerse = useCallback(
    (bookIdentifier: string | number, chapter: number, verseNumber: number): BibleVerse | null => {
      return getVerseUtil(bookIdentifier, chapter, verseNumber);
    },
    []
  );

  /**
   * Get an entire chapter
   */
  const getChapter = useCallback(
    (bookIdentifier: string | number, chapterNumber: number): BibleChapter | null => {
      return getChapterUtil(bookIdentifier, chapterNumber);
    },
    []
  );

  /**
   * Get all verses in a chapter as an array
   */
  const getChapterVerses = useCallback(
    (bookIdentifier: string | number, chapterNumber: number): BibleVerse[] => {
      return getChapterVersesUtil(bookIdentifier, chapterNumber);
    },
    []
  );

  /**
   * Get a book by name or number
   */
  const getBook = useCallback(
    (bookIdentifier: string | number) => {
      return getBookUtil(bookIdentifier);
    },
    []
  );

  /**
   * Search verses with optional async state management
   */
  const searchVerses = useCallback(
    async (
      keyword: string,
      options?: {
        bookNumber?: number;
        maxResults?: number;
      }
    ): Promise<SearchResult[]> => {
      setIsSearching(true);

      // Use setTimeout to prevent UI blocking on large searches
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = searchVersesUtil(keyword, options);
          setSearchResults(results);
          setIsSearching(false);
          resolve(results);
        }, 0);
      });
    },
    []
  );

  /**
   * Clear search results
   */
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  /**
   * Get verse range (multiple consecutive verses)
   */
  const getVerseRange = useCallback(
    (
      bookIdentifier: string | number,
      chapter: number,
      startVerse: number,
      endVerse: number
    ): BibleVerse[] => {
      return getVerseRangeUtil(bookIdentifier, chapter, startVerse, endVerse);
    },
    []
  );

  /**
   * Get book information
   */
  const getBookInfo = useCallback(
    (bookIdentifier: string | number) => {
      return getBookInfoUtil(bookIdentifier);
    },
    []
  );

  /**
   * Format verse reference string
   */
  const formatVerseReference = useCallback(
    (bookName: string, chapter: number, verse?: number): string => {
      return formatVerseReferenceUtil(bookName, chapter, verse);
    },
    []
  );

  /**
   * Get all book names (memoized)
   */
  const allBookNames = useMemo(() => {
    return getAllBookNamesUtil();
  }, []);

  return {
    // Core functions
    getVerse,
    getChapter,
    getChapterVerses,
    getBook,
    searchVerses,
    getVerseRange,
    getBookInfo,
    formatVerseReference,

    // Data
    allBookNames,
    searchResults,

    // State
    isSearching,
    clearSearchResults,
  };
};

export default useBible;
