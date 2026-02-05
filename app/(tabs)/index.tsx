import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, Clock, Bell, BellOff, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
// Bible Reader is FREE - no subscription needed
import {
  WeeklyContent,
  Snippet,
  subscribeToLatestWeeklyContent,
  getTodaysSnippets,
  getDailyProgress,
  DailyProgress,
} from '@/services/weeklyContentService';
import {
  areNotificationsEnabled,
  setNotificationsEnabled,
  scheduleSnippetNotifications,
} from '@/services/notificationScheduler';

// Format date for display
const formatWeekDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { lastRead } = useReadingProgress();
  // Bible Reader is FREE - no subscription needed
  const isSubscribed = true; // Always true - free app
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [content, setContent] = useState<WeeklyContent | null>(null);
  const [todaysSnippets, setTodaysSnippets] = useState<Snippet[]>([]);
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);

  // Load content and notification settings
  useEffect(() => {
    console.log('[HomeScreen] Setting up weekly content subscription');

    const unsubscribe = subscribeToLatestWeeklyContent((data) => {
      console.log('[HomeScreen] Content update received:', data ? 'has data' : 'no data');

      if (data) {
        console.log('[HomeScreen] Content details:', {
          weekId: data.weekId,
          weekTitle: data.weekTitle,
          totalSnippets: data.snippets?.length || 0,
          publishedAt: data.publishedAt
        });
      }

      setContent(data);
      if (data) {
        // Get only today's snippets
        const todaySnippets = getTodaysSnippets(data);
        console.log('[HomeScreen] Today\'s snippets:', todaySnippets.length, 'snippets');
        setTodaysSnippets(todaySnippets);
        setProgress(getDailyProgress(data));
      } else {
        console.log('[HomeScreen] No content available');
        setTodaysSnippets([]);
        setProgress(null);
      }
      setIsLoading(false);
    });

    // Check notification status
    areNotificationsEnabled().then((enabled) => {
      console.log('[HomeScreen] Notifications enabled:', enabled);
      setNotificationsOn(enabled);
    });

    return () => {
      console.log('[HomeScreen] Cleaning up weekly content subscription');
      unsubscribe();
    };
  }, []);

  // Schedule notifications when content changes and notifications are enabled
  useEffect(() => {
    if (content && notificationsOn && isSubscribed) {
      scheduleSnippetNotifications();
    }
  }, [content?.weekId, notificationsOn, isSubscribed]);

  // Toggle notifications - FREE for everyone in Bible Reader
  const handleNotificationToggle = async (value: boolean) => {
    setIsTogglingNotifications(true);
    await setNotificationsEnabled(value);
    setNotificationsOn(value);
    setIsTogglingNotifications(false);
  };

  // Navigate to snippet detail
  const openSnippet = (snippet: Snippet) => {
    router.push(`/snippet/${snippet.id}`);
  };

  const hasContent = content !== null && todaysSnippets.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading content...
            </Text>
          </View>
        )}

        {!hasContent && !isLoading && (
          <View style={[styles.noContentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <BookOpen color={colors.textMuted} size={40} />
            <Text style={[styles.noContentTitle, { color: colors.text }]}>
              No Content Yet
            </Text>
            <Text style={[styles.noContentText, { color: colors.textSecondary }]}>
              Daily teachings will appear here once published. Check back soon!
            </Text>
          </View>
        )}

        {/* Weekly Content Title - At the very top */}
        {hasContent && content && progress && (
          <>
            <View style={styles.headerSection}>
              <Text style={[styles.weekTitle, { color: colors.text }]}>
                {content.weekTitle}
              </Text>
              <View style={styles.dateRow}>
                <Calendar color={colors.textMuted} size={16} />
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  {formatWeekDate(content.publishedAt)}
                </Text>
              </View>
              {/* Day Progress */}
              <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>
                  Day {progress.currentDay + 1} of 7
                </Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: colors.accent,
                        width: `${((progress.currentDay + 1) / 7) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressSubtext, { color: colors.textSecondary }]}>
                  {todaysSnippets.length} teachings for today
                </Text>
              </View>
            </View>

            {/* Notification Toggle */}
            <View style={[styles.notificationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.notificationContent}>
                {notificationsOn ? (
                  <Bell color={colors.accent} size={24} />
                ) : (
                  <BellOff color={colors.textMuted} size={24} />
                )}
                <View style={styles.notificationText}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    Daily Teachings
                  </Text>
                  <Text style={[styles.notificationDesc, { color: colors.textSecondary }]}>
                    {notificationsOn
                      ? 'Receive daily scripture insights'
                      : 'Turn on to get daily reminders'}
                  </Text>
                </View>
                {isTogglingNotifications ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Switch
                    value={notificationsOn}
                    onValueChange={handleNotificationToggle}
                    trackColor={{ false: colors.border, true: colors.accent + '80' }}
                    thumbColor={notificationsOn ? colors.accent : colors.textMuted}
                  />
                )}
              </View>
            </View>

            {/* Today's Snippets List */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Today's Teachings
            </Text>
            <View style={styles.snippetsList}>
              {todaysSnippets.map((snippet, index) => (
                <TouchableOpacity
                  key={snippet.id}
                  style={[styles.snippetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => openSnippet(snippet)}
                  activeOpacity={0.7}
                >
                  <View style={styles.snippetNumber}>
                    <Text style={[styles.snippetNumberText, { color: colors.accent }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.snippetContent}>
                    <Text style={[styles.snippetTitle, { color: colors.text }]} numberOfLines={1}>
                      {snippet.title}
                    </Text>
                    <Text style={[styles.snippetBody, { color: colors.textSecondary }]} numberOfLines={2}>
                      {snippet.body}
                    </Text>
                    {snippet.scripture?.reference && (
                      <Text style={[styles.snippetScripture, { color: colors.accent }]}>
                        {snippet.scripture.reference}
                      </Text>
                    )}
                  </View>
                  <ChevronRight color={colors.textMuted} size={20} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Continue where you left off - At the very bottom */}
            {lastRead && (
              <TouchableOpacity
                style={[styles.continueCard, { backgroundColor: colors.accent }]}
                onPress={() => router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`)}
                activeOpacity={0.7}
              >
                <View style={styles.continueContent}>
                  <View style={[styles.continueIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Clock color="#FFFFFF" size={24} />
                  </View>
                  <View style={styles.continueTextContainer}>
                    <Text style={styles.continueLabel}>Continue where you left off</Text>
                    <Text style={styles.continueTitle}>
                      {lastRead.bookName} {lastRead.chapter}
                    </Text>
                  </View>
                  <ChevronRight color="#FFFFFF" size={24} />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Show continue reading even when no content */}
        {!hasContent && !isLoading && lastRead && (
          <TouchableOpacity
            style={[styles.continueCard, { backgroundColor: colors.accent, marginTop: 16 }]}
            onPress={() => router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`)}
            activeOpacity={0.7}
          >
            <View style={styles.continueContent}>
              <View style={[styles.continueIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Clock color="#FFFFFF" size={24} />
              </View>
              <View style={styles.continueTextContainer}>
                <Text style={styles.continueLabel}>Continue where you left off</Text>
                <Text style={styles.continueTitle}>
                  {lastRead.bookName} {lastRead.chapter}
                </Text>
              </View>
              <ChevronRight color="#FFFFFF" size={24} />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  weekTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 6,
  },
  snippetCountText: {
    fontSize: 14,
    marginTop: 4,
  },
  progressCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  continueCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  continueTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  continueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  notificationDesc: {
    fontSize: 13,
  },
  loadingCard: {
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  noContentCard: {
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  noContentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noContentText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  snippetsList: {
    gap: 12,
  },
  snippetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  snippetNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  snippetNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  snippetContent: {
    flex: 1,
    marginRight: 8,
  },
  snippetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  snippetBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  snippetScripture: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
});
