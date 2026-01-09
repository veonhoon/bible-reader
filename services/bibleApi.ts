import AsyncStorage from '@react-native-async-storage/async-storage';
import { BibleVerse, BibleChapter } from '@/mocks/bibleData';

const API_BASE_URL = 'https://bolls.life';
const BIBLE_VERSION = 'NIV';

const CACHE_PREFIX = 'bible_bolls_';
const CACHE_EXPIRY_DAYS = 30;

interface CachedChapter {
  data: BibleChapter;
  timestamp: number;
}

interface BollsApiVerse {
  verse: number;
  text: string;
}

function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const BOOK_NUMBER_MAP: Record<string, number> = {
  'genesis': 1,
  'exodus': 2,
  'leviticus': 3,
  'numbers': 4,
  'deuteronomy': 5,
  'joshua': 6,
  'judges': 7,
  'ruth': 8,
  '1samuel': 9,
  '2samuel': 10,
  '1kings': 11,
  '2kings': 12,
  '1chronicles': 13,
  '2chronicles': 14,
  'ezra': 15,
  'nehemiah': 16,
  'esther': 17,
  'job': 18,
  'psalms': 19,
  'proverbs': 20,
  'ecclesiastes': 21,
  'songofsolomon': 22,
  'isaiah': 23,
  'jeremiah': 24,
  'lamentations': 25,
  'ezekiel': 26,
  'daniel': 27,
  'hosea': 28,
  'joel': 29,
  'amos': 30,
  'obadiah': 31,
  'jonah': 32,
  'micah': 33,
  'nahum': 34,
  'habakkuk': 35,
  'zephaniah': 36,
  'haggai': 37,
  'zechariah': 38,
  'malachi': 39,
  'matthew': 40,
  'mark': 41,
  'luke': 42,
  'john': 43,
  'acts': 44,
  'romans': 45,
  '1corinthians': 46,
  '2corinthians': 47,
  'galatians': 48,
  'ephesians': 49,
  'philippians': 50,
  'colossians': 51,
  '1thessalonians': 52,
  '2thessalonians': 53,
  '1timothy': 54,
  '2timothy': 55,
  'titus': 56,
  'philemon': 57,
  'hebrews': 58,
  'james': 59,
  '1peter': 60,
  '2peter': 61,
  '1john': 62,
  '2john': 63,
  '3john': 64,
  'jude': 65,
  'revelation': 66,
};

export async function fetchChapter(
  bookId: string,
  chapter: number
): Promise<BibleChapter> {
  const cacheKey = `${CACHE_PREFIX}${bookId}_${chapter}`;
  
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsedCache: CachedChapter = JSON.parse(cached);
      const daysSinceCached = (Date.now() - parsedCache.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceCached < CACHE_EXPIRY_DAYS) {
        console.log(`[BibleAPI] Returning cached chapter: ${bookId} ${chapter}`);
        return parsedCache.data;
      }
    }
  } catch (error) {
    console.log('[BibleAPI] Cache read error:', error);
  }
  
  const bookNumber = BOOK_NUMBER_MAP[bookId];
  if (!bookNumber) {
    throw new Error(`Unknown book: ${bookId}`);
  }
  
  const url = `${API_BASE_URL}/get-text/${BIBLE_VERSION}/${bookNumber}/${chapter}/`;
  
  console.log(`[BibleAPI] Fetching chapter: ${bookId} ${chapter}`);
  console.log(`[BibleAPI] URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[BibleAPI] API Error:', response.status, errorText);
      if (response.status === 404) {
        throw new Error('Chapter not found. This chapter may not exist.');
      }
      throw new Error(`Failed to fetch chapter: ${response.status}`);
    }
    
    const data: BollsApiVerse[] = await response.json();
    
    console.log('[BibleAPI] Response received, verses count:', data?.length);
    
    if (!data || data.length === 0) {
      console.error('[BibleAPI] No verses in response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No verses returned from API');
    }
    
    const verses: BibleVerse[] = data.map((v) => ({
      verse: v.verse,
      text: stripHtml(v.text),
    }));
    
    verses.sort((a, b) => a.verse - b.verse);
    
    console.log(`[BibleAPI] Parsed ${verses.length} verses for ${bookId} ${chapter}`);
    console.log('[BibleAPI] First verse:', verses[0]);
    
    const chapterData: BibleChapter = {
      bookId,
      chapter,
      verses,
    };
    
    try {
      const cacheData: CachedChapter = {
        data: chapterData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log(`[BibleAPI] Cached chapter: ${bookId} ${chapter} (${verses.length} verses)`);
    } catch (cacheError) {
      console.log('[BibleAPI] Cache write error:', cacheError);
    }
    
    return chapterData;
  } catch (error) {
    console.error('[BibleAPI] Fetch error:', error);
    throw error;
  }
}

export async function clearBibleCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bibleKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(bibleKeys);
    console.log(`[BibleAPI] Cleared ${bibleKeys.length} cached chapters`);
  } catch (error) {
    console.error('[BibleAPI] Error clearing cache:', error);
  }
}

export async function getCacheSize(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const bibleKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    return bibleKeys.length;
  } catch {
    return 0;
  }
}
