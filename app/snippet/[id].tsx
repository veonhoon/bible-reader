import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSnippetById, Snippet } from '@/services/weeklyContentService';
import { BIBLE_BOOKS } from '@/mocks/bibleData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { KOREAN_BOOK_NAMES } from '@/constants/koreanBookNames';

export default function SnippetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isKorean = language === 'ko';

  useEffect(() => {
    const loadSnippet = async () => {
      console.log('[SnippetDetail] Loading snippet with ID:', id);

      if (id) {
        const data = await getSnippetById(id, language);
        if (data) {
          console.log('[SnippetDetail] Snippet loaded:', JSON.stringify({
            title: data.title,
            subtitle: data.subtitle,
            bodyLength: data.body?.length || 0,
            bodyPreview: data.body?.substring(0, 50),
            scriptureRef: data.scripture?.reference,
            scriptureTextLength: data.scripture?.text?.length || 0,
          }));
        } else {
          console.log('[SnippetDetail] Snippet not found for ID:', id);
        }
        setSnippet(data);
      } else {
        console.warn('[SnippetDetail] No ID provided');
      }
      setLoading(false);
    };
    loadSnippet();
  }, [id, language]);

  const parseScriptureReference = (reference: string): { bookId: string; chapter: number; verse?: number } | null => {
    // Build Korean to English book ID mapping
    const koreanToBookId: Record<string, string> = {};
    Object.entries(KOREAN_BOOK_NAMES).forEach(([bookId, { korean }]) => {
      koreanToBookId[korean] = bookId;
    });
    
    // Try Korean format first: "여호수아 1:9" or "창세기 17:19-20"
    const koreanMatch = reference.match(/^([가-힣]+)\s*(\d+)(?:[:\.](\d+))?/);
    if (koreanMatch) {
      const koreanName = koreanMatch[1];
      const chapter = parseInt(koreanMatch[2], 10);
      const verse = koreanMatch[3] ? parseInt(koreanMatch[3], 10) : undefined;
      
      // Find book ID from Korean name
      const bookId = koreanToBookId[koreanName];
      if (bookId) {
        // Verify book exists in BIBLE_BOOKS
        const book = BIBLE_BOOKS.find(b => b.id === bookId);
        if (book) {
          console.log('[Scripture] Korean reference parsed:', koreanName, '->', bookId, chapter, verse);
          return { bookId: book.id, chapter, verse };
        }
      }
      console.log('[Scripture] Korean book not found:', koreanName);
    }
    
    // English format: "John 3:16", "1 Corinthians 13:4-7", "Genesis 1:1"
    const match = reference.match(/^(\d?\s*[A-Za-z\s]+?)\s*(\d+)(?:[:\.](\d+))?/);
    if (!match) return null;

    const bookName = match[1].trim().toLowerCase();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : undefined;

    // Find the book by matching name or shortName
    const book = BIBLE_BOOKS.find(b => {
      const name = b.name.toLowerCase();
      const shortName = b.shortName.toLowerCase();
      // Handle "Psalm" vs "Psalms"
      const normalizedBookName = bookName.replace(/^psalm$/, 'psalms');
      return name === normalizedBookName ||
             shortName === normalizedBookName ||
             name.startsWith(normalizedBookName) ||
             normalizedBookName.startsWith(name.split(' ')[0]);
    });

    if (!book) {
      console.log('[Scripture] English book not found:', bookName);
      return null;
    }
    console.log('[Scripture] English reference parsed:', bookName, '->', book.id, chapter, verse);
    return { bookId: book.id, chapter, verse };
  };

  const openScripture = () => {
    if (snippet?.scripture?.reference) {
      const parsed = parseScriptureReference(snippet.scripture.reference);
      if (parsed) {
        const params = [`bookId=${parsed.bookId}`, `chapter=${parsed.chapter}`];
        if (parsed.verse) {
          params.push(`highlightVerse=${parsed.verse}`);
        }
        router.push(`/reader?${params.join('&')}`);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!snippet) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
        <Text style={styles.errorText}>{isKorean ? '가르침을 찾을 수 없습니다' : 'Teaching not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{isKorean ? '돌아가기' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isKorean ? '말씀' : 'Teaching',
          headerBackTitle: isKorean ? '뒤로' : 'Back',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{snippet.title}</Text>
          {snippet.subtitle && (
            <Text style={styles.subtitle}>{snippet.subtitle}</Text>
          )}
        </View>

        {/* Teaching Content */}
        <View style={styles.teachingSection}>
          <Text style={styles.teachingText}>{snippet.body}</Text>
        </View>

        {/* Scripture Section */}
        {snippet.scripture?.reference && (
          <View style={[
            styles.scriptureSection,
            snippet.isDirectCitation && styles.directCitationSection
          ]}>
            {snippet.isDirectCitation && (
              <View style={styles.directCitationBadge}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.directCitationBadgeText}>
                  {isKorean ? '말씀에서 직접 인용' : 'From the Teaching'}
                </Text>
              </View>
            )}
            <View style={styles.scriptureHeader}>
              <Ionicons 
                name="book-outline" 
                size={20} 
                color={snippet.isDirectCitation ? "#1d4ed8" : "#6366f1"} 
              />
              <Text style={[
                styles.scriptureReference,
                snippet.isDirectCitation && styles.directCitationReference
              ]}>
                {snippet.scripture.reference}
              </Text>
            </View>
            <Text style={[
              styles.scriptureText,
              snippet.isDirectCitation && styles.directCitationText
            ]}>
              "{snippet.scripture.text}"
            </Text>
            <TouchableOpacity style={styles.readMoreButton} onPress={openScripture}>
              <Text style={[
                styles.readMoreText,
                snippet.isDirectCitation && styles.directCitationReadMore
              ]}>
                {isKorean ? '전체 성경 읽기' : 'Read Full Scripture'}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={16} 
                color={snippet.isDirectCitation ? "#1d4ed8" : "#6366f1"} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer for safe area */}
        <View style={styles.spacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 12,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  teachingSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  teachingText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#374151',
  },
  scriptureSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  directCitationSection: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e40af',
    borderWidth: 2,
  },
  directCitationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  directCitationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  directCitationReference: {
    color: '#93c5fd',
  },
  directCitationText: {
    color: '#dbeafe',
    fontStyle: 'normal',
  },
  directCitationReadMore: {
    color: '#93c5fd',
  },
  scriptureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scriptureReference: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 8,
  },
  scriptureText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 26,
    color: '#1e3a8a',
    marginBottom: 16,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366f1',
    marginRight: 4,
  },
  spacer: {
    height: 40,
  },
});
