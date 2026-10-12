import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { sha256 } from '@/utils/sha256';

const ADMIN_STORAGE_KEY = 'bible_app_admin';
const ADMIN_PASSWORD_SHA256 = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

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
    if (typeof password === 'string' && sha256(password) === ADMIN_PASSWORD_SHA256) {
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
