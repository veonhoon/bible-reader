import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';

const LANGUAGE_STORAGE_KEY = 'bible_app_language';

export type AppLanguage = 'en' | 'ko';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && (stored === 'en' || stored === 'ko')) {
          setLanguageState(stored as AppLanguage);
        }
      } catch (error) {
        console.log('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (newLanguage: AppLanguage) => {
    setLanguageState(newLanguage);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      console.log('Language saved:', newLanguage);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  }, []);

  const isEnglish = language === 'en';
  const isKorean = language === 'ko';

  return {
    language,
    setLanguage,
    isEnglish,
    isKorean,
    isLoading,
  };
});
