import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Sun, Moon, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    isSubscribed,
    isTrialActive,
    trialDaysRemaining,
    notificationPrefs,
    updateNotificationPrefs,
  } = useSubscription();

  const handleToggleWeekly = (value: boolean) => {
    updateNotificationPrefs({ weeklyScripture: value });
    console.log('Weekly scripture notifications:', value);
  };

  const handleToggleDaily = (value: boolean) => {
    updateNotificationPrefs({ dailyVerse: value });
    console.log('Daily verse notifications:', value);
  };

  const handleScheduleChange = (schedule: 'morning' | 'evening') => {
    updateNotificationPrefs({ schedule });
    console.log('Notification schedule:', schedule);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notifications
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {isTrialActive && (
          <View style={[styles.trialBanner, { backgroundColor: colors.gold + '15', borderColor: colors.gold + '30' }]}>
            <Clock color={colors.gold} size={18} />
            <Text style={[styles.trialText, { color: colors.gold }]}>
              {trialDaysRemaining} days left in your free trial
            </Text>
          </View>
        )}

        {!isSubscribed && (
          <View style={[styles.infoCard, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '20' }]}>
            <Bell color={colors.accent} size={20} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Start your free trial to enable notifications.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NOTIFICATION TYPES
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Weekly Scripture
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  Receive the weekly curated scripture passage
                </Text>
              </View>
              <Switch
                value={notificationPrefs.weeklyScripture}
                onValueChange={handleToggleWeekly}
                trackColor={{ false: colors.border, true: colors.accent + '60' }}
                thumbColor={notificationPrefs.weeklyScripture ? colors.accent : colors.textMuted}
                disabled={!isSubscribed}
                testID="weekly-switch"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Daily Verse
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
                  A gentle daily reminder with a verse
                </Text>
              </View>
              <Switch
                value={notificationPrefs.dailyVerse}
                onValueChange={handleToggleDaily}
                trackColor={{ false: colors.border, true: colors.accent + '60' }}
                thumbColor={notificationPrefs.dailyVerse ? colors.accent : colors.textMuted}
                disabled={!isSubscribed}
                testID="daily-switch"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DELIVERY TIME
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.scheduleOption,
                notificationPrefs.schedule === 'morning' && {
                  backgroundColor: colors.accent + '10',
                },
              ]}
              onPress={() => handleScheduleChange('morning')}
              disabled={!isSubscribed}
              testID="schedule-morning"
            >
              <View style={[styles.scheduleIcon, { backgroundColor: colors.gold + '15' }]}>
                <Sun color={colors.gold} size={20} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                  Morning
                </Text>
                <Text style={[styles.scheduleTime, { color: colors.textMuted }]}>
                  Around 7:00 AM
                </Text>
              </View>
              <View style={[
                styles.radioOuter,
                { borderColor: notificationPrefs.schedule === 'morning' ? colors.accent : colors.border }
              ]}>
                {notificationPrefs.schedule === 'morning' && (
                  <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                )}
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[
                styles.scheduleOption,
                notificationPrefs.schedule === 'evening' && {
                  backgroundColor: colors.accent + '10',
                },
              ]}
              onPress={() => handleScheduleChange('evening')}
              disabled={!isSubscribed}
              testID="schedule-evening"
            >
              <View style={[styles.scheduleIcon, { backgroundColor: colors.accent + '15' }]}>
                <Moon color={colors.accent} size={20} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                  Evening
                </Text>
                <Text style={[styles.scheduleTime, { color: colors.textMuted }]}>
                  Around 8:00 PM
                </Text>
              </View>
              <View style={[
                styles.radioOuter,
                { borderColor: notificationPrefs.schedule === 'evening' ? colors.accent : colors.border }
              ]}>
                {notificationPrefs.schedule === 'evening' && (
                  <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.footerNote, { borderColor: colors.border }]}>
          <Text style={[styles.footerNoteText, { color: colors.textMuted }]}>
            Notifications are delivered at approximate times and may vary based on your device settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 13,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footerNote: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerNoteText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
