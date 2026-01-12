import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';

const SUBSCRIPTION_STORAGE_KEY = 'bible_app_subscription';
const TRIAL_STORAGE_KEY = 'bible_app_trial';
const NOTIFICATION_PREFS_KEY = 'bible_app_notification_prefs';

export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired' | 'cancelled';

export type SubscriptionPlan = 'monthly' | 'annual';

export interface NotificationPreferences {
  weeklyScripture: boolean;
  dailyVerse: boolean;
  schedule: 'morning' | 'evening';
}

export interface TrialInfo {
  startedAt: string | null;
  expiresAt: string | null;
}

export interface SubscriptionData {
  status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  expiresAt: string | null;
  startedAt: string | null;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  weeklyScripture: true,
  dailyVerse: false,
  schedule: 'morning',
};

const TRIAL_DURATION_DAYS = 7;

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    status: 'none',
    plan: null,
    expiresAt: null,
    startedAt: null,
  });
  const [trial, setTrial] = useState<TrialInfo>({
    startedAt: null,
    expiresAt: null,
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFS
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  // Premium status from Firestore (set by admin)
  const [isPremiumFromFirestore, setIsPremiumFromFirestore] = useState(false);

  // Listen to user's premium status from Firestore in real-time
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsPremiumFromFirestore(false);
      return;
    }

    const userRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsPremiumFromFirestore(data.isPremium === true);
        console.log('Premium status from Firestore:', data.isPremium);
      }
    }, (error) => {
      console.error('Error listening to premium status:', error);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subData, trialData, notifData] = await Promise.all([
          AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY),
          AsyncStorage.getItem(TRIAL_STORAGE_KEY),
          AsyncStorage.getItem(NOTIFICATION_PREFS_KEY),
        ]);

        if (subData) {
          const parsed = JSON.parse(subData) as SubscriptionData;
          if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
            parsed.status = 'expired';
          }
          setSubscription(parsed);
          console.log('Subscription loaded:', parsed);
        }

        if (trialData) {
          const parsed = JSON.parse(trialData) as TrialInfo;
          setTrial(parsed);
          console.log('Trial info loaded:', parsed);
        }

        if (notifData) {
          setNotificationPrefs(JSON.parse(notifData));
          console.log('Notification prefs loaded');
        }
      } catch (error) {
        console.log('Error loading subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const isSubscribed = useMemo(() => {
    // User is subscribed if:
    // 1. They have an active subscription or trial (from RevenueCat/local), OR
    // 2. They have been granted premium status by admin (from Firestore)
    return subscription.status === 'active' || subscription.status === 'trial' || isPremiumFromFirestore;
  }, [subscription.status, isPremiumFromFirestore]);

  const isTrialActive = useMemo(() => {
    if (subscription.status !== 'trial' || !trial.expiresAt) return false;
    return new Date(trial.expiresAt) > new Date();
  }, [subscription.status, trial.expiresAt]);

  const trialDaysRemaining = useMemo(() => {
    if (!isTrialActive || !trial.expiresAt) return 0;
    const diff = new Date(trial.expiresAt).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [isTrialActive, trial.expiresAt]);

  const startTrial = useCallback(async () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const newTrial: TrialInfo = {
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const newSub: SubscriptionData = {
      status: 'trial',
      plan: null,
      expiresAt: expiresAt.toISOString(),
      startedAt: now.toISOString(),
    };

    setTrial(newTrial);
    setSubscription(newSub);

    try {
      await Promise.all([
        AsyncStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(newTrial)),
        AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub)),
      ]);
      console.log('Trial started:', newTrial);
    } catch (error) {
      console.log('Error saving trial:', error);
    }

    return true;
  }, []);

  const subscribe = useCallback(async (plan: SubscriptionPlan) => {
    const now = new Date();
    const durationMonths = plan === 'annual' ? 12 : 1;
    const expiresAt = new Date(now.setMonth(now.getMonth() + durationMonths));

    const newSub: SubscriptionData = {
      status: 'active',
      plan,
      expiresAt: expiresAt.toISOString(),
      startedAt: new Date().toISOString(),
    };

    setSubscription(newSub);

    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
      console.log('Subscription activated:', newSub);
    } catch (error) {
      console.log('Error saving subscription:', error);
    }

    return true;
  }, []);

  const cancelSubscription = useCallback(async () => {
    const newSub: SubscriptionData = {
      ...subscription,
      status: 'cancelled',
    };

    setSubscription(newSub);

    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newSub));
      console.log('Subscription cancelled');
    } catch (error) {
      console.log('Error cancelling subscription:', error);
    }
  }, [subscription]);

  const restoreSubscription = useCallback(async () => {
    console.log('Attempting to restore subscription...');
    return false;
  }, []);

  const updateNotificationPrefs = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    const updated = { ...notificationPrefs, ...prefs };
    setNotificationPrefs(updated);

    try {
      await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
      console.log('Notification prefs updated:', updated);
    } catch (error) {
      console.log('Error saving notification prefs:', error);
    }
  }, [notificationPrefs]);

  const openPaywall = useCallback(() => {
    setShowPaywall(true);
  }, []);

  const closePaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);

  const hasUsedTrial = useMemo(() => {
    return trial.startedAt !== null;
  }, [trial.startedAt]);

  return {
    subscription,
    isSubscribed,
    isPremiumFromFirestore, // Premium granted by admin via Firestore
    isTrialActive,
    trialDaysRemaining,
    hasUsedTrial,
    notificationPrefs,
    isLoading,
    showPaywall,
    startTrial,
    subscribe,
    cancelSubscription,
    restoreSubscription,
    updateNotificationPrefs,
    openPaywall,
    closePaywall,
  };
});

export function useRequireSubscription() {
  const { isSubscribed, openPaywall } = useSubscription();

  const requireSubscription = useCallback(
    (onSuccess: () => void) => {
      if (isSubscribed) {
        onSuccess();
      } else {
        openPaywall();
      }
    },
    [isSubscribed, openPaywall]
  );

  return { isSubscribed, requireSubscription };
}
