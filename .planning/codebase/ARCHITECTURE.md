# Architecture

**Analysis Date:** 2026-01-18

## Pattern Overview

**Overall:** Client-Server with Dual Frontend (Mobile + Admin)

**Key Characteristics:**
- React Native mobile app with Expo Router for file-based routing
- React web admin panel with React Router for route management
- Firebase backend (Firestore + Cloud Functions) for data storage and push notifications
- Context-based state management with React Context API and Zustand
- Service layer pattern for business logic and external API calls

## Layers

**Mobile App - Presentation Layer:**
- Purpose: User-facing iOS app for reading Bible content and daily teachings
- Location: `/app`, `/components`
- Contains: Expo Router screens, React Native components, tab navigation
- Depends on: Contexts, Services, Constants
- Used by: End users (iOS only)

**Mobile App - Context Layer:**
- Purpose: Global state management for authentication, subscriptions, bookmarks, reading progress
- Location: `/contexts`
- Contains: React Context providers (Auth, Subscription, Bible, Bookmarks, Theme, ReadingProgress, CustomScriptures, Admin)
- Depends on: Services, Firebase config
- Used by: All screens and components via hooks

**Mobile App - Service Layer:**
- Purpose: Business logic and external API integration
- Location: `/services`
- Contains: Bible API client, notification scheduler, weekly content service, scriptures service
- Depends on: Firebase config
- Used by: Contexts and screens

**Admin Panel - Presentation Layer:**
- Purpose: Web interface for managing content, users, notifications
- Location: `/admin/src/pages`, `/admin/src/components`
- Contains: React Router pages, React components
- Depends on: Admin contexts, admin services
- Used by: Administrators via web browser

**Admin Panel - Service Layer:**
- Purpose: Claude AI integration, document processing
- Location: `/admin/src/services`
- Contains: Claude service for AI-powered snippet generation, document parser for PDF/DOCX
- Depends on: Firebase config, Anthropic SDK
- Used by: Admin pages

**Backend Layer:**
- Purpose: Cloud-based push notifications via Expo's API
- Location: `/admin/functions`
- Contains: Firebase Cloud Function for sending push notifications
- Depends on: Firebase Admin SDK, Expo push API
- Used by: Admin panel to send notifications

**Configuration Layer:**
- Purpose: Centralized Firebase initialization and environment configuration
- Location: `/config` (mobile), `/admin/src/config` (admin)
- Contains: Firebase app initialization with platform-specific auth persistence
- Depends on: Environment variables
- Used by: Services and contexts

## Data Flow

**Weekly Content Publication Flow:**

1. Admin uploads document (PDF/DOCX) via DocumentProcessor page
2. Document parser extracts text content
3. Claude AI service processes text and generates structured snippets with scripture references
4. Admin reviews/edits snippets via SnippetEditor component
5. Admin publishes to Firestore `weeklyContent/{weekId}` collection
6. Mobile app subscribes to latest weekly content via real-time listener
7. Mobile home screen displays today's snippets based on publish date

**Push Notification Flow:**

1. Mobile app registers push token with Expo on auth
2. Push token stored in Firestore `users/{userId}/pushToken`
3. Admin configures notification schedule in `adminSettings/notificationSchedule`
4. Mobile app schedules local notifications based on schedule and available snippets
5. Admin can send test notifications via Cloud Function `sendPushNotification`
6. Notification tap navigates to `/snippet/[id]` route

**Authentication Flow:**

1. User signs in via Apple/Google/Email on mobile login screen
2. Firebase Authentication creates/validates user
3. AuthContext saves user data to Firestore `users/{userId}`
4. User document includes `isPremium` flag for subscription status
5. SubscriptionContext monitors user's premium status via Firestore listener
6. Premium status gates notification features and content access

**State Management:**

- Local state: AsyncStorage for offline persistence (bookmarks, reading progress, theme)
- Remote state: Firestore with real-time listeners via onSnapshot
- Query caching: TanStack React Query for Bible chapter data (BibleContext)
- Form state: React useState within components

## Key Abstractions

**WeeklyContent:**
- Purpose: Represents a week's worth of teaching snippets
- Examples: `services/weeklyContentService.ts`
- Pattern: Service layer with subscription-based updates, helper functions for day-based slicing

**Snippet:**
- Purpose: Individual teaching unit with title, body, and scripture reference
- Examples: Used in `app/(tabs)/index.tsx`, `app/snippet/[id].tsx`
- Pattern: Typed interface, nested within WeeklyContent documents

**Context Providers:**
- Purpose: Encapsulate domain-specific state and operations
- Examples: `contexts/AuthContext.tsx`, `contexts/SubscriptionContext.tsx`, `contexts/BookmarksContext.tsx`
- Pattern: Custom hook pattern via `@nkzw/create-context-hook`, provider wraps app in `_layout.tsx`

**Bible Data:**
- Purpose: Static Bible book metadata and chapter structure
- Examples: `mocks/bibleData.ts`
- Pattern: Exported constants with TypeScript types, no API calls for structure

**Notification Scheduler:**
- Purpose: Manages local notification scheduling based on admin settings
- Examples: `services/notificationScheduler.ts`
- Pattern: Expo Notifications API wrapper, schedules based on snippet availability and user preferences

## Entry Points

**Mobile App:**
- Location: `app/_layout.tsx`
- Triggers: App launch via Expo
- Responsibilities: Initialize providers (QueryClient, Theme, Auth, Subscription, Bible, etc.), handle splash screen, deep link routing, notification tap handling

**Mobile Tab Navigation:**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: User navigates via bottom tabs
- Responsibilities: Define tab bar structure (Home, Read, Settings), configure tab icons and colors

**Admin Panel:**
- Location: `admin/src/main.tsx`
- Triggers: Browser navigation to hosted URL (https://bibt-49dc8.web.app/)
- Responsibilities: Mount React app, initialize AuthProvider, BrowserRouter

**Cloud Function:**
- Location: `admin/functions/index.js`
- Triggers: HTTPS callable function invoked from admin panel
- Responsibilities: Validate auth, send push notification via Expo API

## Error Handling

**Strategy:** Defensive programming with graceful degradation

**Patterns:**
- Firebase availability checks: `isFirebaseConfigured` flag prevents crashes when .env missing
- Try-catch blocks in all async operations with console.error logging
- Error state in contexts: `error` property exposed via hooks (e.g., AuthContext)
- Fallback UI: Loading states (`ActivityIndicator`), empty states (no content cards), error messages
- Optional chaining for nested data access (e.g., `snippet?.scripture?.reference`)

## Cross-Cutting Concerns

**Logging:** Console-based logging with prefixes (`[WeeklyContent]`, `[Auth]`, `[Layout]`) for debugging context flows

**Validation:**
- Firebase Auth validates credentials server-side
- TypeScript interfaces enforce data structure at compile time
- Firestore Security Rules enforce write permissions (admin only for content)

**Authentication:**
- Mobile: Firebase Auth with Apple Sign-In, Google OAuth, Email/Password
- Admin: Firebase Auth with email/password (protected routes via ProtectedRoute component)
- Session persistence: AsyncStorage on mobile, browser localStorage on web

---

*Architecture analysis: 2026-01-18*
