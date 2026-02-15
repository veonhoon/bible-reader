import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';

export interface Scripture {
  reference: string;
  text: string;
}

export interface Snippet {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  snippet: string;
  scripture: Scripture;
  day?: number; // Day of the week (1-7) this snippet belongs to
  isDirectCitation?: boolean; // True if scripture is directly from the teaching document
}

export interface WeeklyContent {
  id: string;
  weekId: string;
  weekTitle: string;
  snippets: Snippet[];
  snippetCount: number;
  createdAt: Date;
  publishedAt: Date;
}

export interface NotificationSchedule {
  perDay: number;
  days: string[];
  times: string[];
}

// No-op unsubscribe function for when Firebase is not configured
const noopUnsubscribe: Unsubscribe = () => {};

// Transform bilingual Firestore document to WeeklyContent based on language
const transformTeachingToContent = (docSnap: any, language: string = 'en'): WeeklyContent => {
  const data = docSnap.data();
  const lang = language === 'ko' ? 'ko' : 'en';
  
  // Get title based on language (fallback to English if Korean not available)
  const weekTitle = data[`title_${lang}`] || data.title_en || data.title || '';
  
  // Transform snippets to expected format
  const snippets: Snippet[] = (data.snippets || []).map((s: any, index: number) => {
    const title = s[`title_${lang}`] || s.title_en || s.title || '';
    const subtitle = s[`subtitle_${lang}`] || s.subtitle_en || s.subtitle || '';
    // Main teaching content: try snippet_X first, then content_X, then fallback
    const body = s[`snippet_${lang}`] || s.snippet_en || s[`content_${lang}`] || s.content_en || s.content || '';
    // Short preview for notifications: try body_X first (our new format)
    const shortPreview = s[`body_${lang}`] || s.body_en || body.substring(0, 100) + (body.length > 100 ? '...' : '');
    
    // Scripture: try nested object first, then flat fields
    let scriptureRef = '';
    let scriptureText = '';
    if (s.scripture && typeof s.scripture === 'object') {
      scriptureRef = s.scripture[`reference_${lang}`] || s.scripture.reference_en || s.scripture.reference || '';
      scriptureText = s.scripture[`text_${lang}`] || s.scripture.text_en || s.scripture.text || '';
    } else {
      scriptureRef = s[`scriptureRef_${lang}`] || s.scriptureRef_en || s.scriptureReference || '';
      scriptureText = s[`scripture_${lang}`] || s.scripture_en || '';
    }
    
    return {
      id: s.id || `snippet-${index + 1}`,
      title,
      subtitle,
      body,
      snippet: shortPreview,
      scripture: {
        reference: scriptureRef,
        text: scriptureText,
      },
      day: s.day, // Preserve day property for filtering
      isDirectCitation: s.isDirectCitation || false, // From teaching document
    };
  });
  
  return {
    id: docSnap.id,
    weekId: data.id || docSnap.id,
    weekTitle,
    snippets,
    snippetCount: snippets.length,
    createdAt: data.createdAt?.toDate() || new Date(),
    publishedAt: data.publishedAt?.toDate() || data.updatedAt?.toDate() || new Date(),
  };
};

// Current language setting (will be set by subscriber)
let currentLanguage = 'en';

export const setContentLanguage = (lang: string) => {
  currentLanguage = lang;
};

