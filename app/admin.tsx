import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Upload, 
  HelpCircle, 
  Bell, 
  Trash2, 
  LogOut,
  BookOpen,
  Clock,
  Lock,
  ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomScriptures } from '@/contexts/CustomScripturesContext';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    importScriptures, 
    clearScriptures, 
    scheduleNotification,
    cancelNotifications,
    scriptures,
    notificationTime,
  } = useCustomScriptures();
const { isAdmin, logout, login } = useAdmin();
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [text, setText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifHour, setNotifHour] = useState(notificationTime.hour.toString());
  const [notifMinute, setNotifMinute] = useState(notificationTime.minute.toString().padStart(2, '0'));

  const handleImport = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Input', 'Please paste your scriptures before importing.');
      return;
    }

    setIsImporting(true);
    try {
      const count = await importScriptures(text);
      Alert.alert('Success', `Imported ${count} scriptures for all users!`);
      setText('');
    } catch (error) {
      console.log('Import error:', error);
      Alert.alert('Error', 'Failed to import scriptures. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearScriptures = () => {
    Alert.alert(
      'Clear All Scriptures',
      'This will remove all scriptures for all users. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearScriptures();
            Alert.alert('Cleared', 'All scriptures have been removed.');
          },
        },
      ]
    );
  };

  const handleSetNotificationTime = async () => {
    const hour = parseInt(notifHour, 10);
    const minute = parseInt(notifMinute, 10);

    if (isNaN(hour) || hour < 0 || hour > 23) {
      Alert.alert('Invalid Hour', 'Please enter a valid hour (0-23)');
      return;
    }
    if (isNaN(minute) || minute < 0 || minute > 59) {
      Alert.alert('Invalid Minute', 'Please enter a valid minute (0-59)');
      return;
    }

    if (Platform.OS !== 'web') {
      const success = await scheduleNotification(hour, minute);
      if (success) {
        Alert.alert('Success', `Daily notification set for ${hour}:${minute.toString().padStart(2, '0')}`);
      } else {
        Alert.alert('Error', 'Failed to set notification. Please check permissions.');
      }
    } else {
      Alert.alert('Info', 'Notifications are not available on web.');
    }
  };

  const handleCancelNotifications = async () => {
    await cancelNotifications();
    Alert.alert('Cancelled', 'Daily notifications have been disabled.');
  };

  const handleLogin = async () => {
    if (!password.trim()) return;
    setIsLoggingIn(true);
    const success = await login(password);
    setIsLoggingIn(false);
    if (!success) {
      Alert.alert('Error', 'Invalid admin password');
    }
    setPassword('');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await logout();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Admin Panel',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!isAdmin ? (
          <View style={styles.loginContainer}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.back()}
              testID="admin-back-button"
            >
              <ArrowLeft color={colors.text} size={20} />
              <Text style={[styles.backButtonText, { color: colors.text }]}>Back to Settings</Text>
            </TouchableOpacity>

            <View style={[styles.lockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.lockIcon, { backgroundColor: colors.accent + '15' }]}>
                <Lock color={colors.accent} size={32} />
              </View>
              <Text style={[styles.lockTitle, { color: colors.text }]}>
                Admin Access Required
              </Text>
              <Text style={[styles.lockDescription, { color: colors.textSecondary }]}>
                Enter admin password to manage scriptures and notifications.
              </Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Admin Password
            </Text>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter admin password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              testID="admin-password-input"
            />

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: colors.accent },
                (!password.trim() || isLoggingIn) && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!password.trim() || isLoggingIn}
              testID="admin-login-button"
            >
              <Lock color="#FFFFFF" size={20} />
              <Text style={styles.loginButtonText}>
                {isLoggingIn ? 'Verifying...' : 'Login as Admin'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
        <View style={[styles.statusCard, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '25' }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: colors.accent + '20' }]}>
              <BookOpen color={colors.accent} size={24} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                Scripture Status
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                {scriptures.length} scriptures loaded
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            IMPORT SCRIPTURES
          </Text>
          
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.infoHeader}>
              <HelpCircle color={colors.accent} size={20} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                How to Format
              </Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              One scripture per line. Add reference after | character.{'\n'}
              Scriptures are distributed evenly across the week.
            </Text>
            
            {showHelp && (
              <View style={[styles.exampleBox, { backgroundColor: colors.card }]}>
                <Text style={[styles.exampleTitle, { color: colors.text }]}>
                  Example (7 scriptures = 1/day):
                </Text>
                <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
                  Trust in the LORD with all thine heart | Proverbs 3:5{'\n'}
                  The LORD is my shepherd | Psalm 23:1{'\n'}
                  For God so loved the world | John 3:16
                </Text>
              </View>
            )}
            
            <TouchableOpacity onPress={() => setShowHelp(!showHelp)}>
              <Text style={[styles.helpLink, { color: colors.accent }]}>
                {showHelp ? 'Hide Example' : 'Show Example'}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={text}
            onChangeText={setText}
            placeholder="Paste scriptures here (one per line)..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            testID="admin-scripture-input"
          />
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {text.split('\n').filter(l => l.trim()).length} scriptures to import
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.accent },
              (!text.trim() || isImporting) && styles.buttonDisabled,
            ]}
            onPress={handleImport}
            disabled={!text.trim() || isImporting}
            testID="admin-import-button"
          >
            <Upload color="#FFFFFF" size={20} />
            <Text style={styles.primaryButtonText}>
              {isImporting ? 'Importing...' : 'Import Scriptures'}
            </Text>
          </TouchableOpacity>

          {scriptures.length > 0 && (
            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: colors.error }]}
              onPress={handleClearScriptures}
              testID="clear-scriptures-button"
            >
              <Trash2 color={colors.error} size={20} />
              <Text style={[styles.dangerButtonText, { color: colors.error }]}>
                Clear All Scriptures
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NOTIFICATION SETTINGS
          </Text>
          
          <View style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.notifHeader}>
              <Bell color={colors.accent} size={20} />
              <Text style={[styles.notifTitle, { color: colors.text }]}>
                Daily Reminder Time
              </Text>
            </View>
            
            <Text style={[styles.notifDescription, { color: colors.textSecondary }]}>
              Set the default time for daily scripture notifications.
            </Text>

            <View style={styles.timeInputRow}>
              <View style={styles.timeInputGroup}>
                <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Hour (0-23)</Text>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                  value={notifHour}
                  onChangeText={setNotifHour}
                  keyboardType="number-pad"
                  maxLength={2}
                  testID="notif-hour-input"
                />
              </View>
              <Text style={[styles.timeSeparator, { color: colors.text }]}>:</Text>
              <View style={styles.timeInputGroup}>
                <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Minute</Text>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                  value={notifMinute}
                  onChangeText={setNotifMinute}
                  keyboardType="number-pad"
                  maxLength={2}
                  testID="notif-minute-input"
                />
              </View>
            </View>

            <View style={styles.notifActions}>
              <TouchableOpacity
                style={[styles.notifButton, { backgroundColor: colors.accent }]}
                onPress={handleSetNotificationTime}
              >
                <Clock color="#FFFFFF" size={18} />
                <Text style={styles.notifButtonText}>Set Time</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.notifButtonOutline, { borderColor: colors.border }]}
                onPress={handleCancelNotifications}
              >
                <Text style={[styles.notifButtonOutlineText, { color: colors.text }]}>
                  Disable
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ADMIN
          </Text>
          
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleLogout}
          >
            <LogOut color={colors.textMuted} size={20} />
            <Text style={[styles.logoutButtonText, { color: colors.text }]}>
              Logout from Admin
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.currentScriptures, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.currentTitle, { color: colors.text }]}>
            Current Scriptures Preview
          </Text>
          {scriptures.length === 0 ? (
            <Text style={[styles.noScripturesText, { color: colors.textMuted }]}>
              No scriptures imported yet
            </Text>
          ) : (
            scriptures.slice(0, 5).map((scripture, index) => (
              <View key={scripture.id} style={[styles.scripturePreview, { borderBottomColor: colors.border }]}>
                <View style={[styles.scriptureIndex, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.scriptureIndexText, { color: colors.accent }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.scriptureContent}>
                  <Text style={[styles.scriptureText, { color: colors.text }]} numberOfLines={2}>
                    {scripture.text}
                  </Text>
                  {scripture.reference && (
                    <Text style={[styles.scriptureRef, { color: colors.textSecondary }]}>
                      {scripture.reference}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
          {scriptures.length > 5 && (
            <Text style={[styles.moreScriptures, { color: colors.textMuted }]}>
              +{scriptures.length - 5} more scriptures
            </Text>
          )}
        </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  exampleBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  exampleTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Georgia',
  },
  helpLink: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  textInput: {
    minHeight: 180,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  notifCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  notifTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  notifDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  timeInput: {
    width: 70,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600' as const,
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  notifActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notifButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  notifButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  notifButtonOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  notifButtonOutlineText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  currentScriptures: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  noScripturesText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  loginContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  lockCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  passwordInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scripturePreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  scriptureIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scriptureIndexText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  scriptureContent: {
    flex: 1,
  },
  scriptureText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  scriptureRef: {
    fontSize: 12,
  },
  moreScriptures: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
