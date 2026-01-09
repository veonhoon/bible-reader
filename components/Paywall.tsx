import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Bell, Check, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription, SubscriptionPlan } from '@/contexts/SubscriptionContext';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  'Weekly scripture notifications',
  'Daily verse reminders',
  'Home screen widget',
];

export default function Paywall({ visible, onClose }: PaywallProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { startTrial, subscribe, hasUsedTrial } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      if (!hasUsedTrial) {
        await startTrial();
      } else {
        await subscribe(selectedPlan);
      }
      onClose();
    } catch (error) {
      console.log('Subscription error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const monthlyPrice = '$2.99';
  const annualPrice = '$19.99';
  const annualMonthly = '$1.67';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={onClose}
            testID="paywall-close"
          >
            <X color={colors.textMuted} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
            <Bell color={colors.accent} size={32} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Reminder Access
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Receive weekly scriptures and daily verses through notifications and widgets.
          </Text>

          <View style={[styles.freeNotice, { backgroundColor: colors.gold + '15', borderColor: colors.gold + '30' }]}>
            <BookOpen color={colors.gold} size={18} />
            <Text style={[styles.freeNoticeText, { color: colors.gold }]}>
              Scripture is always free. Subscriptions help deliver it to you.
            </Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.checkCircle, { backgroundColor: colors.success + '20' }]}>
                  <Check color={colors.success} size={14} />
                </View>
                <Text style={[styles.featureText, { color: colors.text }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.plans}>
            <TouchableOpacity
              style={[
                styles.planCard,
                {
                  backgroundColor: selectedPlan === 'annual' ? colors.accent + '10' : colors.surface,
                  borderColor: selectedPlan === 'annual' ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setSelectedPlan('annual')}
              testID="plan-annual"
            >
              {selectedPlan === 'annual' && (
                <View style={[styles.bestValue, { backgroundColor: colors.accent }]}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: colors.text }]}>Annual</Text>
                <View style={[
                  styles.radioOuter,
                  { borderColor: selectedPlan === 'annual' ? colors.accent : colors.border }
                ]}>
                  {selectedPlan === 'annual' && (
                    <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                  )}
                </View>
              </View>
              <Text style={[styles.planPrice, { color: colors.text }]}>{annualPrice}/year</Text>
              <Text style={[styles.planSubtext, { color: colors.textMuted }]}>
                Just {annualMonthly}/month
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planCard,
                {
                  backgroundColor: selectedPlan === 'monthly' ? colors.accent + '10' : colors.surface,
                  borderColor: selectedPlan === 'monthly' ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setSelectedPlan('monthly')}
              testID="plan-monthly"
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
                <View style={[
                  styles.radioOuter,
                  { borderColor: selectedPlan === 'monthly' ? colors.accent : colors.border }
                ]}>
                  {selectedPlan === 'monthly' && (
                    <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                  )}
                </View>
              </View>
              <Text style={[styles.planPrice, { color: colors.text }]}>{monthlyPrice}/month</Text>
              <Text style={[styles.planSubtext, { color: colors.textMuted }]}>
                Cancel anytime
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: colors.accent }]}
            onPress={handleSubscribe}
            disabled={isProcessing}
            testID="paywall-subscribe"
          >
            <Text style={styles.subscribeButtonText}>
              {isProcessing
                ? 'Processing...'
                : hasUsedTrial
                ? 'Subscribe Now'
                : 'Start 7-Day Free Trial'}
            </Text>
          </TouchableOpacity>

          {!hasUsedTrial && (
            <Text style={[styles.trialNote, { color: colors.textMuted }]}>
              Then {selectedPlan === 'annual' ? annualPrice + '/year' : monthlyPrice + '/month'}. Cancel anytime in App Store.
            </Text>
          )}

          <TouchableOpacity style={styles.restoreButton} testID="paywall-restore">
            <Text style={[styles.restoreText, { color: colors.textSecondary }]}>
              Restore Purchase
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
            Reading and listening remain free forever.{'\n'}
            Subscription only adds delivery features.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  freeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  freeNoticeText: {
    fontSize: 14,
    fontWeight: '500' as const,
    flex: 1,
  },
  features: {
    alignSelf: 'stretch',
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  plans: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bestValue: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  planSubtext: {
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  subscribeButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  trialNote: {
    fontSize: 13,
    textAlign: 'center',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
