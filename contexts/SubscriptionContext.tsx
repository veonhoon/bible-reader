/**
 * SubscriptionContext - Bible Reader is FREE
 * This context is simplified since all features are free.
 * Kept for compatibility with existing code.
 */

import React, { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  showPaywall: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  requireSubscription: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  // Bible Reader is FREE - always subscribed
  const isSubscribed = true;
  const isLoading = false;
  const showPaywall = false;

  const openPaywall = useCallback(() => {
    // No paywall in free app
  }, []);

  const closePaywall = useCallback(() => {
    // No paywall in free app
  }, []);

  const value = useMemo(() => ({
    isSubscribed,
    isLoading,
    showPaywall,
    openPaywall,
    closePaywall,
    requireSubscription: () => true, // All features available
  }), [openPaywall, closePaywall]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Hook for checking feature access - always returns true for free app
export function useFeatureAccess() {
  const { isSubscribed } = useSubscription();
  
  const requireSubscription = useCallback((feature: string) => {
    // All features are free
    return true;
  }, []);

  return { isSubscribed: true, requireSubscription };
}

export default SubscriptionProvider;
