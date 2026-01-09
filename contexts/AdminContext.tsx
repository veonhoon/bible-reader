import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';

const ADMIN_STORAGE_KEY = 'bible_app_admin';
const ADMIN_PASSWORD = 'admin123';

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdminStatus = async () => {
      try {
        const adminData = await AsyncStorage.getItem(ADMIN_STORAGE_KEY);
        if (adminData) {
          setIsAdmin(JSON.parse(adminData));
        }
      } catch (error) {
        console.log('Error loading admin status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAdminStatus();
  }, []);

  const login = useCallback(async (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      try {
        await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(true));
        console.log('Admin logged in');
      } catch (error) {
        console.log('Error saving admin status:', error);
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    setIsAdmin(false);
    try {
      await AsyncStorage.removeItem(ADMIN_STORAGE_KEY);
      console.log('Admin logged out');
    } catch (error) {
      console.log('Error removing admin status:', error);
    }
  }, []);

  return {
    isAdmin,
    isLoading,
    login,
    logout,
  };
});
