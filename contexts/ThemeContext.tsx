import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeColors, ThemeMode, ThemeColorScheme } from '@/constants/colors';

const THEME_STORAGE_KEY = 'bible_app_theme';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && (stored === 'light' || stored === 'dark' || stored === 'sepia')) {
          setMode(stored as ThemeMode);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
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
