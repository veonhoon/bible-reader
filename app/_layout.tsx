import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import { BookmarksProvider, useBookmarks } from "@/contexts/BookmarksContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { CustomScripturesProvider, useCustomScriptures } from "@/contexts/CustomScripturesContext";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { BibleProvider } from "@/contexts/BibleContext";
import { ReadingProgressProvider, useReadingProgress } from "@/contexts/ReadingProgressContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import * as Notifications from 'expo-notifications';
// Paywall removed - Bible Reader is free
import { registerPushTokenToFirestore } from "@/services/notificationScheduler";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Track if we've already handled initial notification
let initialNotificationHandled = false;

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoading: subLoading } = useSubscription();
  const { isLoading: bookmarksLoading } = useBookmarks();
  const { isLoading: adminLoading } = useAdmin();
  const { isLoading: scripturesLoading } = useCustomScriptures();
  const { isLoading: progressLoading, shouldAutoNavigate, lastRead, markSessionEnded } = useReadingProgress();
  const router = useRouter();
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);
  const [hasCheckedLanguage, setHasCheckedLanguage] = useState(false);
  const [needsLanguageSelect, setNeedsLanguageSelect] = useState(false);
  const hasRedirectedToOnboarding = useRef(false);
  const responseListener = useRef<any>();

  const isLoading = subLoading || bookmarksLoading || adminLoading || scripturesLoading || progressLoading;

  // Check if language has been selected (runs once on mount)
  useEffect(() => {
    const checkLanguage = async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const hasOnboarded = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (!hasOnboarded) {
          setNeedsLanguageSelect(true);
        }
      } catch (e) {
        console.warn('[Layout] Error checking language:', e);
      }
      setHasCheckedLanguage(true);
    };
    checkLanguage();
  }, []);

  // Register push token to Firestore when user is authenticated
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      registerPushTokenToFirestore();
    }
  }, [isAuthenticated]);

  // Handle notification taps
  useEffect(() => {
    console.log('[Notifications] Setting up notification handlers');

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      console.log('[Notifications] Notification tapped!');
      const data = response.notification.request.content.data;
      if (data?.snippetId) {
        const snippetId = data.snippetId as string;
        console.log('[Notifications] Navigating to snippet:', snippetId);
        router.push(`/snippet/${snippetId}`);
      }
    };

    // Check for initial notification (app opened from notification)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response && !initialNotificationHandled) {
        initialNotificationHandled = true;
        handleNotificationResponse(response);
      }
    });

    // Listen for notification taps while app is running
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  // Hide splash and handle initial routing (runs once when loading completes)
  useEffect(() => {
    if (!isLoading && hasCheckedLanguage) {
      SplashScreen.hideAsync();

      // Redirect to onboarding ONLY ONCE
      if (needsLanguageSelect && !hasRedirectedToOnboarding.current) {
        hasRedirectedToOnboarding.current = true;
        router.replace('/language-select');
        return;
      }

      // Auto-navigate to last read position (only once on app launch)
      if (!needsLanguageSelect && shouldAutoNavigate && lastRead && !hasAutoNavigated) {
        console.log('[Layout] Auto-navigating to last read:', lastRead);
        setHasAutoNavigated(true);
        markSessionEnded();
        router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`);
      }
    }
    // Intentionally exclude router to prevent re-triggering on tab switches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasCheckedLanguage, needsLanguageSelect, shouldAutoNavigate, lastRead, hasAutoNavigated]);

  if (isLoading || !hasCheckedLanguage) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="language-select" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="privacy-policy" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="terms-of-use" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="reader" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="book-selector" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="chapter-selector" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="notification-settings" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="import-scriptures" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="daily-scripture" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen
          name="api-settings"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="snippet/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Teaching',
            presentation: 'card',
          }}
        />
      </Stack>
      {/* Paywall removed - Bible Reader is free */}
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <AdminProvider>
                  <BibleProvider>
                    <CustomScripturesProvider>
                      <ReadingProgressProvider>
                        <BookmarksProvider>
                          <RootLayoutNav />
                        </BookmarksProvider>
                      </ReadingProgressProvider>
                    </CustomScripturesProvider>
                  </BibleProvider>
                </AdminProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
