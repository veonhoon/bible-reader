import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Mail, Lock, User, ChevronLeft } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

// Conditionally import Apple Authentication to support Expo Go
let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
try {
  AppleAuthentication = require('expo-apple-authentication');
} catch (e) {
  console.log('expo-apple-authentication not available (running in Expo Go?)');
}

type AuthMode = 'options' | 'signin' | 'signup';

export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    isAppleSignInAvailable,
    isAuthenticated,
    error,
    clearError,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Navigate away when user becomes authenticated (for Google/Apple sign-in)
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  const handleEmailSignIn = async () => {
    if (!email || !password) return;
    setLocalLoading(true);
    clearError();
    try {
      await signInWithEmail(email, password);
      router.replace('/(tabs)');
    } catch {
      // Error is handled in context
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !displayName) return;
    setLocalLoading(true);
    clearError();
    try {
      await signUpWithEmail(email, password, displayName);
      router.replace('/(tabs)');
    } catch {
      // Error is handled in context
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  const handleAppleSignIn = async () => {
    clearError();
    await signInWithApple();
  };

  const handleBack = () => {
    if (mode === 'options') {
      router.back();
    } else {
      setMode('options');
      clearError();
    }
  };

  const renderOptions = () => (
    <View style={styles.optionsContainer}>
      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border }]}
        onPress={handleGoogleSignIn}
      >
        <AntDesign name="google" size={20} color="#4285F4" />
        <Text style={[styles.socialButtonText, { color: '#1F1F1F' }]}>Continue with Google</Text>
      </TouchableOpacity>

      {isAppleSignInAvailable && AppleAuthentication && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        />
      )}

      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>

      <TouchableOpacity
        style={[styles.emailButton, { borderColor: colors.border }]}
        onPress={() => setMode('signin')}
      >
        <Mail color={colors.text} size={20} />
        <Text style={[styles.emailButtonText, { color: colors.text }]}>
          Sign in with Email
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode('signup')}>
        <Text style={[styles.switchText, { color: colors.textSecondary }]}>
          Don't have an account?{' '}
          <Text style={{ color: colors.accent, fontWeight: '600' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmailForm = () => (
    <View style={styles.formContainer}>
      {mode === 'signup' && (
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <User color={colors.textMuted} size={20} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Mail color={colors.textMuted} size={20} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Email address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Lock color={colors.textMuted} size={20} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </View>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: colors.accent }]}
        onPress={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp}
        disabled={localLoading}
      >
        {localLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text style={[styles.switchText, { color: colors.textSecondary }]}>
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Sign up</Text>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Sign in</Text>
            </>
          )}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
            <BookOpen color="#FFFFFF" size={32} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {mode === 'options' ? 'Welcome' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'options'
              ? 'Sign in to sync your progress and access premium features'
              : mode === 'signin'
              ? 'Enter your email and password'
              : 'Fill in your details to get started'}
          </Text>
        </View>

        {mode === 'options' ? renderOptions() : renderEmailForm()}

        <Text style={[styles.termsText, { color: colors.textMuted }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginLeft: -8,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    height: 52,
    width: '100%',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    textAlign: 'center',
    fontSize: 15,
    marginTop: 8,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 32,
    lineHeight: 18,
  },
});
