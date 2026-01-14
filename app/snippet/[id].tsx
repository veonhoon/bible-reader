import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSnippetById, Snippet } from '@/services/weeklyContentService';
import { BIBLE_BOOKS } from '@/mocks/bibleData';

export default function SnippetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSnippet = async () => {
      if (id) {
        const data = await getSnippetById(id);
        setSnippet(data);
      }
      setLoading(false);
    };
    loadSnippet();
  }, [id]);

  const parseScriptureReference = (reference: string): { bookId: string; chapter: number } | null => {
    // Parse references like "John 3:16", "1 Corinthians 13:4-7", "Genesis 1:1", "Psalm 23"
    // First, try to match the book name and chapter
    const match = reference.match(/^(\d?\s*[A-Za-z\s]+?)\s*(\d+)(?:[:\.].*)?$/);
    if (!match) return null;

    const bookName = match[1].trim().toLowerCase();
    const chapter = parseInt(match[2], 10);

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

    if (!book) return null;
    return { bookId: book.id, chapter };
  };

  const openScripture = () => {
    if (snippet?.scripture?.reference) {
      const parsed = parseScriptureReference(snippet.scripture.reference);
      if (parsed) {
        router.push(`/reader?bookId=${parsed.bookId}&chapter=${parsed.chapter}`);
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
        <Text style={styles.errorText}>Snippet not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: snippet.title,
          headerBackTitle: 'Back',
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
          <Text style={styles.teachingText}>{snippet.snippet}</Text>
        </View>

        {/* Scripture Section */}
        {snippet.scripture?.reference && (
          <View style={styles.scriptureSection}>
            <View style={styles.scriptureHeader}>
              <Ionicons name="book-outline" size={20} color="#6366f1" />
              <Text style={styles.scriptureReference}>{snippet.scripture.reference}</Text>
            </View>
            <Text style={styles.scriptureText}>"{snippet.scripture.text}"</Text>
            <TouchableOpacity style={styles.readMoreButton} onPress={openScripture}>
              <Text style={styles.readMoreText}>Read Full Scripture</Text>
              <Ionicons name="arrow-forward" size={16} color="#6366f1" />
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
