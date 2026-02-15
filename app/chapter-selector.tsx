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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBook } from '@/mocks/bibleData';
import { KOREAN_BOOK_NAMES } from '@/constants/koreanBookNames';

const { width } = Dimensions.get('window');
const COLUMNS = 5;
const BUTTON_SIZE = (width - 80) / COLUMNS;

export default function ChapterSelectorScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ bookId: string }>();

  const isKorean = language === 'ko';
  const bookId = params.bookId || 'genesis';
  const book = getBook(bookId);

  // Get localized book name
  const getBookName = (): string => {
    if (!book) return '';
    if (isKorean) {
      const koreanData = KOREAN_BOOK_NAMES[bookId];
      return koreanData?.korean || book.name;
    }
    return book.name;
  };

  const handleChapterSelect = (chapter: number) => {
    router.replace({
      pathname: '/reader',
      params: { bookId, chapter: String(chapter) },
    });
  };

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {isKorean ? '책을 찾을 수 없습니다' : 'Book not found'}
        </Text>
      </View>
    );
  }

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {getBookName()}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          testID="close-chapter-selector"
        >
          <X color={colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isKorean ? '장을 선택하세요' : 'Select a chapter'}
        </Text>

        <View style={styles.chaptersGrid}>
          {chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter}
              style={[
                styles.chapterButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => handleChapterSelect(chapter)}
            >
              <Text style={[styles.chapterText, { color: colors.text }]}>
                {chapter}
              </Text>
            </TouchableOpacity>
          ))}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  chapterButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  chapterText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
