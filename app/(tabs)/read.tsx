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
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { BIBLE_BOOKS } from '@/mocks/bibleData';

export default function ReadScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lastRead, isLoading } = useReadingProgress();
  const [activeTestament, setActiveTestament] = useState<'old' | 'new'>('old');
  const [hasNavigated, setHasNavigated] = useState(false);

  // Auto-navigate to last read position when tab is opened
  useEffect(() => {
    if (!isLoading && lastRead && !hasNavigated) {
      setHasNavigated(true);
      router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`);
    }
  }, [isLoading, lastRead, hasNavigated]);

  // Reset navigation flag when component unmounts
  useEffect(() => {
    return () => {
      setHasNavigated(false);
    };
  }, []);

  const oldTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'old');
  const newTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'new');

  const handleBookPress = (bookId: string) => {
    router.push(`/chapter-selector?bookId=${bookId}`);
  };

  const displayedBooks = activeTestament === 'old' ? oldTestamentBooks : newTestamentBooks;

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
        <Text style={[styles.title, { color: colors.text }]}>Bible</Text>

        {/* Quick resume button if there's a last read position */}
        {lastRead && (
          <TouchableOpacity
            style={[styles.resumeCard, { backgroundColor: colors.accent }]}
            onPress={() => router.push(`/reader?bookId=${lastRead.bookId}&chapter=${lastRead.chapter}`)}
          >
            <BookOpen color="#FFFFFF" size={20} />
            <View style={styles.resumeTextContainer}>
              <Text style={styles.resumeLabel}>Continue Reading</Text>
              <Text style={styles.resumeTitle}>{lastRead.bookName} {lastRead.chapter}</Text>
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
              Old Testament
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
              New Testament
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {displayedBooks.map((book, index) => (
          <TouchableOpacity
            key={book.id}
            style={[
              styles.bookItem,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderBottomWidth: index === displayedBooks.length - 1 ? 1 : 0,
              },
            ]}
            onPress={() => handleBookPress(book.id)}
            testID={`book-${book.id}`}
          >
            <View style={styles.bookInfo}>
              <Text style={[styles.bookName, { color: colors.text }]}>
                {book.name}
              </Text>
              <Text style={[styles.bookChapters, { color: colors.textSecondary }]}>
                {book.chapters} chapters
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
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  resumeTextContainer: {
    flex: 1,
  },
  resumeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    marginTop: -1,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  bookChapters: {
    fontSize: 13,
  },
});
