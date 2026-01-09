import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bookmark, Highlighter, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useBookmarks } from '@/contexts/BookmarksContext';

type TabType = 'bookmarks' | 'highlights';

export default function BookmarksScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookmarks, highlights, removeBookmark, removeHighlight } = useBookmarks();
  const [activeTab, setActiveTab] = useState<TabType>('bookmarks');

  const handleItemPress = (bookId: string, chapter: number) => {
    router.push({
      pathname: '/reader',
      params: { bookId, chapter: String(chapter) },
    });
  };

  const handleRemoveBookmark = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeBookmark(id);
  };

  const handleRemoveHighlight = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeHighlight(id);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Saved</Text>
        
        <View style={[styles.tabContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'bookmarks' && { backgroundColor: colors.card },
            ]}
            onPress={() => setActiveTab('bookmarks')}
            testID="bookmarks-tab"
          >
            <Bookmark
              color={activeTab === 'bookmarks' ? colors.accent : colors.textMuted}
              size={16}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'bookmarks' ? colors.text : colors.textMuted },
              ]}
            >
              Bookmarks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'highlights' && { backgroundColor: colors.card },
            ]}
            onPress={() => setActiveTab('highlights')}
            testID="highlights-tab"
          >
            <Highlighter
              color={activeTab === 'highlights' ? colors.accent : colors.textMuted}
              size={16}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'highlights' ? colors.text : colors.textMuted },
              ]}
            >
              Highlights
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'bookmarks' && (
          <>
            {bookmarks.length === 0 ? (
              <View style={styles.emptyState}>
                <Bookmark color={colors.textMuted} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No bookmarks yet
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  Tap on a verse while reading to save it here
                </Text>
              </View>
            ) : (
              bookmarks.map((bookmark) => (
                <TouchableOpacity
                  key={bookmark.id}
                  style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleItemPress(bookmark.bookId, bookmark.chapter)}
                  testID={`bookmark-item-${bookmark.id}`}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemReference, { color: colors.accent }]}>
                        {bookmark.bookName} {bookmark.chapter}:{bookmark.verse}
                      </Text>
                      <Text style={[styles.itemDate, { color: colors.textMuted }]}>
                        {formatDate(bookmark.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.itemText, { color: colors.text }]}
                      numberOfLines={3}
                    >
                      {bookmark.text}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveBookmark(bookmark.id)}
                    testID={`delete-bookmark-${bookmark.id}`}
                  >
                    <Trash2 color={colors.error} size={18} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {activeTab === 'highlights' && (
          <>
            {highlights.length === 0 ? (
              <View style={styles.emptyState}>
                <Highlighter color={colors.textMuted} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No highlights yet
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  Highlight verses while reading to save them here
                </Text>
              </View>
            ) : (
              highlights.map((highlight) => (
                <TouchableOpacity
                  key={highlight.id}
                  style={[styles.itemCard, { backgroundColor: colors.highlight, borderColor: colors.border }]}
                  onPress={() => handleItemPress(highlight.bookId, highlight.chapter)}
                  testID={`highlight-item-${highlight.id}`}
                >
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemReference, { color: colors.accent }]}>
                        {highlight.bookName} {highlight.chapter}:{highlight.verse}
                      </Text>
                      <Text style={[styles.itemDate, { color: colors.textMuted }]}>
                        {formatDate(highlight.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.itemText, { color: colors.text }]}
                      numberOfLines={3}
                    >
                      {highlight.text}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveHighlight(highlight.id)}
                    testID={`delete-highlight-${highlight.id}`}
                  >
                    <Trash2 color={colors.error} size={18} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemReference: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  itemDate: {
    fontSize: 12,
  },
  itemText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Georgia',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
