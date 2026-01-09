import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sun, Moon, BookOpen, ChevronRight, Bell, Info, Crown, Clock, Shield, Database } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ThemeMode } from '@/constants/colors';
import { useAdmin } from '@/contexts/AdminContext';


const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'sepia', label: 'Sepia', icon: BookOpen },
];

export default function SettingsScreen() {
  const { colors, mode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    isSubscribed,
    isTrialActive,
    trialDaysRemaining,
    subscription,
    openPaywall,
  } = useSubscription();
  const { isAdmin } = useAdmin();

  const handleNotificationsPress = () => {
    if (isSubscribed) {
      router.push('/notification-settings');
    } else {
      openPaywall();
    }
  };

  const getSubscriptionStatusText = () => {
    if (isTrialActive) {
      return `${trialDaysRemaining} days left in trial`;
    }
    if (subscription.status === 'active') {
      return subscription.plan === 'annual' ? 'Annual subscriber' : 'Monthly subscriber';
    }
    if (subscription.status === 'expired' || subscription.status === 'cancelled') {
      return 'Subscription ended';
    }
    return 'Free features active';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {isSubscribed && (
          <View style={[styles.subscriptionCard, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '25' }]}>
            <View style={styles.subscriptionHeader}>
              <View style={[styles.crownIcon, { backgroundColor: colors.gold + '20' }]}>
                {isTrialActive ? (
                  <Clock color={colors.gold} size={20} />
                ) : (
                  <Crown color={colors.gold} size={20} />
                )}
              </View>
              <View style={styles.subscriptionInfo}>
                <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
                  {isTrialActive ? 'Free Trial Active' : 'Reminder Access'}
                </Text>
                <Text style={[styles.subscriptionSubtitle, { color: colors.textSecondary }]}>
                  {getSubscriptionStatusText()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {!isSubscribed && (
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: colors.accent }]}
            onPress={openPaywall}
            testID="upgrade-button"
          >
            <View style={styles.upgradeContent}>
              <Bell color="#FFFFFF" size={22} />
              <View style={styles.upgradeTextContainer}>
                <Text style={styles.upgradeTitle}>Enable Reminders</Text>
                <Text style={styles.upgradeSubtitle}>
                  Get weekly scriptures delivered to you
                </Text>
              </View>
            </View>
            <ChevronRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            READING MODE
          </Text>
          
          <View style={[styles.themeContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = mode === option.mode;
              
              return (
                <TouchableOpacity
                  key={option.mode}
                  style={[
                    styles.themeOption,
                    isActive && { backgroundColor: colors.accent + '15' },
                  ]}
                  onPress={() => setThemeMode(option.mode)}
                  testID={`theme-${option.mode}`}
                >
                  <Icon
                    color={isActive ? colors.accent : colors.textMuted}
                    size={24}
                  />
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: isActive ? colors.accent : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            REMINDERS
          </Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNotificationsPress}
              testID="notifications-settings"
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                  <Bell color={colors.accent} size={20} />
                </View>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                    Push Notifications
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                    {isSubscribed ? 'Manage your reminders' : 'Start free trial'}
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            BIBLE DATA
          </Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/api-settings')}
              testID="api-settings"
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                  <Database color={colors.accent} size={20} />
                </View>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                    Bible Data
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                    NIV Translation • Manage cache
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.menuItem} testID="about-app">
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.gold + '15' }]}>
                  <Info color={colors.gold} size={20} />
                </View>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                    About This App
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                    Version 1.0.0
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ADMIN
          </Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/admin')}
              testID="admin-panel"
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isAdmin ? colors.accent + '15' : colors.textMuted + '15' }]}>
                  <Shield color={isAdmin ? colors.accent : colors.textMuted} size={20} />
                </View>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                    Admin Panel
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                    {isAdmin ? 'Manage scriptures & notifications' : 'Admin login required'}
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.freeNotice, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <BookOpen color={colors.textMuted} size={18} />
          <Text style={[styles.freeNoticeText, { color: colors.textSecondary }]}>
            Reading is always free.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Made with faith and love
          </Text>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            NIV Translation
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  subscriptionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  crownIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  subscriptionSubtitle: {
    fontSize: 14,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  upgradeSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  themeContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  menuContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
  freeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  freeNoticeText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
  },
});
