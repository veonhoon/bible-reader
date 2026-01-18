# External Integrations

**Analysis Date:** 2026-01-18

## APIs & External Services

**AI/ML:**
- Anthropic Claude API - Document analysis and snippet generation
  - SDK/Client: `@anthropic-ai/sdk` 0.71.2
  - Auth: `VITE_CLAUDE_API_KEY`
  - Model: claude-sonnet-4-20250514
  - Used in: `admin/src/services/claudeService.ts`
  - Purpose: Analyze uploaded documents (PDF, Word) and extract Bible study snippets

**Push Notifications:**
- Expo Push Notification Service - Send push notifications to mobile devices
  - Endpoint: `https://exp.host/--/api/v2/push/send`
  - Auth: Push tokens (no API key required)
  - Used in: `admin/functions/index.js` (sendPushNotification Cloud Function)
  - Purpose: Deliver scheduled Bible snippet notifications to users

## Data Storage

**Databases:**
- Firebase Firestore - NoSQL document database
  - Connection: Firebase SDK with config from env vars
  - Client: Firebase SDK (firebase/firestore)
  - Used in: All app layers (mobile, admin, functions)
  - Collections:
    - `adminSettings/prompt` - Editable Claude AI prompt
    - `adminSettings/notificationSchedule` - Notification scheduling config
    - `adminSettings/testDevice` - Test device push token
    - `weeklyContent/{weekId}` - Weekly Bible snippets
    - `users/{userId}` - User profiles and preferences
    - `scriptures/*` - Bible text content
    - `customScriptures/*` - User-imported scripture collections

**File Storage:**
- Not used (documents processed in-memory)

**Caching:**
- AsyncStorage - React Native persistent storage for mobile app
  - Used for: Auth state, user preferences, offline data
  - Location: `@react-native-async-storage/async-storage`

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication - Multi-provider auth
  - Implementation: Firebase Auth SDK
  - Providers:
    - Apple Sign In (via `expo-apple-authentication`)
    - Google Sign In (via `expo-auth-session` OAuth)
    - Email/Password (optional, if enabled)
  - Mobile config: `config/firebase.ts`
  - Admin config: `admin/src/config/firebase.ts`
  - Auth context: `contexts/AuthContext.tsx`

## Monitoring & Observability

**Error Tracking:**
- None (console logging only)

**Logs:**
- Console logs in development
- Firebase Cloud Functions logs in production

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting - Admin panel
  - Live URL: `https://bibt-49dc8.web.app/`
  - Project: bibt-49dc8
  - Deploy command: `cd admin && npm run build && npx firebase-tools deploy --only hosting`

**CI Pipeline:**
- None (manual deployments)

**Mobile App Distribution:**
- Expo Application Services (EAS)
  - Project ID: 9bd32cad-5ea1-4e8c-ad2b-3d9302939bbe
  - Owner: deonveon
  - OTA Updates: `https://u.expo.dev/9bd32cad-5ea1-4e8c-ad2b-3d9302939bbe`
  - Deep linking: `bible-teacher://` and `https://bibleteacher.app/`

## Environment Configuration

**Required env vars:**

Mobile app (`.env`):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Admin panel (`admin/.env`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLAUDE_API_KEY`

Cloud Functions:
- Configured via Firebase Console (service account, etc.)

**Secrets location:**
- Local development: `.env` files (gitignored)
- Production: Firebase Console environment config

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- OAuth callbacks for Google/Apple Sign In (handled by Firebase Auth and Expo)
- Deep linking callbacks: `bible-teacher://` scheme and `https://bibleteacher.app/` origin

## Security Considerations

**Firebase Security:**
- Firestore security rules: `admin/firestore.rules`
- Authentication required for most operations
- Cloud Functions validate auth context before execution

**API Key Exposure:**
- Claude API key exposed in browser (admin panel only)
- Acceptable risk: admin panel is access-controlled via Firebase Auth
- Note in code: `admin/src/services/claudeService.ts` line 2

**Client-Side Firebase Config:**
- Firebase config in client code is expected (public API keys)
- Security enforced via Firestore rules, not config secrecy

---

*Integration audit: 2026-01-18*
