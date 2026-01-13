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
  if (!isFirebaseConfigured || !db) {
    return null;
  }
  try {
    const q = query(
      collection(db, 'weeklyContent'),
      orderBy('publishedAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return docToWeeklyContent(snapshot.docs[0]);
  } catch (error) {
    console.error('Error fetching latest weekly content:', error);
    return null;
  }
};

// Get a specific snippet by ID from the latest content
export const getSnippetById = async (snippetId: string): Promise<Snippet | null> => {
  const content = await getLatestWeeklyContent();
  if (!content) return null;
  return content.snippets.find(s => s.id === snippetId) || null;
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
  if (!isFirebaseConfigured || !db) {
    callback(null);
    return noopUnsubscribe;
  }

  const q = query(
    collection(db, 'weeklyContent'),
    orderBy('publishedAt', 'desc'),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      callback(docToWeeklyContent(snapshot.docs[0]));
    }
  }, (error) => {
    console.error('Error subscribing to weekly content:', error);
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