// Get the latest weekly content
export const getLatestWeeklyContent = async (language?: string): Promise<WeeklyContent | null> => {
  const lang = language || currentLanguage;
  console.log('[WeeklyContent] getLatestWeeklyContent called, language:', lang);
  console.log('[WeeklyContent] Firebase configured:', isFirebaseConfigured);
  console.log('[WeeklyContent] DB available:', !!db);

  if (!isFirebaseConfigured || !db) {
    console.warn('[WeeklyContent] Firebase not configured, returning null');
    return null;
  }
  
  try {
    // Try weeklyTeachings collection first (bilingual content)
    // Simple query - just get all docs and sort in code
    console.log('[WeeklyContent] Querying weeklyTeachings...');
    const teachingsSnapshot = await getDocs(collection(db, 'weeklyTeachings'));
    
    // Filter and sort in code to avoid index requirements
    const publishedDocs = teachingsSnapshot.docs
      .filter(doc => doc.data().isPublished !== false)
      .sort((a, b) => {
        // Sort by ID descending (2026-W06 > 2026-W05)
        return b.id.localeCompare(a.id);
      });
    
    if (publishedDocs.length > 0) {
      const content = transformTeachingToContent(publishedDocs[0], lang);
      console.log('[WeeklyContent] Content fetched from weeklyTeachings:', {
        weekId: content.weekId,
        weekTitle: content.weekTitle,
        snippetCount: content.snippets?.length || 0,
        publishedAt: content.publishedAt
      });
      return content;
    }
    
    // Fallback to weeklyContent collection (legacy format)
    console.log('[WeeklyContent] No weeklyTeachings, trying weeklyContent...');
    const contentQuery = query(
      collection(db, 'weeklyContent'),
      orderBy('publishedAt', 'desc'),
      limit(1)
    );
    const contentSnapshot = await getDocs(contentQuery);

    if (contentSnapshot.empty) {
      console.log('[WeeklyContent] No content found in either collection');
      return null;
    }

    // Legacy format - just map directly
    const docData = contentSnapshot.docs[0].data();
    return {
      id: contentSnapshot.docs[0].id,
      weekId: docData.weekId || contentSnapshot.docs[0].id,
      weekTitle: docData.weekTitle || '',
      snippets: docData.snippets || [],
      snippetCount: docData.snippetCount || docData.snippets?.length || 0,
      createdAt: docData.createdAt?.toDate() || new Date(),
      publishedAt: docData.publishedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('[WeeklyContent] Error fetching latest weekly content:', error);
    if (error instanceof Error) {
      console.error('[WeeklyContent] Error details:', error.message, error.stack);
    }
    return null;
  }
};

// Get a specific snippet by ID from the latest content
export const getSnippetById = async (snippetId: string, language?: string): Promise<Snippet | null> => {
  console.log('[WeeklyContent] getSnippetById called with ID:', snippetId);
  const content = await getLatestWeeklyContent(language);

  if (!content) {
    console.log('[WeeklyContent] No content available, cannot find snippet');
    return null;
  }

  console.log('[WeeklyContent] Searching for snippet in', content.snippets?.length || 0, 'snippets');
  const snippet = content.snippets.find(s => s.id === snippetId) || null;

  if (snippet) {
    console.log('[WeeklyContent] Snippet found:', snippet.title);
  } else {
    console.log('[WeeklyContent] Snippet not found. Available IDs:', content.snippets.map(s => s.id).join(', '));
  }

  return snippet;
};

// Get the notification schedule from admin settings
export const getNotificationSchedule = async (): Promise<NotificationSchedule | null> => {
  if (!isFirebaseConfigured || !db) {
    return null;
  }
  try {
    const docRef = doc(db, 'adminSettings', 'notificationSchedule');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      perDay: data.perDay || 1,
      days: data.days || ['Mon', 'Wed', 'Fri'],
      times: data.times || ['09:00'],
    };
  } catch (error) {
    console.error('Error fetching notification schedule:', error);
    return null;
  }
};

// Subscribe to latest weekly content (real-time updates)
export const subscribeToLatestWeeklyContent = (
  callback: (content: WeeklyContent | null) => void,
  language?: string
): Unsubscribe => {
  const lang = language || currentLanguage;
  console.log('[WeeklyContent] Subscribing to content, language:', lang);
  console.log('[WeeklyContent] Firebase configured:', isFirebaseConfigured);
  console.log('[WeeklyContent] DB available:', !!db);

  if (!isFirebaseConfigured || !db) {
    console.warn('[WeeklyContent] Firebase not configured, returning null');
    callback(null);
    return noopUnsubscribe;
  }

  // Subscribe to weeklyTeachings collection (bilingual)
  // Simple query - just watch all docs and sort in code  
  return onSnapshot(collection(db, 'weeklyTeachings'), (snapshot) => {
    console.log('[WeeklyContent] Snapshot received, docs:', snapshot.docs.length);
    
    // Filter and sort in code to avoid index requirements
    const publishedDocs = snapshot.docs
      .filter(doc => doc.data().isPublished !== false)
      .sort((a, b) => b.id.localeCompare(a.id));
    
    if (publishedDocs.length > 0) {
      const content = transformTeachingToContent(publishedDocs[0], lang);
      console.log('[WeeklyContent] Content loaded:', content.weekTitle, 'with', content.snippets?.length, 'snippets');
      callback(content);
      return;
    }
    
    // Fallback to weeklyContent if no teachings found
    console.log('[WeeklyContent] No weeklyTeachings, trying weeklyContent fallback...');
    const contentQuery = query(
      collection(db, 'weeklyContent'),
      orderBy('publishedAt', 'desc'),
      limit(1)
    );
    
    getDocs(contentQuery).then((contentSnapshot) => {
      if (contentSnapshot.empty) {
        console.log('[WeeklyContent] No content found');
        callback(null);
      } else {
        const docData = contentSnapshot.docs[0].data();
        callback({
          id: contentSnapshot.docs[0].id,
          weekId: docData.weekId || contentSnapshot.docs[0].id,
          weekTitle: docData.weekTitle || '',
          snippets: docData.snippets || [],
          snippetCount: docData.snippetCount || docData.snippets?.length || 0,
          createdAt: docData.createdAt?.toDate() || new Date(),
          publishedAt: docData.publishedAt?.toDate() || new Date(),
        });
      }
    });
  }, (error) => {
    console.error('[WeeklyContent] Error subscribing to weekly content:', error);
    callback(null);
  });
};

