import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Scripture {
  id: string;
  date: Date;
  verse: string;
  book: string;
  bookId: string; // Numeric ID for API calls (e.g., "43" for John)
  chapter: number;
  verseStart: number;
  verseEnd: number;
  text: string;
  message?: string;
  isFeatured: boolean;
  createdAt: Date;
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  scriptureId: string;
  date: Date;
  createdAt: Date;
}

export interface AppSettings {
  featuredScriptureId: string;
  dailyVerseId: string;
  welcomeMessage: string;
  appTheme: 'light' | 'dark' | 'sepia';
}

const SCRIPTURES_COLLECTION = 'scriptures';
const DEVOTIONALS_COLLECTION = 'devotionals';
const SETTINGS_COLLECTION = 'settings';

// Convert Firestore document to Scripture object
const docToScripture = (docSnap: any): Scripture => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    date: data.date?.toDate() || new Date(),
    verse: data.verse || '',
    book: data.book || '',
    bookId: data.bookId || '',
    chapter: data.chapter || 1,
    verseStart: data.verseStart || 1,
    verseEnd: data.verseEnd || 1,
    text: data.text || '',
    message: data.message,
    isFeatured: data.isFeatured || false,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Get all scriptures
export const getScriptures = async (): Promise<Scripture[]> => {
  try {
    const q = query(
      collection(db, SCRIPTURES_COLLECTION),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToScripture);
  } catch (error) {
    console.error('Error fetching scriptures:', error);
    return [];
  }
};

// Get featured scripture (for home page)
export const getFeaturedScripture = async (): Promise<Scripture | null> => {
  try {
    const q = query(
      collection(db, SCRIPTURES_COLLECTION),
      where('isFeatured', '==', true),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return docToScripture(snapshot.docs[0]);
  } catch (error) {
    console.error('Error fetching featured scripture:', error);
    return null;
  }
};

// Get recent scriptures
export const getRecentScriptures = async (count: number = 7): Promise<Scripture[]> => {
  try {
    const q = query(
      collection(db, SCRIPTURES_COLLECTION),
      orderBy('date', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToScripture);
  } catch (error) {
    console.error('Error fetching recent scriptures:', error);
    return [];
  }
};

// Get scripture for a specific date
export const getDailyScripture = async (date: Date): Promise<Scripture | null> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, SCRIPTURES_COLLECTION),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay)),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return docToScripture(snapshot.docs[0]);
  } catch (error) {
    console.error('Error fetching daily scripture:', error);
    return null;
  }
};

// Subscribe to scriptures (real-time updates)
export const subscribeToScriptures = (
  callback: (scriptures: Scripture[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, SCRIPTURES_COLLECTION),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const scriptures = snapshot.docs.map(docToScripture);
    callback(scriptures);
  }, (error) => {
    console.error('Error subscribing to scriptures:', error);
    callback([]);
  });
};

// Subscribe to featured scripture
export const subscribeToFeaturedScripture = (
  callback: (scripture: Scripture | null) => void
): Unsubscribe => {
  const q = query(
    collection(db, SCRIPTURES_COLLECTION),
    where('isFeatured', '==', true),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      callback(docToScripture(snapshot.docs[0]));
    }
  }, (error) => {
    console.error('Error subscribing to featured scripture:', error);
    callback(null);
  });
};

// Get app settings
export const getAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'app_config');
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
      featuredScriptureId: data.featuredScriptureId || '',
      dailyVerseId: data.dailyVerseId || '',
      welcomeMessage: data.welcomeMessage || '',
      appTheme: data.appTheme || 'light',
    };
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
};

// Subscribe to app settings
export const subscribeToAppSettings = (
  callback: (settings: AppSettings | null) => void
): Unsubscribe => {
  const docRef = doc(db, SETTINGS_COLLECTION, 'app_config');

  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
    } else {
      const data = snapshot.data();
      callback({
        featuredScriptureId: data.featuredScriptureId || '',
        dailyVerseId: data.dailyVerseId || '',
        welcomeMessage: data.welcomeMessage || '',
        appTheme: data.appTheme || 'light',
      });
    }
  }, (error) => {
    console.error('Error subscribing to app settings:', error);
    callback(null);
  });
};

// Get devotional for a scripture
export const getDevotional = async (scriptureId: string): Promise<Devotional | null> => {
  try {
    const q = query(
      collection(db, DEVOTIONALS_COLLECTION),
      where('scriptureId', '==', scriptureId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title || '',
      content: data.content || '',
      scriptureId: data.scriptureId,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error fetching devotional:', error);
    return null;
  }
};
