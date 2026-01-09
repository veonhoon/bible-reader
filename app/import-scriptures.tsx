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
import { Upload, HelpCircle, Lock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomScriptures } from '@/contexts/CustomScripturesContext';
import { useAdmin } from '@/contexts/AdminContext';

export default function ImportScripturesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { importScriptures, scheduleNotification } = useCustomScriptures();
  const { isAdmin, login } = useAdmin();
  
  const [text, setText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter admin password');
      return;
    }

    setIsLoggingIn(true);
    const success = await login(password);
    setIsLoggingIn(false);

    if (success) {
      Alert.alert('Success', 'Admin access granted');
      setPassword('');
    } else {
      Alert.alert('Error', 'Invalid password');
    }
  };

  const handleImport = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Input', 'Please paste your scriptures before importing.');
      return;
    }

    setIsImporting(true);
    try {
      const count = await importScriptures(text);
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Enable Notifications?',
          'Would you like to receive daily reminders at 9:00 AM?',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => {
                router.replace('/');
              },
            },
            {
              text: 'Enable',
              onPress: async () => {
                await scheduleNotification(9, 0);
                router.replace('/');
              },
            },
          ]
        );
      } else {
        Alert.alert('Success', `Imported ${count} scriptures!`, [
          { text: 'OK', onPress: () => router.replace('/') },
        ]);
      }
    } catch (error) {
      console.log('Import error:', error);
      Alert.alert('Error', 'Failed to import scriptures. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Import Scriptures',
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
          {!isAdmin ? (
            <>
              <View style={[styles.lockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.lockIcon, { backgroundColor: colors.accent + '15' }]}>
                  <Lock color={colors.accent} size={32} />
                </View>
                <Text style={[styles.lockTitle, { color: colors.text }]}>
                  Admin Access Required
                </Text>
                <Text style={[styles.lockDescription, { color: colors.textSecondary }]}>
                  Scripture import is restricted to the app administrator to ensure quality and consistency.
                </Text>
              </View>

              <View style={styles.loginContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
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
                    (!password.trim() || isLoggingIn) && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={!password.trim() || isLoggingIn}
                  testID="admin-login-button"
                >
                  <Lock color="#FFFFFF" size={20} />
                  <Text style={styles.loginButtonText}>
                    {isLoggingIn ? 'Verifying...' : 'Admin Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.infoHeader}>
              <HelpCircle color={colors.accent} size={20} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                How to Format
              </Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Paste your scriptures with one per line.{'\n'}
              Optionally add a reference after | character.
            </Text>
            
            {showHelp && (
              <View style={[styles.exampleBox, { backgroundColor: colors.card }]}>
                <Text style={[styles.exampleTitle, { color: colors.text }]}>
                  Example:
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

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Your Scriptures
            </Text>
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
              placeholder="Paste your scriptures here..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              testID="scripture-input"
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>
              {text.split('\n').filter(l => l.trim()).length} scriptures
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.importButton,
              { backgroundColor: colors.accent },
              (!text.trim() || isImporting) && styles.importButtonDisabled,
            ]}
            onPress={handleImport}
            disabled={!text.trim() || isImporting}
            testID="import-button"
          >
            <Upload color="#FFFFFF" size={20} />
            <Text style={styles.importButtonText}>
              {isImporting ? 'Importing...' : 'Import Scriptures'}
            </Text>
          </TouchableOpacity>
            </>
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
  loginContainer: {
    marginBottom: 24,
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
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  textInput: {
    minHeight: 300,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Georgia',
  },
  charCount: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'right',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
