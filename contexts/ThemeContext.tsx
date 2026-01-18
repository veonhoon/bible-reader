import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeColors, ThemeMode, ThemeColorScheme } from '@/constants/colors';
import { subscribeToAppSettings } from '@/services/scripturesService';

const THEME_STORAGE_KEY = 'bible_app_theme';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadTheme = async () => {
      try {
        // First, check if user has a saved preference
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && (stored === 'light' || stored === 'dark' || stored === 'sepia')) {
          setMode(stored as ThemeMode);
          setIsLoading(false);
          return;
        }

        // If no user preference, fetch default theme from Firebase
        unsubscribe = subscribeToAppSettings((settings) => {
          if (settings?.appTheme) {
            setMode(settings.appTheme);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.log('Error loading theme:', error);
        setIsLoading(false);
      }
    };

    loadTheme();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const setThemeMode = useCallback(async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      console.log('Theme saved:', newMode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, []);

  const colors: ThemeColorScheme = useMemo(() => {
    return ThemeColors[mode];
  }, [mode]);

  const isDark = mode === 'dark';

  return {
    mode,
    setThemeMode,
    colors,
    isDark,
    isLoading,
  };
});
