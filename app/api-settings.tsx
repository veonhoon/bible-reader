import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle, Database, Book, Globe } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useBible } from '@/contexts/BibleContext';

export default function ApiSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clearCache, cacheSize } = useBible();

  const handleClearCache = () => {
    Alert.alert(
      'Clear Bible Cache',
      `This will remove ${cacheSize} cached chapters. They will be re-downloaded when you read them again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bible Data</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statusCard, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '30' }]}>
          <CheckCircle color={colors.accent} size={24} />
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              Connected
            </Text>
            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
              Full NIV Bible text is available
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            TRANSLATION
          </Text>
          
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Book color={colors.accent} size={20} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  New International Version (NIV)
                </Text>
                <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
                  Modern English translation
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DATA SOURCE
          </Text>
          
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Globe color={colors.textMuted} size={20} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Holy Bible Open Source API
                </Text>
                <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
                  Free, open-source Bible data
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CACHE
          </Text>
          
          <View style={[styles.cacheCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cacheInfo}>
              <Database color={colors.textMuted} size={20} />
              <View style={styles.cacheText}>
                <Text style={[styles.cacheTitle, { color: colors.text }]}>
                  Cached Chapters
                </Text>
                <Text style={[styles.cacheSubtitle, { color: colors.textSecondary }]}>
                  {cacheSize} chapter{cacheSize !== 1 ? 's' : ''} saved offline
                </Text>
              </View>
            </View>
            
            {cacheSize > 0 && (
              <TouchableOpacity
                style={[styles.cacheClearButton, { borderColor: colors.border }]}
                onPress={handleClearCache}
              >
                <Text style={[styles.cacheClearText, { color: colors.textSecondary }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.noticeText, { color: colors.textMuted }]}>
            Chapters are automatically cached for 30 days for offline reading. No API key required.
          </Text>
        </View>
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
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 13,
  },
  cacheCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  cacheInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cacheText: {
    gap: 2,
  },
  cacheTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  cacheSubtitle: {
    fontSize: 13,
  },
  cacheClearButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cacheClearText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  notice: {
    padding: 14,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
