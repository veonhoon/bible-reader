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

// Convert Firestore document to WeeklyContent object
const docToWeeklyContent = (docSnap: any): WeeklyContent => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    weekId: data.weekId || docSnap.id,
    weekTitle: data.weekTitle || '',
    snippets: data.snippets || [],
    snippetCount: data.snippetCount || data.snippets?.length || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    publishedAt: data.publishedAt?.toDate() || new Date(),
  };
};

// Get the latest weekly content
export const getLatestWeeklyContent = async (): Promise<WeeklyContent | null> => {
  console.log('[WeeklyContent] getLatestWeeklyContent called');
  console.log('[WeeklyContent] Firebase configured:', isFirebaseConfigured);
  console.log('[WeeklyContent] DB available:', !!db);

  if (!isFirebaseConfigured || !db) {
    console.warn('[WeeklyContent] Firebase not configured, returning null');
    return null;
  }
  try {
    const q = query(
      collection(db, 'weeklyContent'),
      orderBy('publishedAt', 'desc'),
      limit(1)
    );
    console.log('[WeeklyContent] Executing query...');
    const snapshot = await getDocs(q);
    console.log('[WeeklyContent] Query complete. Empty:', snapshot.empty, 'Docs:', snapshot.docs.length);

    if (snapshot.empty) {
      console.log('[WeeklyContent] No content found in database');
      return null;
    }

    const content = docToWeeklyContent(snapshot.docs[0]);
    console.log('[WeeklyContent] Content fetched:', {
      weekId: content.weekId,
      weekTitle: content.weekTitle,
      snippetCount: content.snippets?.length || 0,
      publishedAt: content.publishedAt
    });
    return content;
  } catch (error) {
    console.error('[WeeklyContent] Error fetching latest weekly content:', error);
    if (error instanceof Error) {
      console.error('[WeeklyContent] Error details:', error.message, error.stack);
    }
    return null;
  }
};

// Get a specific snippet by ID from the latest content
export const getSnippetById = async (snippetId: string): Promise<Snippet | null> => {
  console.log('[WeeklyContent] getSnippetById called with ID:', snippetId);
  const content = await getLatestWeeklyContent();

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
  callback: (content: WeeklyContent | null) => void
): Unsubscribe => {
  console.log('[WeeklyContent] Subscribing to content...');
  console.log('[WeeklyContent] Firebase configured:', isFirebaseConfigured);
  console.log('[WeeklyContent] DB available:', !!db);

  if (!isFirebaseConfigured || !db) {
    console.warn('[WeeklyContent] Firebase not configured, returning null');
    callback(null);
    return noopUnsubscribe;
  }

  const q = query(
    collection(db, 'weeklyContent'),
    orderBy('publishedAt', 'desc'),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    console.log('[WeeklyContent] Snapshot received, empty:', snapshot.empty);
    if (snapshot.empty) {
      console.log('[WeeklyContent] No content found');
      callback(null);
    } else {
      const content = docToWeeklyContent(snapshot.docs[0]);
      console.log('[WeeklyContent] Content loaded:', content.weekTitle, 'with', content.snippets?.length, 'snippets');
      callback(content);
    }
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

  const totalSnippets = content.snippets.length;
  const snippetsPerDay = Math.ceil(totalSnippets / 7);
  const dayIndex = getDaysSincePublish(content.publishedAt);

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
