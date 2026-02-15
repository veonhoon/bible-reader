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
import { ChevronRight, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { BIBLE_BOOKS } from '@/mocks/bibleData';
import { KOREAN_BOOK_NAMES } from '@/constants/koreanBookNames';
import { setCurrentBibleVersion } from '@/services/bibleApi';

export default function ReadScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lastRead, isLoading } = useReadingProgress();
  const [activeTestament, setActiveTestament] = useState<'old' | 'new'>('old');

  const isKorean = language === 'ko';

  // Set Bible version based on language
  useEffect(() => {
    const version = isKorean ? 'KRV' : 'NIV';
    setCurrentBibleVersion(version);
  }, [isKorean]);

  // Note: Auto-navigate to last read is handled by _layout.tsx on app launch.
  // The Read tab just shows the book list with a "Continue Reading" card.

  // Get localized book name
  const getBookName = (bookId: string, englishName: string): string => {
    if (isKorean) {
      const koreanData = KOREAN_BOOK_NAMES[bookId];
      return koreanData?.korean || englishName;
    }
    return englishName;
  };

  // Get localized last read book name
  const getLastReadBookName = (): string => {
    if (!lastRead) return '';
    if (isKorean) {
      const koreanData = KOREAN_BOOK_NAMES[lastRead.bookId];
      return koreanData?.korean || lastRead.bookName;
    }
    return lastRead.bookName;
  };

  const oldTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'old');
  const newTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'new');

  const handleBookPress = (bookId: string) => {
    router.push(`/chapter-selector?bookId=${bookId}`);
  };

  const displayedBooks = activeTestament === 'old' ? oldTestamentBooks : newTestamentBooks;

  // Translations
  const t = {
    bible: isKorean ? '성경' : 'Bible',
    continueReading: isKorean ? '계속 읽기' : 'Continue Reading',
    oldTestament: isKorean ? '구약' : 'Old Testament',
    newTestament: isKorean ? '신약' : 'New Testament',
    chapters: isKorean ? '장' : 'chapters',
  };

  // Show loading while checking for last read position
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // If no last read position, show Bible selection
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t.bible}</Text>

        {/* Quick resume button if there's a last read position */}
        {lastRead && (
          <TouchableOpacity
            style={[styles.resumeCard, { backgroundColor: colors.accent }]}
            onPress={() => router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`)}
          >
            <BookOpen color="#FFFFFF" size={20} />
            <View style={styles.resumeTextContainer}>
              <Text style={styles.resumeLabel}>{t.continueReading}</Text>
              <Text style={styles.resumeTitle}>{getLastReadBookName()} {lastRead.chapter}</Text>
            </View>
            <ChevronRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
        )}

        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTestament === 'old' && { backgroundColor: colors.card },
            ]}
            onPress={() => setActiveTestament('old')}
            testID="old-testament-tab"
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTestament === 'old' ? colors.text : colors.textMuted },
              ]}
            >
              {t.oldTestament}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTestament === 'new' && { backgroundColor: colors.card },
            ]}
            onPress={() => setActiveTestament('new')}
            testID="new-testament-tab"
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTestament === 'new' ? colors.text : colors.textMuted },
              ]}
            >
              {t.newTestament}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {displayedBooks.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={[styles.bookRow, { borderBottomColor: colors.border }]}
            onPress={() => handleBookPress(book.id)}
          >
            <View>
              <Text style={[styles.bookName, { color: colors.text }]}>
                {getBookName(book.id, book.name)}
              </Text>
              <Text style={[styles.chapterCount, { color: colors.textMuted }]}>
                {book.chapters} {t.chapters}
              </Text>
            </View>
            <ChevronRight color={colors.textMuted} size={20} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resumeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  resumeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  bookName: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 2,
  },
  chapterCount: {
    fontSize: 13,
  },
});
