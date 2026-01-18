/**
 * Example component demonstrating Korean Bible usage
 * This shows various ways to use the useBible hook
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useBible } from '@/hooks/useBible';

export default function KoreanBibleExample() {
  const {
    getVerse,
    getChapter,
    searchVerses,
    isSearching,
    searchResults,
    allBookNames,
  } = useBible();

  const [searchQuery, setSearchQuery] = useState('');

  // Example 1: Get a single verse
  const johnVerse = getVerse('john', 3, 16);

  // Example 2: Get a chapter
  const genesisChapter = getChapter('genesis', 1);

  // Example 3: Handle search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchVerses(searchQuery, { maxResults: 20 });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Example 1: Display a single verse */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Example 1: Single Verse</Text>
        <View style={styles.card}>
          <Text style={styles.reference}>{johnVerse?.name}</Text>
          <Text style={styles.verseText}>{johnVerse?.text}</Text>
        </View>
      </View>

      {/* Example 2: Display chapter info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Example 2: Chapter Info</Text>
        <View style={styles.card}>
          <Text style={styles.reference}>{genesisChapter?.name}</Text>
          <Text style={styles.info}>
            총 {genesisChapter?.verses.length}절
          </Text>
          {/* Show first 3 verses */}
          {genesisChapter?.verses.slice(0, 3).map((verse) => (
            <View key={verse.verse} style={styles.verseContainer}>
              <Text style={styles.verseNumber}>{verse.verse}.</Text>
              <Text style={styles.verseText}>{verse.text}</Text>
            </View>
          ))}
          <Text style={styles.info}>... (더 보기)</Text>
        </View>
      </View>

      {/* Example 3: Search functionality */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Example 3: Search</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="검색어 입력 (예: 사랑, 믿음)"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>

        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2C3E73" />
            <Text style={styles.loadingText}>검색 중...</Text>
          </View>
        )}

        {!isSearching && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsCount}>
              {searchResults.length}개의 결과를 찾았습니다
            </Text>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={`${result.bookNumber}-${result.chapter}-${result.verse}`}
                style={styles.resultCard}
              >
                <Text style={styles.resultReference}>{result.name}</Text>
                <Text style={styles.resultText}>{result.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Example 4: List all book names */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Example 4: All Books</Text>
        <View style={styles.card}>
          <Text style={styles.info}>총 {allBookNames.length}권</Text>
          <View style={styles.booksGrid}>
            {allBookNames.slice(0, 12).map((bookName, index) => (
              <View key={index} style={styles.bookChip}>
                <Text style={styles.bookName}>{bookName}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.info}>... (더 보기)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E73',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reference: {
    fontSize: 14,
    color: '#5A5A5A',
    marginBottom: 8,
    fontWeight: '600',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1E1E1E',
  },
  info: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 8,
  },
  verseContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  verseNumber: {
    fontSize: 14,
    color: '#5A5A5A',
    fontWeight: '600',
    marginRight: 8,
    minWidth: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E6E1',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#2C3E73',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  resultsContainer: {
    gap: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#5A5A5A',
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  resultReference: {
    fontSize: 12,
    color: '#2C3E73',
    fontWeight: '600',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1E1E1E',
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  bookChip: {
    backgroundColor: '#F5F4F1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookName: {
    fontSize: 13,
    color: '#1E1E1E',
  },
});
