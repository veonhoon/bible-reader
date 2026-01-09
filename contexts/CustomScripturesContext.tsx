import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Notifications from 'expo-notifications';

export interface CustomScripture {
  id: string;
  text: string;
  reference?: string;
  addedAt: number;
}

export interface ReadingProgress {
  currentIndex: number;
  lastReadAt: number;
  completedToday: boolean;
}

const SCRIPTURES_STORAGE_KEY = 'custom_scriptures';
const PROGRESS_STORAGE_KEY = 'reading_progress';
const NOTIFICATION_TIME_KEY = 'notification_time';

const DEFAULT_NOTIFICATION_TIME = { hour: 9, minute: 0 };

export const [CustomScripturesProvider, useCustomScriptures] = createContextHook(() => {
  const [scriptures, setScriptures] = useState<CustomScripture[]>([]);
  const [progress, setProgress] = useState<ReadingProgress>({
    currentIndex: 0,
    lastReadAt: 0,
    completedToday: false,
  });
  const [notificationTime, setNotificationTime] = useState(DEFAULT_NOTIFICATION_TIME);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scripturesData, progressData, notifTimeData] = await Promise.all([
          AsyncStorage.getItem(SCRIPTURES_STORAGE_KEY),
          AsyncStorage.getItem(PROGRESS_STORAGE_KEY),
          AsyncStorage.getItem(NOTIFICATION_TIME_KEY),
        ]);

        if (scripturesData) {
          setScriptures(JSON.parse(scripturesData));
          console.log('Custom scriptures loaded');
        }

        if (progressData) {
          const parsed = JSON.parse(progressData);
          const lastReadDate = new Date(parsed.lastReadAt).toDateString();
          const today = new Date().toDateString();
          
          setProgress({
            ...parsed,
            completedToday: lastReadDate === today,
          });
          console.log('Reading progress loaded');
        }

        if (notifTimeData) {
          setNotificationTime(JSON.parse(notifTimeData));
        }
      } catch (error) {
        console.log('Error loading custom scriptures:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const scripturesPerDay = useMemo(() => {
    if (scriptures.length === 0) return 1;
    return Math.ceil(scriptures.length / 7);
  }, [scriptures.length]);

  const importScriptures = useCallback(async (scripturesText: string) => {
    const lines = scripturesText.split('\n').filter(line => line.trim());
    const newScriptures: CustomScripture[] = lines.map((line, index) => {
      const parts = line.split('|');
      return {
        id: `scripture-${Date.now()}-${index}`,
        text: parts[0].trim(),
        reference: parts[1]?.trim(),
        addedAt: Date.now(),
      };
    });

    setScriptures(newScriptures);
    
    const newProgress: ReadingProgress = {
      currentIndex: 0,
      lastReadAt: 0,
      completedToday: false,
    };
    setProgress(newProgress);

    try {
      await Promise.all([
        AsyncStorage.setItem(SCRIPTURES_STORAGE_KEY, JSON.stringify(newScriptures)),
        AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress)),
      ]);
      console.log(`Imported ${newScriptures.length} scriptures`);
    } catch (error) {
      console.log('Error saving scriptures:', error);
    }

    return newScriptures.length;
  }, []);

  const clearScriptures = useCallback(async () => {
    setScriptures([]);
    setProgress({
      currentIndex: 0,
      lastReadAt: 0,
      completedToday: false,
    });

    try {
      await Promise.all([
        AsyncStorage.removeItem(SCRIPTURES_STORAGE_KEY),
        AsyncStorage.removeItem(PROGRESS_STORAGE_KEY),
      ]);
      console.log('Scriptures cleared');
    } catch (error) {
      console.log('Error clearing scriptures:', error);
    }
  }, []);

  const markAsRead = useCallback(async () => {
    const now = Date.now();
    const newIndex = Math.min(progress.currentIndex + scripturesPerDay, scriptures.length - 1);
    const isLastGroup = newIndex >= scriptures.length - 1;
    
    const newProgress: ReadingProgress = {
      currentIndex: isLastGroup ? 0 : newIndex,
      lastReadAt: now,
      completedToday: true,
    };

    setProgress(newProgress);

    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
      console.log('Marked as read, moving to next day');
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  }, [progress.currentIndex, scriptures.length, scripturesPerDay]);

  const skipToNext = useCallback(async () => {
    const newIndex = Math.min(progress.currentIndex + scripturesPerDay, scriptures.length - 1);
    const isLastGroup = newIndex >= scriptures.length - 1;
    
    const newProgress: ReadingProgress = {
      ...progress,
      currentIndex: isLastGroup ? 0 : newIndex,
    };

    setProgress(newProgress);

    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
      console.log('Skipped to next day');
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  }, [progress, scriptures.length, scripturesPerDay]);

  const goToScripture = useCallback(async (index: number) => {
    if (index < 0 || index >= scriptures.length) return;

    const newProgress: ReadingProgress = {
      ...progress,
      currentIndex: index,
    };

    setProgress(newProgress);

    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
      console.log('Jumped to scripture', index);
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  }, [progress, scriptures.length]);

  const scheduleNotification = useCallback(async (hour: number, minute: number) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Scripture',
          body: 'Your daily scripture is waiting for you',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      const newTime = { hour, minute };
      setNotificationTime(newTime);

      await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, JSON.stringify(newTime));
      console.log(`Notification scheduled for ${hour}:${minute}`);
      return true;
    } catch (error) {
      console.log('Error scheduling notification:', error);
      return false;
    }
  }, []);

  const cancelNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Notifications cancelled');
    } catch (error) {
      console.log('Error cancelling notifications:', error);
    }
  }, []);

  const todayScriptures = useMemo(() => {
    if (scriptures.length === 0) return [];
    const startIndex = progress.currentIndex;
    const endIndex = Math.min(startIndex + scripturesPerDay, scriptures.length);
    return scriptures.slice(startIndex, endIndex);
  }, [scriptures, progress.currentIndex, scripturesPerDay]);

  const currentScripture = useMemo(() => {
    if (scriptures.length === 0) return null;
    return scriptures[progress.currentIndex] || null;
  }, [scriptures, progress.currentIndex]);

  const hasScriptures = scriptures.length > 0;

  const resetDailyCompletion = useCallback(async () => {
    const lastReadDate = new Date(progress.lastReadAt).toDateString();
    const today = new Date().toDateString();

    if (lastReadDate !== today && progress.completedToday) {
      const newProgress = { ...progress, completedToday: false };
      setProgress(newProgress);
      
      try {
        await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
      } catch (error) {
        console.log('Error resetting daily completion:', error);
      }
    }
  }, [progress]);

  useEffect(() => {
    resetDailyCompletion();
  }, [resetDailyCompletion]);

  return {
    scriptures,
    progress,
    currentScripture,
    todayScriptures,
    scripturesPerDay,
    hasScriptures,
    notificationTime,
    isLoading,
    importScriptures,
    clearScriptures,
    markAsRead,
    skipToNext,
    goToScripture,
    scheduleNotification,
    cancelNotifications,
  };
});
