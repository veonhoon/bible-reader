# Coding Conventions

**Analysis Date:** 2026-01-18

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Paywall.tsx`, `ThemeContext.tsx`)
- Services: camelCase (e.g., `bibleApi.ts`, `weeklyContentService.ts`, `notificationScheduler.ts`)
- Contexts: PascalCase with "Context" suffix (e.g., `BibleContext.tsx`, `AuthContext.tsx`)
- Routes: kebab-case for screens (e.g., `daily-scripture.tsx`, `import-scriptures.tsx`)
- Tab routes: lowercase (e.g., `index.tsx`, `settings.tsx`, `read.tsx`)
- Configuration: lowercase (e.g., `firebase.ts`, `colors.ts`)

**Functions:**
- Exported functions: camelCase (e.g., `fetchChapter`, `getTodaysSnippets`, `getDailyProgress`)
- React hooks: camelCase with "use" prefix (e.g., `useTheme`, `useBible`, `useChapter`)
- Event handlers: camelCase with "handle" prefix (e.g., `handleNotificationToggle`, `handleSubscribe`)
- Helper functions: camelCase (e.g., `stripHtml`, `formatWeekDate`, `getDaysSincePublish`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `BIBLE_VERSION`, `CACHE_PREFIX`, `CACHE_EXPIRY_DAYS`)
- Component constants: UPPER_SNAKE_CASE (e.g., `FEATURES`, `BOOK_NUMBER_MAP`, `THEME_STORAGE_KEY`)
- State variables: camelCase (e.g., `isLoading`, `notificationsOn`, `selectedPlan`)
- Props: camelCase (e.g., `bookId`, `snippetId`, `visible`, `onClose`)

**Types:**
- Interfaces: PascalCase (e.g., `BibleContextValue`, `PaywallProps`, `NotificationSchedule`)
- Type aliases: PascalCase (e.g., `ThemeMode`, `ThemeColorScheme`, `SubscriptionPlan`)
- Exported types: Always use `export interface` or `export type`

## Code Style

**Formatting:**
- Tool used: Built-in Expo/ESLint defaults (no Prettier config detected)
- Indentation: 2 spaces
- Quotes: Single quotes for strings, double quotes in JSX attributes
- Semicolons: Required at end of statements
- Trailing commas: Used in objects, arrays, and parameters

**Linting:**
- Tool: ESLint with `eslint-config-expo` (flat config format)
- Config file: `eslint.config.js`
- Ignores: `dist/*` directory
- Run command: `npm run lint`

**TypeScript:**
- Strict mode: Enabled in `tsconfig.json`
- Path alias: `@/*` maps to project root
- Extends: `expo/tsconfig.base`

## Import Organization

**Order:**
1. External libraries (React, React Native core)
2. Third-party dependencies (Expo modules, Firebase, routing)
3. Icons (lucide-react-native)
4. Context imports (from `@/contexts/`)
5. Service imports (from `@/services/`)
6. Component imports (from `@/components/`)
7. Type imports (from `@/mocks/` or co-located)
8. Constants (from `@/constants/`)

**Example from `/app/(tabs)/index.tsx`:**
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, Clock, Bell } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { WeeklyContent, subscribeToLatestWeeklyContent } from '@/services/weeklyContentService';
```

**Path Aliases:**
- `@/*` for all imports from project root
- Always use alias imports, never relative paths across directories

## Error Handling

**Patterns:**
- Try-catch blocks in async service functions
- Console error logging for caught exceptions
- Return null or fallback values on error (e.g., `return null;` in services)
- Silent error handling with console logs (no user-facing error UI in most places)

**Example from `/services/bibleApi.ts`:**
```typescript
try {
  const cached = await AsyncStorage.getItem(cacheKey);
  // ... use cached data
} catch (error) {
  console.log('[BibleAPI] Cache read error:', error);
}
```

**Example from `/services/weeklyContentService.ts`:**
```typescript
try {
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return docToWeeklyContent(snapshot.docs[0]);
} catch (error) {
  console.error('Error fetching latest weekly content:', error);
  return null;
}
```

## Logging

**Framework:** Native `console`

**Patterns:**
- Prefix logs with component/service identifier in brackets: `[BibleAPI]`, `[WeeklyContent]`, `[Layout]`
- Use `console.log` for informational messages (cache hits, data loaded)
- Use `console.error` for errors and failures
- Use `console.warn` for warnings (e.g., Firebase not configured)
- Include context in log messages (e.g., book name, chapter number, verse count)

**Example patterns:**
```typescript
console.log(`[BibleAPI] Fetching chapter: ${bookId} ${chapter}`);
console.log(`[BibleAPI] Cached chapter: ${bookId} ${chapter} (${verses.length} verses)`);
console.error('[BibleAPI] API Error:', response.status, errorText);
console.warn('[WeeklyContent] Firebase not configured, returning null');
```

## Comments

**When to Comment:**
- Complex business logic (e.g., day calculation in `getDaysSincePublish`)
- Non-obvious behavior (e.g., "Track if we've already handled initial notification")
- Sections within components (e.g., `// Format date for display`, `// Load content and notification settings`)
- Configuration explanations (e.g., `// No-op unsubscribe function for when Firebase is not configured`)

**JSDoc/TSDoc:**
- Not extensively used
- Type information primarily in TypeScript interfaces
- No function-level documentation comments

**Inline comments:**
- Use `//` for single-line comments
- Explain "why" not "what" (code is self-documenting)
- Keep comments close to relevant code

## Function Design

**Size:**
- Components: 200-500 lines including styles (e.g., `index.tsx` 512 lines, `Paywall.tsx` 376 lines)
- Service functions: 20-50 lines per function
- Helper functions: 5-15 lines

**Parameters:**
- Use destructured props for React components
- Explicit typed parameters for service functions
- Optional parameters placed last

**Return Values:**
- Explicit return types on exported functions
- React components return JSX.Element (implicit)
- Service functions return Promise<T | null> for nullable data
- Helper functions return primitive types or interfaces

## Module Design

**Exports:**
- Named exports for services (e.g., `export async function fetchChapter`)
- Default exports for React components and screens
- Export interfaces alongside functions that use them
- Context hooks exported from context files (e.g., `export const [ThemeProvider, useTheme]`)

**Barrel Files:**
- Not used
- Direct imports from specific files

**File Organization:**
- One main component per file
- Co-located StyleSheet.create at bottom of component files
- Interfaces and types at top of service files
- Helper functions before main exported functions

## React Patterns

**State Management:**
- Context API for global state (`@nkzw/create-context-hook` library)
- Local useState for component-specific state
- React Query (@tanstack/react-query) for server state caching

**Context Pattern:**
```typescript
export const [ProviderName, useHookName] = createContextHook<ValueType>(() => {
  // Hook logic here
  return { /* exported values */ };
});
```

**Styling:**
- StyleSheet.create for all styles (no inline styles except dynamic values)
- Styles object at bottom of file
- Theme colors accessed via `useTheme()` hook
- Typed style properties (e.g., `fontWeight: '700' as const`)

**Component Structure:**
1. Imports
2. Type definitions (interfaces for props)
3. Constants (if any)
4. Component function
5. StyleSheet.create

---

*Convention analysis: 2026-01-18*
