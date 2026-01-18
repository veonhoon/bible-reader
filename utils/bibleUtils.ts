import { KoreanBible, BibleVerse, BibleChapter, SearchResult } from '@/types/bible';
import { getBookNumber } from '@/constants/koreanBookNames';

// Import the Korean Bible JSON
const koreanBibleData: KoreanBible = require('@/assets/korean-bible.json');

/**
 * Get a specific verse by book name/number, chapter, and verse number
 * @param bookIdentifier - Book name (e.g., 'john', 'genesis') or book number (1-66)
 * @param chapter - Chapter number
 * @param verseNumber - Verse number
 * @returns BibleVerse or null if not found
 */
export const getVerse = (
  bookIdentifier: string | number,
  chapter: number,
  verseNumber: number
): BibleVerse | null => {
  const bookNumber = typeof bookIdentifier === 'string'
    ? getBookNumber(bookIdentifier)
    : bookIdentifier;

  if (!bookNumber) return null;

  const book = koreanBibleData.books.find((b) => b.nr === bookNumber);
  if (!book) return null;

  const chapterData = book.chapters.find((c) => c.chapter === chapter);
  if (!chapterData) return null;

  const verse = chapterData.verses.find((v) => v.verse === verseNumber);
  return verse || null;
};

/**
 * Get an entire chapter
 * @param bookIdentifier - Book name or number
 * @param chapterNumber - Chapter number
 * @returns BibleChapter or null if not found
 */
export const getChapter = (
  bookIdentifier: string | number,
  chapterNumber: number
): BibleChapter | null => {
  const bookNumber = typeof bookIdentifier === 'string'
    ? getBookNumber(bookIdentifier)
    : bookIdentifier;

  if (!bookNumber) return null;

  const book = koreanBibleData.books.find((b) => b.nr === bookNumber);
  if (!book) return null;

  const chapter = book.chapters.find((c) => c.chapter === chapterNumber);
  return chapter || null;
};

/**
 * Get all verses in a chapter as an array
 * @param bookIdentifier - Book name or number
 * @param chapterNumber - Chapter number
 * @returns Array of BibleVerse or empty array if not found
 */
export const getChapterVerses = (
  bookIdentifier: string | number,
  chapterNumber: number
): BibleVerse[] => {
  const chapter = getChapter(bookIdentifier, chapterNumber);
  return chapter?.verses || [];
};

/**
 * Get a book by name or number
 * @param bookIdentifier - Book name or number
 * @returns BibleBook or null if not found
 */
export const getBook = (bookIdentifier: string | number) => {
  const bookNumber = typeof bookIdentifier === 'string'
    ? getBookNumber(bookIdentifier)
    : bookIdentifier;

  if (!bookNumber) return null;

  return koreanBibleData.books.find((b) => b.nr === bookNumber) || null;
};

/**
 * Search for verses containing a keyword
 * @param keyword - Search term in Korean
 * @param options - Optional search options
 * @returns Array of SearchResult
 */
export const searchVerses = (
  keyword: string,
  options?: {
    bookNumber?: number;
    maxResults?: number;
  }
): SearchResult[] => {
  const results: SearchResult[] = [];
  const normalizedKeyword = keyword.trim().toLowerCase();
  const maxResults = options?.maxResults || 100;

  const booksToSearch = options?.bookNumber
    ? koreanBibleData.books.filter((b) => b.nr === options.bookNumber)
    : koreanBibleData.books;

  for (const book of booksToSearch) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        if (verse.text.toLowerCase().includes(normalizedKeyword)) {
          results.push({
            bookName: book.name,
            bookNumber: book.nr,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
            name: verse.name,
          });

          if (results.length >= maxResults) {
            return results;
          }
        }
      }
    }
  }

  return results;
};

/**
 * Get all book names in Korean
 * @returns Array of Korean book names
 */
export const getAllBookNames = (): string[] => {
  return koreanBibleData.books.map((book) => book.name);
};

/**
 * Get book info including total chapters
 * @param bookIdentifier - Book name or number
 * @returns Object with book info or null
 */
export const getBookInfo = (bookIdentifier: string | number) => {
  const book = getBook(bookIdentifier);
  if (!book) return null;

  return {
    number: book.nr,
    name: book.name,
    totalChapters: book.chapters.length,
    totalVerses: book.chapters.reduce((sum, ch) => sum + ch.verses.length, 0),
  };
};

/**
 * Get verse range (multiple verses from same chapter)
 * @param bookIdentifier - Book name or number
 * @param chapter - Chapter number
 * @param startVerse - Starting verse number
 * @param endVerse - Ending verse number
 * @returns Array of BibleVerse
 */
export const getVerseRange = (
  bookIdentifier: string | number,
  chapter: number,
  startVerse: number,
  endVerse: number
): BibleVerse[] => {
  const chapterData = getChapter(bookIdentifier, chapter);
  if (!chapterData) return [];

  return chapterData.verses.filter(
    (v) => v.verse >= startVerse && v.verse <= endVerse
  );
};

/**
 * Format verse reference (e.g., "요한복음 3:16")
 * @param bookName - Korean book name
 * @param chapter - Chapter number
 * @param verse - Verse number (optional)
 * @returns Formatted string
 */
export const formatVerseReference = (
  bookName: string,
  chapter: number,
  verse?: number
): string => {
  return verse ? `${bookName} ${chapter}:${verse}` : `${bookName} ${chapter}`;
};
