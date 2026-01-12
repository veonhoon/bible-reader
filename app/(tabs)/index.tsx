import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import {
  Scripture,
  subscribeToFeaturedScripture,
  subscribeToScriptures,
} from '@/services/scripturesService';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { lastRead } = useReadingProgress();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [featuredScripture, setFeaturedScripture] = useState<Scripture | null>(null);
  const [weeklyScriptures, setWeeklyScriptures] = useState<Scripture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to featured scripture
    const unsubscribeFeatured = subscribeToFeaturedScripture((scripture) => {
      setFeaturedScripture(scripture);
    });

    // Subscribe to all scriptures for the weekly list
    const unsubscribeScriptures = subscribeToScriptures((scriptures) => {
      // Get the most recent scriptures (up to 7 for the week)
      setWeeklyScriptures(scriptures.slice(0, 7));
      setIsLoading(false);
    });

    return () => {
      unsubscribeFeatured();
      unsubscribeScriptures();
    };
  }, []);

  const handleReadScripture = (bookId: string, chapter: number) => {
    router.push(`/reader?bookId=${bookId}&chapter=${chapter}`);
  };

  const hasFeaturedContent = featuredScripture !== null;
  const hasWeeklyScriptures = weeklyScriptures.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Continue where you left off - at the top */}
        {lastRead && (
          <TouchableOpacity
            style={[styles.continueCard, { backgroundColor: colors.accent }]}
            onPress={() => router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`)}
            activeOpacity={0.7}
            testID="continue-where-left-off-button"
          >
            <View style={styles.continueContent}>
              <View style={[styles.continueIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Clock color="#FFFFFF" size={24} />
              </View>
              <View style={styles.continueTextContainer}>
                <Text style={styles.continueLabel}>Continue where you left off</Text>
                <Text style={styles.continueTitle}>
                  {lastRead.bookName} {lastRead.chapter}
                </Text>
              </View>
              <ChevronRight color="#FFFFFF" size={24} />
            </View>
          </TouchableOpacity>
        )}

        {isLoading && (
          <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading scriptures...
            </Text>
          </View>
        )}

        {!hasFeaturedContent && !hasWeeklyScriptures && !isLoading && (
          <View style={[styles.noScripturesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <BookOpen color={colors.textMuted} size={40} />
            <Text style={[styles.noScripturesTitle, { color: colors.text }]}>
              No Scriptures Yet
            </Text>
            <Text style={[styles.noScripturesText, { color: colors.textSecondary }]}>
              Scriptures will appear here once they are published. Check back soon!
            </Text>
          </View>
        )}

        {hasFeaturedContent && featuredScripture && (
          <View style={[styles.weeklyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.weeklyHeader}>
              <View style={[styles.weeklyBadge, { backgroundColor: colors.gold + '20' }]}>
                <Text style={[styles.weeklyBadgeText, { color: colors.gold }]}>
                  FEATURED
                </Text>
              </View>
            </View>

            <Text style={[styles.weeklyTitle, { color: colors.text }]}>
              {featuredScripture.verse}
            </Text>

            {featuredScripture.message && (
              <Text style={[styles.weeklyDescription, { color: colors.textSecondary }]}>
                {featuredScripture.message}
              </Text>
            )}

            <View style={[styles.versePreview, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.verseReference, { color: colors.accent }]}>
                {featuredScripture.verse}
              </Text>
              <Text style={[styles.verseText, { color: colors.text }]}>
                {`"${featuredScripture.text}"`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              onPress={() => handleReadScripture(
                featuredScripture.bookId,
                featuredScripture.chapter
              )}
              testID="read-featured-button"
            >
              <BookOpen color="#FFFFFF" size={18} />
              <Text style={styles.actionButtonText}>Read Scripture</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasWeeklyScriptures && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              This Week's Scriptures
            </Text>

            {weeklyScriptures.map((scripture, index) => (
              <TouchableOpacity
                key={scripture.id || index}
                style={[styles.scriptureItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleReadScripture(scripture.bookId, scripture.chapter)}
                testID={`scripture-item-${index}`}
              >
                <View style={styles.scriptureInfo}>
                  <Text style={[styles.scriptureName, { color: colors.text }]}>
                    {scripture.verse}
                  </Text>
                  <Text style={[styles.scriptureVerse, { color: colors.textSecondary }]} numberOfLines={1}>
                    {scripture.text.substring(0, 50)}...
                  </Text>
                </View>
                <ChevronRight color={colors.textMuted} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  loadingCard: {
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  weeklyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weeklyHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weeklyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  weeklyBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  weeklyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  weeklyDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  versePreview: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  verseReference: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  scriptureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  scriptureInfo: {
    flex: 1,
  },
  scriptureName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  scriptureVerse: {
    fontSize: 14,
  },
  continueCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  continueTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  continueLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  noScripturesCard: {
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  noScripturesTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noScripturesText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
