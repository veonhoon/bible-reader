import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bell } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { setCurrentBibleVersion } from '@/services/bibleApi';
import { 
  requestNotificationPermissions, 
  setNotificationsEnabled,
  scheduleSnippetNotifications 
} from '@/services/notificationScheduler';

export default function LanguageSelectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setLanguage } = useLanguage();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en' | 'ko'>('en');

  const selectLanguage = async (lang: 'en' | 'ko') => {
    // Set app language
    await setLanguage(lang);
    setSelectedLang(lang);
    
    // Set appropriate Bible version
    if (lang === 'ko') {
      await setCurrentBibleVersion('KRV');
    } else {
      await setCurrentBibleVersion('NIV');
    }
    
    // Show notification prompt
    setShowNotificationPrompt(true);
  };

  const handleNotificationChoice = async (enable: boolean) => {
    if (enable) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await setNotificationsEnabled(true);
        await scheduleSnippetNotifications(selectedLang);
      }
    }
    
    // Mark onboarding complete and go to home
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    router.replace('/(tabs)');
  };

  // Show notification prompt screen
  if (showNotificationPrompt) {
    const isKorean = selectedLang === 'ko';
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.notificationIcon}>
          <Bell color="#4ade80" size={64} />
        </View>

        <Text style={styles.title}>
          {isKorean ? '알림 받기' : 'Stay Connected'}
        </Text>
        <Text style={styles.notificationSubtitle}>
          {isKorean 
            ? '매일 4회 말씀 알림을 받으세요\n오전 10시 ~ 오후 9시'
            : 'Receive daily teachings 4 times a day\n10 AM - 9 PM'}
        </Text>

        <View style={styles.notificationSection}>
          <TouchableOpacity 
            style={styles.enableButton}
            onPress={() => handleNotificationChoice(true)}
            activeOpacity={0.8}
          >
            <Bell color="#ffffff" size={20} />
            <Text style={styles.enableButtonText}>
              {isKorean ? '알림 켜기' : 'Enable Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => handleNotificationChoice(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>
              {isKorean ? '나중에' : 'Maybe Later'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          {isKorean 
            ? '설정에서 언제든지 변경할 수 있습니다'
            : 'You can change this in Settings'}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}
    >
      {/* App Icon */}
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#4ade80', '#22d3ee', '#818cf8']}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.iconCross}>✝</Text>
        </LinearGradient>
      </View>

      <Text style={styles.title}>Bible Reader</Text>
      <Text style={styles.subtitle}>Weekly Teachings & Daily Wisdom</Text>

      <View style={styles.languageSection}>
        <Text style={styles.selectLabel}>Select your language</Text>
        <Text style={styles.selectLabelKo}>언어를 선택하세요</Text>

        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => selectLanguage('en')}
          activeOpacity={0.8}
        >
          <Text style={styles.flag}>🇺🇸</Text>
          <View style={styles.languageText}>
            <Text style={styles.languageName}>English</Text>
            <Text style={styles.languageNative}>English</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => selectLanguage('ko')}
          activeOpacity={0.8}
        >
          <Text style={styles.flag}>🇰🇷</Text>
          <View style={styles.languageText}>
            <Text style={styles.languageName}>Korean</Text>
            <Text style={styles.languageNative}>한국어</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        You can change this later in Settings
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCross: {
    fontSize: 48,
    color: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 60,
  },
  languageSection: {
    width: '100%',
    alignItems: 'center',
  },
  selectLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  selectLabelKo: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 32,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  flag: {
    fontSize: 40,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  languageNative: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 2,
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    color: '#71717a',
  },
  notificationIcon: {
    marginBottom: 32,
    padding: 24,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 32,
  },
  notificationSubtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 24,
  },
  notificationSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ade80',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    gap: 10,
  },
  enableButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  skipButton: {
    padding: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#71717a',
  },
});
