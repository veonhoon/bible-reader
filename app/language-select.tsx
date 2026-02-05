import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LanguageSelectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const selectLanguage = async (lang: 'en' | 'ko') => {
    await AsyncStorage.setItem('userLanguage', lang);
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    router.replace('/(tabs)');
  };

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
});
