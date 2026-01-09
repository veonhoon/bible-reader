import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomScriptures } from '@/contexts/CustomScripturesContext';

export default function DailyScriptureScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    todayScriptures,
    scriptures,
    progress,
    scripturesPerDay,
    markAsRead,
    skipToNext,
    goToScripture,
  } = useCustomScriptures();

  const [showAllScriptures, setShowAllScriptures] = useState(false);

  const handleMarkAsRead = async () => {
    await markAsRead();
    const message = scripturesPerDay > 1 
      ? `Moving to tomorrow's ${scripturesPerDay} scriptures.`
      : "Moving to tomorrow's scripture.";
    Alert.alert('Great!', message);
  };

  const handleSkip = async () => {
    await skipToNext();
  };

  if (todayScriptures.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Daily Scripture',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No scriptures available. Please import scriptures first.
          </Text>
          <TouchableOpacity
            style={[styles.importButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/import-scriptures')}
          >
            <Text style={styles.importButtonText}>Import Scriptures</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Daily Scripture',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.accent,
                  width: `${((progress.currentIndex + 1) / scriptures.length) * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Day {Math.floor(progress.currentIndex / scripturesPerDay) + 1} • {scripturesPerDay} scripture{scripturesPerDay > 1 ? 's' : ''} per day
          </Text>

          {progress.completedToday && (
            <View style={[styles.completedBadge, { backgroundColor: colors.accent + '20' }]}>
              <Check color={colors.accent} size={16} />
              <Text style={[styles.completedText, { color: colors.accent }]}>
                Completed Today
              </Text>
            </View>
          )}

          {todayScriptures.map((scripture, index) => (
            <View key={scripture.id} style={[styles.scriptureCard, { backgroundColor: colors.card }]}>
              {todayScriptures.length > 1 && (
                <View style={[styles.scriptureNumber, { backgroundColor: colors.accent + '15' }]}>
                  <Text style={[styles.scriptureNumberText, { color: colors.accent }]}>
                    {index + 1}
                  </Text>
                </View>
              )}

              <Text style={[styles.scriptureText, { color: colors.text }]}>
                &ldquo;{scripture.text}&rdquo;
              </Text>

              {scripture.reference && (
                <Text style={[styles.reference, { color: colors.accent }]}>
                  — {scripture.reference}
                </Text>
              )}
            </View>
          ))}

          <View style={styles.actions}>
            {!progress.completedToday && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                onPress={handleMarkAsRead}
                testID="mark-read-button"
              >
                <Check color="#FFFFFF" size={20} />
                <Text style={styles.actionButtonText}>Mark as Read</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.actionButtonOutline,
                { borderColor: colors.border },
                progress.completedToday && { flex: 1 },
              ]}
              onPress={handleSkip}
              testID="skip-button"
            >
              <Text style={[styles.actionButtonOutlineText, { color: colors.text }]}>
                Skip to Next
              </Text>
              <ChevronRight color={colors.text} size={18} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.viewAllButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => setShowAllScriptures(!showAllScriptures)}
          >
            <Text style={[styles.viewAllText, { color: colors.text }]}>
              {showAllScriptures ? 'Hide' : 'View'} All Scriptures
            </Text>
            <ChevronRight
              color={colors.textMuted}
              size={20}
              style={{
                transform: [{ rotate: showAllScriptures ? '90deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>

          {showAllScriptures && (
            <View style={styles.allScriptures}>
              {scriptures.map((scripture, index) => (
                <TouchableOpacity
                  key={scripture.id}
                  style={[
                    styles.scriptureItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    index === progress.currentIndex && {
                      borderColor: colors.accent,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => goToScripture(index)}
                  testID={`scripture-item-${index}`}
                >
                  <View style={styles.scriptureItemContent}>
                    <View style={styles.scriptureItemHeader}>
                      <Text style={[styles.scriptureItemNumber, { color: colors.textMuted }]}>
                        #{index + 1}
                      </Text>
                      {index === progress.currentIndex && (
                        <View style={[styles.currentBadge, { backgroundColor: colors.accent }]}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[styles.scriptureItemText, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {scripture.text}
                    </Text>
                    {scripture.reference && (
                      <Text style={[styles.scriptureItemRef, { color: colors.textSecondary }]}>
                        {scripture.reference}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 24,
  },
  scriptureCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  scriptureNumber: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scriptureNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  scriptureText: {
    fontSize: 20,
    lineHeight: 32,
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  reference: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonOutlineText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  allScriptures: {
    gap: 12,
  },
  scriptureItem: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  scriptureItemContent: {
    flex: 1,
  },
  scriptureItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scriptureItemNumber: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  currentBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  scriptureItemText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Georgia',
    marginBottom: 6,
  },
  scriptureItemRef: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  importButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
