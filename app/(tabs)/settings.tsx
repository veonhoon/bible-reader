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
import { Sun, Moon, BookOpen, ChevronRight, Bell, Crown, Clock, User, LogOut, Mail, Bookmark, Heart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeMode } from '@/constants/colors';

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
    isPremiumFromFirestore,
    isTrialActive,
    trialDaysRemaining,
    subscription,
    openPaywall,
  } = useSubscription();
  const { user, isAuthenticated, logout } = useAuth();

  const handleNotificationsPress = () => {
    if (isSubscribed) {
      router.push('/notification-settings');
    } else {
      openPaywall();
    }
  };

  const handleSavedPress = () => {
    router.push('/(tabs)/bookmarks');
  };

  const handleLoginPress = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    await logout();
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'google': return 'Google';
      case 'apple': return 'Apple';
      case 'email': return 'Email';
      default: return provider;
    }
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

        {/* 1. Reading Mode - at the top */}
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

        {/* 2. Saved Scriptures and Highlights */}
        <View style={styles.section}>
          <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSavedPress}
              testID="saved-scriptures"
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.gold + '15' }]}>
                  <Bookmark color={colors.gold} size={20} />
                </View>
                <View>
                  <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                    Saved Scriptures & Highlights
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                    View your bookmarks and highlights
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Enable Reminders and Push Notifications */}
        <View style={styles.section}>
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
                    Reminders & Notifications
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                    {isSubscribed ? 'Manage your reminders' : 'Enable push notifications'}
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Reading is always free */}
        <View style={[styles.freeNotice, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <BookOpen color={colors.textMuted} size={18} />
          <Text style={[styles.freeNoticeText, { color: colors.textSecondary }]}>
            Reading is always free.
          </Text>
        </View>

        {/* 5. Made with faith and love */}
        <View style={styles.madeWithLove}>
          <Heart color={colors.textMuted} size={16} fill={colors.textMuted} />
          <Text style={[styles.madeWithLoveText, { color: colors.textMuted }]}>
            Made with faith and love
          </Text>
        </View>

        {/* 6. Account Section - at the bottom */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ACCOUNT
          </Text>

          {isAuthenticated && user ? (
            <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.accountHeader}>
                <View style={[styles.avatarContainer, { backgroundColor: colors.accent }]}>
                  <Text style={styles.avatarText}>
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {user.displayName || 'User'}
                  </Text>
                  <View style={styles.accountEmailRow}>
                    <Mail color={colors.textMuted} size={14} />
                    <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
                      {user.email}
                    </Text>
                  </View>
                  <View style={[styles.providerBadge, { backgroundColor: colors.accent + '15' }]}>
                    <Text style={[styles.providerText, { color: colors.accent }]}>
                      {getProviderLabel(user.provider)}
                    </Text>
                    {user.isPremium && (
                      <View style={[styles.premiumBadge, { backgroundColor: colors.gold }]}>
                        <Crown color="#FFFFFF" size={10} />
                        <Text style={styles.premiumText}>Premium</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.logoutButton, { borderColor: colors.border }]}
                onPress={handleLogout}
              >
                <LogOut color={colors.error} size={18} />
                <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.signInCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleLoginPress}
            >
              <View style={styles.signInContent}>
                <View style={[styles.signInIconContainer, { backgroundColor: colors.accent + '15' }]}>
                  <User color={colors.accent} size={24} />
                </View>
                <View style={styles.signInTextContainer}>
                  <Text style={[styles.signInTitle, { color: colors.text }]}>
                    Sign In
                  </Text>
                  <Text style={[styles.signInSubtitle, { color: colors.textSecondary }]}>
                    Sync your progress across devices
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          )}
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
    flex: 1,
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
  madeWithLove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  madeWithLoveText: {
    fontSize: 14,
  },
  accountCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  accountEmail: {
    fontSize: 14,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 8,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
  },
  signInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  signInContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  signInIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInTextContainer: {
    flex: 1,
  },
  signInTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  signInSubtitle: {
    fontSize: 14,
  },
});
