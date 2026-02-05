import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TermsOfUseScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Use</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      >
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last Updated: February 3, 2026
        </Text>

        <Text style={[styles.paragraph, { color: colors.text }]}>
          Welcome to Bible Reader. These Terms of Use ("Terms") govern your access to and use of our mobile application and services. By using our app, you agree to these Terms.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          By downloading, installing, or using Bible Reader, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the app.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Bible Reader provides:{'\n\n'}
          • Bible reading and study tools{'\n'}
          • Weekly teachings and devotional content{'\n'}
          • Bookmarking and highlighting features{'\n'}
          • Daily verse notifications{'\n'}
          • Personalized spiritual guidance
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Eligibility</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You must be at least 13 years old to use this app. If you are under 18, you must have parental or guardian consent.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Subscriptions and Payments</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Basic Bible reading features are free{'\n'}
          • Premium features require a paid subscription{'\n'}
          • Subscriptions are billed through Apple App Store or Google Play Store{'\n'}
          • Subscriptions automatically renew unless cancelled{'\n'}
          • You may cancel anytime through your device's subscription settings{'\n'}
          • Free trials are charged after the trial period unless you cancel
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. User Conduct</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You agree NOT to:{'\n\n'}
          • Use the app for any unlawful purpose{'\n'}
          • Harass, abuse, or harm others{'\n'}
          • Upload malicious code or interfere with the app{'\n'}
          • Reproduce, distribute, or sell our content without authorization
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Intellectual Property</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          All intellectual property rights in the app, including software, design, logos, and content, are owned by Bible Reader or our licensors. You receive only a limited, non-exclusive license to use the app for personal purposes.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Disclaimers</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. Our content is for spiritual enrichment and education. We do not provide professional counseling, medical, or mental health advice.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the app.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Changes to Terms</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We may modify these Terms at any time. We will notify you of material changes through the app. Continued use after changes constitutes acceptance.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          For questions about these Terms:{'\n\n'}
          Email: support@calmbiblereader.com
        </Text>

        <Text style={[styles.agreement, { color: colors.textSecondary }]}>
          By using Bible Reader, you acknowledge that you have read, understood, and agree to these Terms of Use.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 13,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
  },
  agreement: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 32,
    textAlign: 'center',
  },
});
