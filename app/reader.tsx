import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Bookmark, Highlighter, ChevronDown, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useChapter } from '@/contexts/BibleContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { getBook, BIBLE_BOOKS } from '@/mocks/bibleData';

export default function ReaderScreen() {
  const { colors } = useTheme();
  const { addBookmark, isBookmarked, addHighlight, isHighlighted } = useBookmarks();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ bookId: string; chapter: string }>();

  const bookId = params.bookId || 'genesis';
  const chapter = parseInt(params.chapter || '1', 10);

  const book = getBook(bookId);
  const { data: chapterData, isLoading, error, refetch } = useChapter(bookId, chapter);
  const { saveProgress } = useReadingProgress();

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  useEffect(() => {
    if (bookId && chapter && !isLoading && !error) {
      console.log('[Reader] Saving reading progress:', bookId, chapter);
      saveProgress(bookId, chapter);
    }
  }, [bookId, chapter, isLoading, error, saveProgress]);

  const handleVersePress = useCallback((verse: number) => {
    Haptics.selectionAsync();
    setSelectedVerse(selectedVerse === verse ? null : verse);
  }, [selectedVerse]);

  const handleBookmark = useCallback((verse: number, text: string) => {
    if (!book) return;
    addBookmark({
      bookId,
      bookName: book.name,
      chapter,
      verse,
      text,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedVerse(null);
  }, [book, bookId, chapter, addBookmark]);

  const handleHighlight = useCallback((verse: number, text: string) => {
    if (!book) return;
    addHighlight({
      bookId,
      bookName: book.name,
      chapter,
      verse,
      text,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedVerse(null);
  }, [book, bookId, chapter, addHighlight]);

  const goToPreviousChapter = () => {
    if (chapter > 1) {
      router.setParams({ chapter: String(chapter - 1) });
    } else {
      const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === bookId);
      if (currentIndex > 0) {
        const prevBook = BIBLE_BOOKS[currentIndex - 1];
        router.setParams({ bookId: prevBook.id, chapter: String(prevBook.chapters) });
      }
    }
  };

  const goToNextChapter = () => {
    if (book && chapter < book.chapters) {
      router.setParams({ chapter: String(chapter + 1) });
    } else {
      const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === bookId);
      if (currentIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIndex + 1];
        router.setParams({ bookId: nextBook.id, chapter: '1' });
      }
    }
  };

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Book not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.titleButton}
          onPress={() => router.push({
            pathname: '/chapter-selector',
            params: { bookId },
          })}
          testID="chapter-selector-button"
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {book.name} {chapter}
          </Text>
          <ChevronDown color={colors.textMuted} size={18} />
        </TouchableOpacity>
        
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading scripture...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Unable to load chapter
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error.message}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => refetch()}
          >
            <RefreshCw color="#FFFFFF" size={18} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : chapterData ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.chapterNumber, { color: colors.accent }]}>
            {chapter}
          </Text>

          {chapterData.verses.map((verse) => {
            const isVerseBookmarked = isBookmarked(bookId, chapter, verse.verse);
            const isVerseHighlighted = isHighlighted(bookId, chapter, verse.verse);
            const isSelected = selectedVerse === verse.verse;

            return (
              <View key={verse.verse}>
                <Pressable
                  onPress={() => handleVersePress(verse.verse)}
                  style={[
                    styles.verseContainer,
                    isVerseHighlighted && { backgroundColor: colors.highlight },
                  ]}
                  testID={`verse-${verse.verse}`}
                >
                  <Text style={[styles.verseNumber, { color: colors.accent }]}>
                    {verse.verse}
                  </Text>
                  <Text style={[styles.verseText, { color: colors.text }]}>
                    {verse.text}
                    {isVerseBookmarked && (
                      <Text style={{ color: colors.gold }}> ●</Text>
                    )}
                  </Text>
                </Pressable>

                {isSelected && (
                  <View style={[styles.verseActions, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isVerseBookmarked && { backgroundColor: colors.gold + '20' },
                      ]}
                      onPress={() => handleBookmark(verse.verse, verse.text)}
                      testID={`bookmark-verse-${verse.verse}`}
                    >
                      <Bookmark
                        color={isVerseBookmarked ? colors.gold : colors.text}
                        size={18}
                        fill={isVerseBookmarked ? colors.gold : 'none'}
                      />
                      <Text style={[styles.actionText, { color: isVerseBookmarked ? colors.gold : colors.text }]}>
                        {isVerseBookmarked ? 'Saved' : 'Save'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isVerseHighlighted && { backgroundColor: colors.highlight },
                      ]}
                      onPress={() => handleHighlight(verse.verse, verse.text)}
                      testID={`highlight-verse-${verse.verse}`}
                    >
                      <Highlighter
                        color={isVerseHighlighted ? colors.gold : colors.text}
                        size={18}
                      />
                      <Text style={[styles.actionText, { color: isVerseHighlighted ? colors.gold : colors.text }]}>
                        {isVerseHighlighted ? 'Highlighted' : 'Highlight'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      ) : null}

      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={goToPreviousChapter}
          testID="previous-chapter"
        >
          <ChevronLeft color={colors.text} size={20} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={goToNextChapter}
          testID="next-chapter"
        >
          <Text style={[styles.navButtonText, { color: colors.text }]}>Next</Text>
          <ChevronLeft color={colors.text} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
      </View>
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
    marginRight: 8,
  },
  titleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  chapterNumber: {
    fontSize: 64,
    fontWeight: '300' as const,
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginRight: 8,
    marginTop: 4,
    width: 24,
    textAlign: 'right',
  },
  verseText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 30,
    fontFamily: 'Georgia',
  },
  verseActions: {
    flexDirection: 'row',
    marginLeft: 32,
    marginBottom: 12,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 4,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
