import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WeeklyContent,
  Snippet,
  NotificationSchedule,
  getNotificationSchedule,
  getLatestWeeklyContent,
} from './weeklyContentService';

const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';
const LAST_SCHEDULED_WEEK_KEY = '@last_scheduled_week';
const SNIPPET_INDEX_KEY = '@current_snippet_index';

// Day name to number mapping (0 = Sunday, 1 = Monday, etc.)
const DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
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

  return true;
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
      // Schedule notifications when enabled
      await scheduleSnippetNotifications();
    } else {
      // Cancel all when disabled
      await cancelAllScheduledNotifications();
    }
  } catch (error) {
    console.error('Error setting notifications enabled:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All scheduled notifications cancelled');
}

// Parse time string to hours and minutes
function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours: hours || 9, minutes: minutes || 0 };
}

// Get the next occurrence of a specific day and time
function getNextOccurrence(
  targetDay: number,
  hours: number,
  minutes: number,
  offsetWeeks: number = 0
): Date {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Calculate days until target day
  let daysUntil = targetDay - currentDay;

  // If target day is today, check if time has passed
  if (daysUntil === 0 && offsetWeeks === 0) {
    const targetMinutes = hours * 60 + minutes;
    const currentMinutes = currentHour * 60 + currentMinute;
    if (targetMinutes <= currentMinutes) {
      daysUntil = 7;
    }
  } else if (daysUntil < 0) {
    daysUntil += 7;
  }

  // Add offset weeks
  daysUntil += offsetWeeks * 7;

  const scheduledDate = new Date(now);
  scheduledDate.setDate(now.getDate() + daysUntil);
  scheduledDate.setHours(hours, minutes, 0, 0);

  return scheduledDate;
}

// Get current snippet index and increment
async function getNextSnippetIndex(totalSnippets: number): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(SNIPPET_INDEX_KEY);
    let index = stored ? parseInt(stored, 10) : 0;

    // Wrap around if we've gone through all snippets
    if (index >= totalSnippets) {
      index = 0;
    }

    // Save next index
    await AsyncStorage.setItem(SNIPPET_INDEX_KEY, String(index + 1));

    return index;
  } catch {
    return 0;
  }
}

// Schedule notifications based on admin schedule and snippets
export async function scheduleSnippetNotifications(): Promise<number> {
  // Check if user has notifications enabled
  const enabled = await areNotificationsEnabled();
  if (!enabled) {
    console.log('Notifications disabled by user');
    return 0;
  }

  // Request permissions
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('No notification permission');
    return 0;
  }

  // Get content and schedule from Firebase
  const [content, schedule] = await Promise.all([
    getLatestWeeklyContent(),
    getNotificationSchedule(),
  ]);

  if (!content || !content.snippets.length) {
    console.log('No content available');
    return 0;
  }

  if (!schedule) {
    console.log('No notification schedule configured');
    return 0;
  }

  // Cancel existing notifications
  await cancelAllScheduledNotifications();

  const { perDay, days, times } = schedule;
  const snippets = content.snippets;

  // Get starting snippet index
  let snippetIndex = await getNextSnippetIndex(snippets.length);
  let scheduledCount = 0;

  // Schedule for next 2 weeks to ensure continuous notifications
  for (let week = 0; week < 2; week++) {
    for (const day of days) {
      const dayNumber = DAY_MAP[day];
      if (dayNumber === undefined) continue;

      for (let timeIndex = 0; timeIndex < perDay && timeIndex < times.length; timeIndex++) {
        const { hours, minutes } = parseTime(times[timeIndex]);
        const scheduledDate = getNextOccurrence(dayNumber, hours, minutes, week);

        // Skip if in the past
        if (scheduledDate <= new Date()) continue;

        // Get snippet for this notification (cycle through)
        const snippet = snippets[snippetIndex % snippets.length];
        snippetIndex++;

        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: snippet.title || 'Bible Teacher',
              subtitle: snippet.subtitle || undefined,
              body: snippet.body,
              sound: true,
              data: {
                snippetId: snippet.id,
                weekId: content.weekId,
              },
            },
            trigger: {
              date: scheduledDate,
            },
          });

          console.log(
            `Scheduled: "${snippet.title}" for ${scheduledDate.toLocaleString()}`
          );
          scheduledCount++;
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      }
    }
  }

  // Save the snippet index for next scheduling
  await AsyncStorage.setItem(SNIPPET_INDEX_KEY, String(snippetIndex));

  console.log(`Scheduled ${scheduledCount} notifications`);
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

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    console.log('Expo Push Token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

// Handle notification response (when user taps notification)
export function setupNotificationHandler(
  onNotificationTap: (snippetId: string, weekId: string) => void
) {
  // Handle notification when app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
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

  return () => subscription.remove();
}
