import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useRef } from "react";
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
import Paywall from "@/components/Paywall";
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
  const { showPaywall, closePaywall, isLoading: subLoading } = useSubscription();
  const { isLoading: bookmarksLoading } = useBookmarks();
  const { isLoading: adminLoading } = useAdmin();
  const { isLoading: scripturesLoading } = useCustomScriptures();
  const { isLoading: progressLoading, shouldAutoNavigate, lastRead, markSessionEnded } = useReadingProgress();
  const router = useRouter();
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const isLoading = subLoading || bookmarksLoading || adminLoading || scripturesLoading || progressLoading;

  // Register push token to Firestore when user is authenticated
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      registerPushTokenToFirestore();
    }
  }, [isAuthenticated]);

  // Handle notification taps
  useEffect(() => {
    // Handle notification tap when app is in background/closed
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      if (data?.snippetId) {
        router.push(`/snippet/${data.snippetId}`);
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

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();

      if (shouldAutoNavigate && lastRead && !hasAutoNavigated) {
        console.log('[Layout] Auto-navigating to last read:', lastRead);
        setHasAutoNavigated(true);
        markSessionEnded();
        router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`);
      }
    }
  }, [isLoading, shouldAutoNavigate, lastRead, hasAutoNavigated, markSessionEnded, router]);

  if (isLoading) {
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
      <Paywall visible={showPaywall} onClose={closePaywall} />
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
