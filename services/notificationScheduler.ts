import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
  WeeklyContent,
  Snippet,
  getLatestWeeklyContent,
} from './weeklyContentService';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';
const NOTIFICATIONS_PROMPTED_KEY = '@notifications_prompted';

// Active hours: 10 AM to 9 PM (user's local time)
const ACTIVE_HOURS_START = 10; // 10 AM
const ACTIVE_HOURS_END = 21;   // 9 PM

// Calculate notification times based on number of teachings
// Spreads notifications evenly between 10 AM and 9 PM
function getNotificationTimes(count: number): { hours: number; minutes: number }[] {
  if (count <= 0) return [];
  if (count === 1) return [{ hours: 12, minutes: 0 }]; // Noon for single notification
  
  const times: { hours: number; minutes: number }[] = [];
  const totalMinutes = (ACTIVE_HOURS_END - ACTIVE_HOURS_START) * 60; // 11 hours = 660 minutes
  const interval = totalMinutes / (count - 1); // Spread evenly
  
  for (let i = 0; i < count; i++) {
    const minutesFromStart = Math.round(i * interval);
    const totalMins = ACTIVE_HOURS_START * 60 + minutesFromStart;
    const hours = Math.floor(totalMins / 60);
    const minutes = totalMins % 60;
    
    // Round to nearest 15 minutes for cleaner times
    const roundedMinutes = Math.round(minutes / 15) * 15;
    times.push({ 
      hours: roundedMinutes >= 60 ? hours + 1 : hours, 
      minutes: roundedMinutes % 60 
    });
  }
  
  return times;
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-teachings', {
        name: 'Daily Teachings',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    console.log('[Notifications] Permissions granted');
    return true;
  } catch (error) {
    console.error('[Notifications] Error requesting permissions:', error);
    return false;
  }
}

// Check if user has been prompted for notifications
export async function hasBeenPromptedForNotifications(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATIONS_PROMPTED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

// Mark that user has been prompted
export async function setNotificationsPrompted(): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_PROMPTED_KEY, 'true');
}

// Check if notifications are enabled by user
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

// Set notifications enabled/disabled
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
    
    if (enabled) {
      // Request permissions and schedule notifications
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await scheduleSnippetNotifications();
      }
    } else {
      // Cancel all when disabled
      await cancelAllScheduledNotifications();
    }
  } catch (error) {
    console.error('[Notifications] Error setting enabled:', error);
  }
}

// Prompt user for notifications on first launch
export async function promptForNotificationsIfNeeded(): Promise<boolean> {
  const prompted = await hasBeenPromptedForNotifications();
  if (prompted) {
    return false; // Already prompted
  }

  // Mark as prompted
  await setNotificationsPrompted();

  // Request permissions
  const granted = await requestNotificationPermissions();
  
  if (granted) {
    // Auto-enable if they granted permission
    await setNotificationsEnabled(true);
    return true;
  }

  return false;
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[Notifications] All cancelled');
}

// Schedule notifications - FREE for everyone
// More teachings = more notifications throughout the day
export async function scheduleSnippetNotifications(language?: string): Promise<number> {
  console.log('[Notifications] Starting schedule...');

  // Check if user has notifications enabled
  const enabled = await areNotificationsEnabled();
  if (!enabled) {
    console.log('[Notifications] Disabled by user');
    return 0;
  }

  // Check permissions
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('[Notifications] No permission');
    return 0;
  }

  // Get content (will use user's language setting)
  const content = await getLatestWeeklyContent(language);
  if (!content || !content.snippets.length) {
    console.log('[Notifications] No content available');
    return 0;
  }

  // Cancel existing notifications
  await cancelAllScheduledNotifications();

  const allSnippets = content.snippets;
  let scheduledCount = 0;
  const now = new Date();
  const publishedAt = new Date(content.publishedAt);

  // Schedule for next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);
    targetDate.setHours(0, 0, 0, 0);

    // Calculate which day of the week this is (1-7) since publish
    const daysDiff = Math.floor((targetDate.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));
    const dayNumber = (daysDiff % 7) + 1; // 1-7

    // Get snippets for this day
    const daySnippets = allSnippets.filter(s => s.day === dayNumber);
    
    if (daySnippets.length === 0) continue;

    // Calculate notification times based on number of teachings
    const times = getNotificationTimes(daySnippets.length);
    console.log(`[Notifications] Day ${dayNumber}: ${daySnippets.length} teachings, ${times.length} notifications`);

    // Schedule each snippet at its time
    for (let i = 0; i < daySnippets.length && i < times.length; i++) {
      const snippet = daySnippets[i];
      const time = times[i];

      const scheduledDate = new Date(targetDate);
      scheduledDate.setHours(time.hours, time.minutes, 0, 0);

      // Skip if in the past
      if (scheduledDate <= now) continue;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: snippet.title || 'Bible Reader',
            subtitle: snippet.scripture?.reference || undefined,
            body: snippet.body?.substring(0, 150) + (snippet.body?.length > 150 ? '...' : ''),
            sound: true,
            data: {
              snippetId: snippet.id,
              weekId: content.weekId,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: scheduledDate,
          },
        });

        console.log(`[Notifications] Scheduled: "${snippet.title}" at ${scheduledDate.toLocaleString()}`);
        scheduledCount++;
      } catch (error) {
        console.error('[Notifications] Error scheduling:', error);
      }
    }
  }

  console.log(`[Notifications] Total scheduled: ${scheduledCount}`);
  return scheduledCount;
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Get the Expo push token for this device
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error('[Notifications] No project ID');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[Notifications] Push Token:', token.data);
    return token.data;
  } catch (error) {
    console.error('[Notifications] Error getting push token:', error);
    return null;
  }
}

// Handle notification when app is open
export function setupNotificationHandler(
  onNotificationTap: (snippetId: string, weekId: string) => void
) {
  console.log('[Notifications] Setting up notification handlers');

  // Handle notification when app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Handle notification tap
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      if (data?.snippetId && data?.weekId) {
        onNotificationTap(data.snippetId as string, data.weekId as string);
      }
    }
  );

  console.log('[Notifications] Notification handlers set up successfully');
  return () => subscription.remove();
}

// Send a test notification immediately (for testing)
export async function sendTestNotification(language: string = 'en'): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('[Notifications] No permission for test');
      return false;
    }

    const isKorean = language === 'ko';
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isKorean ? '오늘의 가르침' : "Today's Teaching",
        subtitle: isKorean ? '야고보서 4:8' : 'James 4:8',
        body: isKorean 
          ? '하나님을 가까이하라 그리하면 너희를 가까이하시리라' 
          : 'Come near to God and he will come near to you.',
        sound: true,
        data: { test: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3, // 3 seconds from now
      },
    });

    console.log('[Notifications] Test notification scheduled for 3 seconds');
    return true;
  } catch (error) {
    console.error('[Notifications] Error sending test:', error);
    return false;
  }
}

// Check for initial notification (app opened from notification)
export async function getInitialNotification(): Promise<{ snippetId: string; weekId: string } | null> {
  console.log('[Notifications] Checking for initial notification...');
  
  const response = await Notifications.getLastNotificationResponseAsync();
  if (response) {
    const data = response.notification.request.content.data;
    if (data?.snippetId && data?.weekId) {
      console.log('[Notifications] Found initial notification:', data.snippetId);
      return {
        snippetId: data.snippetId as string,
        weekId: data.weekId as string,
      };
    }
  }
  
  console.log('[Notifications] No initial notification found');
  return null;
}
