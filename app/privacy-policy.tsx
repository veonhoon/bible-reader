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

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
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
          Bible Reader ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
        
        <Text style={[styles.subTitle, { color: colors.text }]}>Information You Provide</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Account Information: Email address, name, and authentication credentials{'\n'}
          • Profile Information: Denomination, age group, gender, and spiritual goals{'\n'}
          • User Content: Prayer requests, notes, bookmarks, and any text you enter{'\n'}
          • Payment Information: Processed securely through Apple App Store or Google Play Store
        </Text>

        <Text style={[styles.subTitle, { color: colors.text }]}>Information Collected Automatically</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          • Device Information: Device type, operating system, unique device identifiers{'\n'}
          • Usage Data: Features used, content viewed, time spent in app{'\n'}
          • Analytics: Crash reports, performance data, and general usage patterns
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We use the collected information to:{'\n\n'}
          • Provide and maintain our services{'\n'}
          • Personalize your experience based on your preferences{'\n'}
          • Send you daily teachings and notifications (with your consent){'\n'}
          • Process subscriptions and transactions{'\n'}
          • Improve our app and develop new features{'\n'}
          • Respond to your inquiries and provide customer support
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Data Sharing</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We do NOT sell your personal data. We may share information only with:{'\n\n'}
          • Service Providers: Third-party services that help us operate{'\n'}
          • Legal Requirements: When required by law{'\n'}
          • With Your Consent: When you explicitly authorize sharing
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Your Rights (GDPR & CCPA)</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You have the right to:{'\n\n'}
          • Access: Request a copy of your personal data{'\n'}
          • Rectification: Correct inaccurate data{'\n'}
          • Erasure: Request deletion of your data{'\n'}
          • Portability: Receive your data in a portable format{'\n'}
          • Withdraw Consent: Revoke previously given consent{'\n\n'}
          To exercise these rights, contact us at: privacy@calmbiblereader.com
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Data Security</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We implement appropriate technical and organizational measures to protect your data, including encryption of data in transit and at rest, secure authentication methods, and access controls.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Children's Privacy</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          If you have questions about this Privacy Policy:{'\n\n'}
          Email: privacy@calmbiblereader.com
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
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
  },
});
