import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomScriptures } from '@/contexts/CustomScripturesContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { WEEKLY_SCRIPTURE, SAMPLE_CHAPTERS } from '@/mocks/bibleData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const { currentScripture, hasScriptures, progress } = useCustomScriptures();
  const { isAdmin } = useAdmin();
  const { lastRead } = useReadingProgress();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const getWeeklyVerseText = () => {
    const firstScripture = WEEKLY_SCRIPTURE.scriptures[0];
    const chapterKey = `${firstScripture.bookId}-${firstScripture.chapter}`;
    const chapter = SAMPLE_CHAPTERS[chapterKey];
    if (!chapter) return '';
    
    const verses = chapter.verses.filter(
      v => v.verse >= firstScripture.verseStart && v.verse <= firstScripture.verseEnd
    );
    return verses.map(v => v.text).join(' ');
  };

  const handleReadScripture = (bookId: string, chapter: number) => {
    router.push(`/reader?bookId=${bookId}&chapter=${chapter}`);
  };



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Peace be with you
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Daily Scripture
          </Text>
        </View>

        {hasScriptures && currentScripture && (
          <TouchableOpacity
            style={[styles.continueCard, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/daily-scripture')}
            testID="continue-reading-button"
          >
            <View style={styles.continueContent}>
              <View style={styles.continueTextContainer}>
                <Text style={styles.continueLabel}>Continue Reading</Text>
                <Text style={styles.continueScripture} numberOfLines={2}>
                  {currentScripture.text.substring(0, 80)}...
                </Text>
                {currentScripture.reference && (
                  <Text style={styles.continueReference}>
                    {currentScripture.reference}
                  </Text>
                )}
              </View>
              <ChevronRight color="#FFFFFF" size={24} />
            </View>
            {progress.completedToday && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Read today</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {!hasScriptures && isAdmin && (
          <TouchableOpacity
            style={[styles.importPrompt, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/admin')}
            testID="import-prompt-button"
          >
            <Text style={[styles.importPromptTitle, { color: colors.text }]}>
              Import Scriptures
            </Text>
            <Text style={[styles.importPromptText, { color: colors.textSecondary }]}>
              Go to admin panel to add daily scriptures for users
            </Text>
            <View style={[styles.importButton, { backgroundColor: colors.accent }]}>
              <Text style={styles.importButtonText}>Open Admin Panel</Text>
              <ChevronRight color="#FFFFFF" size={18} />
            </View>
          </TouchableOpacity>
        )}

        {!hasScriptures && !isAdmin && (
          <View style={[styles.noScripturesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <BookOpen color={colors.textMuted} size={40} />
            <Text style={[styles.noScripturesTitle, { color: colors.text }]}>
              No Daily Scriptures Yet
            </Text>
            <Text style={[styles.noScripturesText, { color: colors.textSecondary }]}>
              Daily scriptures will appear here once they are published. Check back soon!
            </Text>
          </View>
        )}

        {lastRead && (
          <TouchableOpacity
            style={[styles.continueReadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`)}
            activeOpacity={0.7}
            testID="continue-where-left-off-button"
          >
            <View style={styles.continueReadingHeader}>
              <View style={[styles.continueReadingIcon, { backgroundColor: colors.accent + '15' }]}>
                <Clock color={colors.accent} size={20} />
              </View>
              <View style={styles.continueReadingInfo}>
                <Text style={[styles.continueReadingLabel, { color: colors.textSecondary }]}>
                  Continue where you left off
                </Text>
                <Text style={[styles.continueReadingTitle, { color: colors.text }]}>
                  {lastRead.bookName} {lastRead.chapter}
                </Text>
              </View>
              <ChevronRight color={colors.textMuted} size={22} />
            </View>
          </TouchableOpacity>
        )}

        <View style={[styles.weeklyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.weeklyHeader}>
            <View style={[styles.weeklyBadge, { backgroundColor: colors.gold + '20' }]}>
              <Text style={[styles.weeklyBadgeText, { color: colors.gold }]}>
                THIS WEEK
              </Text>
            </View>
          </View>
          
          <Text style={[styles.weeklyTitle, { color: colors.text }]}>
            {WEEKLY_SCRIPTURE.title}
          </Text>
          
          <Text style={[styles.weeklyDescription, { color: colors.textSecondary }]}>
            {WEEKLY_SCRIPTURE.description}
          </Text>

          <View style={[styles.versePreview, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.verseReference, { color: colors.accent }]}>
              {WEEKLY_SCRIPTURE.scriptures[0].bookName} {WEEKLY_SCRIPTURE.scriptures[0].chapter}:
              {WEEKLY_SCRIPTURE.scriptures[0].verseStart}-{WEEKLY_SCRIPTURE.scriptures[0].verseEnd}
            </Text>
            <Text style={[styles.verseText, { color: colors.text }]}>
              {`"${getWeeklyVerseText()}"`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => handleReadScripture(
              WEEKLY_SCRIPTURE.scriptures[0].bookId,
              WEEKLY_SCRIPTURE.scriptures[0].chapter
            )}
            testID="read-weekly-button"
          >
            <BookOpen color="#FFFFFF" size={18} />
            <Text style={styles.actionButtonText}>Read Scripture</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            This Week&apos;s Scriptures
          </Text>
          
          {WEEKLY_SCRIPTURE.scriptures.map((scripture, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.scriptureItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleReadScripture(scripture.bookId, scripture.chapter)}
              testID={`scripture-item-${index}`}
            >
              <View style={styles.scriptureInfo}>
                <Text style={[styles.scriptureName, { color: colors.text }]}>
                  {scripture.bookName} {scripture.chapter}
                </Text>
                <Text style={[styles.scriptureVerse, { color: colors.textSecondary }]}>
                  Verses {scripture.verseStart}-{scripture.verseEnd}
                </Text>
              </View>
              <ChevronRight color={colors.textMuted} size={20} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Access
          </Text>
          
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={[styles.quickAccessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleReadScripture('psalms', 23)}
              testID="quick-psalms-button"
            >
              <Text style={[styles.quickAccessTitle, { color: colors.text }]}>Psalm 23</Text>
              <Text style={[styles.quickAccessSubtitle, { color: colors.textSecondary }]}>
                The Lord is my shepherd
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAccessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleReadScripture('john', 1)}
              testID="quick-john-button"
            >
              <Text style={[styles.quickAccessTitle, { color: colors.text }]}>John 1</Text>
              <Text style={[styles.quickAccessSubtitle, { color: colors.textSecondary }]}>
                In the beginning
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAccessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleReadScripture('genesis', 1)}
              testID="quick-genesis-button"
            >
              <Text style={[styles.quickAccessTitle, { color: colors.text }]}>Genesis 1</Text>
              <Text style={[styles.quickAccessSubtitle, { color: colors.textSecondary }]}>
                Creation
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAccessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleReadScripture('matthew', 5)}
              testID="quick-matthew-button"
            >
              <Text style={[styles.quickAccessTitle, { color: colors.text }]}>Matthew 5</Text>
              <Text style={[styles.quickAccessSubtitle, { color: colors.textSecondary }]}>
                Beatitudes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
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
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 13,
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
    justifyContent: 'space-between',
  },
  continueTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  continueLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 8,
    opacity: 0.9,
  },
  continueScripture: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    fontFamily: 'Georgia',
    marginBottom: 6,
  },
  continueReference: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  completedBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  importPrompt: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  importPromptTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  importPromptText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
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
  continueReadingCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  continueReadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueReadingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  continueReadingInfo: {
    flex: 1,
  },
  continueReadingLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  continueReadingTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
