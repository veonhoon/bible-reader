import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sun, Moon, BookOpen, ChevronRight, Bell, Bookmark, Heart, Globe } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, AppLanguage } from '@/contexts/LanguageContext';
// Bible Reader is FREE - no accounts needed
// Test notification removed - was only for development
import { ThemeMode } from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'sepia', label: 'Sepia', icon: BookOpen },
];

const LANGUAGE_OPTIONS: { lang: AppLanguage; label: string; nativeLabel: string }[] = [
  { lang: 'en', label: 'English', nativeLabel: 'English' },
  { lang: 'ko', label: 'Korean', nativeLabel: '한국어' },
];

export default function SettingsScreen() {
  const { colors, mode, setThemeMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Load notification preference on mount
  useEffect(() => {
    const loadNotificationPref = async () => {
      try {
        const value = await AsyncStorage.getItem('notificationsEnabled');
        setNotificationsEnabled(value === 'true');
      } catch (e) {
        console.log('Error loading notification preference');
      }
    };
    loadNotificationPref();
  }, []);

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notificationsEnabled', value.toString());
    } catch (e) {
      console.log('Error saving notification preference');
    }
  };

  const handleSavedPress = () => {
    router.push('/(tabs)/bookmarks');
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
        <Text style={[styles.title, { color: colors.text }]}>{t('settings')}</Text>

        {/* 1. Language - at the top */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('language').toUpperCase()}
          </Text>

          <View style={[styles.themeContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {LANGUAGE_OPTIONS.map((option) => {
              const isActive = language === option.lang;

              return (
                <TouchableOpacity
                  key={option.lang}
                  style={[
                    styles.themeOption,
                    isActive && { backgroundColor: colors.accent + '15' },
                  ]}
                  onPress={() => setLanguage(option.lang)}
                  testID={`language-${option.lang}`}
                >
                  <Globe
                    color={isActive ? colors.accent : colors.textMuted}
                    size={24}
                  />
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: isActive ? colors.accent : colors.text },
                    ]}
                  >
                    {option.nativeLabel}
                  </Text>
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Reading Mode */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('readingMode').toUpperCase()}
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
                    {t(option.label.toLowerCase())}
                  </Text>
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Saved Scriptures and Highlights */}
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
                    {t('savedScriptures')}
                  </Text>
                  <Text style={[styles.menuItemSubtitle, { color: colors.textMuted }]}>
                    {t('viewBookmarks')}
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Notifications Toggle */}
        <View style={styles.section}>
          <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.toggleItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                  <Bell color={colors.accent} size={20} />
                </View>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                  {t('notifications')}
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

        </View>

        {/* 5. Reading is always free */}
        <View style={[styles.freeNotice, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <BookOpen color={colors.textMuted} size={18} />
          <Text style={[styles.freeNoticeText, { color: colors.textSecondary }]}>
            {t('readingIsFree')}
          </Text>
        </View>

        {/* 6. Made with faith and love */}
        <View style={styles.madeWithLove}>
          <Heart color={colors.textMuted} size={16} fill={colors.textMuted} />
          <Text style={[styles.madeWithLoveText, { color: colors.textMuted }]}>
            {t('madeWithLove')}
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
  toggleItem: {
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
});