// Subscribe to notification schedule (real-time updates)
export const subscribeToNotificationSchedule = (
  callback: (schedule: NotificationSchedule | null) => void
): Unsubscribe => {
  if (!isFirebaseConfigured || !db) {
    callback(null);
    return noopUnsubscribe;
  }

  const docRef = doc(db, 'adminSettings', 'notificationSchedule');

  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
    } else {
      const data = docSnap.data();
      callback({
        perDay: data.perDay || 1,
        days: data.days || ['Mon', 'Wed', 'Fri'],
        times: data.times || ['09:00'],
      });
    }
  }, (error) => {
    console.error('Error subscribing to notification schedule:', error);
    callback(null);
  });
};

// Calculate which day of the week (0-6) since content was published
export const getDaysSincePublish = (publishedAt: Date): number => {
  const now = new Date();
  const published = new Date(publishedAt);

  // Reset to start of day for both
  now.setHours(0, 0, 0, 0);
  published.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - published.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Return day within the week (0-6), cycle after 7 days
  return Math.max(0, diffDays % 7);
};

// Get today's snippets from the weekly content
export const getTodaysSnippets = (content: WeeklyContent): Snippet[] => {
  if (!content || !content.snippets || content.snippets.length === 0) {
    return [];
  }

  // Get current day (1-7) since publish
  const dayIndex = getDaysSincePublish(content.publishedAt);
  const currentDay = dayIndex + 1; // Convert 0-6 to 1-7

  // Filter snippets by their day property
  // If snippet has day property, use it; otherwise fall back to index-based calculation
  const snippetsWithDay = content.snippets.filter(s => s.day !== undefined);
  
  if (snippetsWithDay.length > 0) {
    // Use day property to filter
    return content.snippets.filter(s => s.day === currentDay);
  }
  
  // Fallback: divide snippets evenly across 7 days
  const totalSnippets = content.snippets.length;
  const snippetsPerDay = Math.ceil(totalSnippets / 7);
  const startIndex = dayIndex * snippetsPerDay;
  const endIndex = Math.min(startIndex + snippetsPerDay, totalSnippets);

  return content.snippets.slice(startIndex, endIndex);
};

// Get all snippets up to and including today (for users who want to catch up)
export const getSnippetsUpToToday = (content: WeeklyContent): Snippet[] => {
  if (!content || !content.snippets || content.snippets.length === 0) {
    return [];
  }

  const totalSnippets = content.snippets.length;
  const snippetsPerDay = Math.ceil(totalSnippets / 7);
  const dayIndex = getDaysSincePublish(content.publishedAt);

  const endIndex = Math.min((dayIndex + 1) * snippetsPerDay, totalSnippets);

  return content.snippets.slice(0, endIndex);
};

// Get info about today's progress
export interface DailyProgress {
  currentDay: number; // 0-6 (day since publish)
  totalDays: number; // Always 7
  todaysSnippetCount: number;
  totalSnippetsAvailable: number; // Snippets available up to today
  totalSnippets: number; // All snippets in the week
}

export const getDailyProgress = (content: WeeklyContent): DailyProgress => {
  if (!content || !content.snippets) {
    return {
      currentDay: 0,
      totalDays: 7,
      todaysSnippetCount: 0,
      totalSnippetsAvailable: 0,
      totalSnippets: 0,
    };
  }

  const dayIndex = getDaysSincePublish(content.publishedAt);
  const todaysSnippets = getTodaysSnippets(content);
  const availableSnippets = getSnippetsUpToToday(content);

  return {
    currentDay: dayIndex,
    totalDays: 7,
    todaysSnippetCount: todaysSnippets.length,
    totalSnippetsAvailable: availableSnippets.length,
    totalSnippets: content.snippets.length,
  };
};
