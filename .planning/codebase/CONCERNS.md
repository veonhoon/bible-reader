# Codebase Concerns

**Analysis Date:** 2026-01-18

## Tech Debt

**Console.log Overuse:**
- Issue: 256 console.log/warn/error statements throughout the codebase without structured logging
- Files: Widespread across all contexts, services, and components
- Impact: No production logging strategy, difficult to debug production issues, logs expose sensitive data
- Fix approach: Implement structured logging library (e.g., react-native-logs), add log levels, sanitize sensitive data

**No Testing Infrastructure:**
- Issue: Zero test files in source code (only node_modules contain tests)
- Files: Entire codebase
- Impact: No safety net for refactoring, high risk of regressions, can't verify critical flows
- Fix approach: Add Jest/React Native Testing Library, start with critical paths (auth, notifications, payments)

**Deprecated Admin Panel in Mobile App:**
- Issue: Full admin panel implemented in mobile app (`/Users/deon/Desktop/calm-bible-reader/app/admin.tsx`, 795 lines)
- Files: `/Users/deon/Desktop/calm-bible-reader/app/admin.tsx`
- Impact: Duplicate code with web admin, increases bundle size, maintenance burden
- Fix approach: Remove mobile admin panel, use web admin only (already deployed at bibt-49dc8.web.app)

**Legacy Custom Scriptures System:**
- Issue: Custom scriptures context and features appear unused with new snippet-based system
- Files: `/Users/deon/Desktop/calm-bible-reader/contexts/CustomScripturesContext.tsx` (287 lines), `/Users/deon/Desktop/calm-bible-reader/app/import-scriptures.tsx` (390 lines)
- Impact: Dead code bloat, confusion about which system to use
- Fix approach: Audit usage, remove if snippet system fully replaced it

## Known Bugs

**OAuth Sign-In Broken in Development:**
- Symptoms: Google/Apple sign-in fail with error "requires development build"
- Files: `/Users/deon/Desktop/calm-bible-reader/contexts/AuthContext.tsx` (lines 202-205, 224)
- Trigger: Using Expo Go instead of development build
- Workaround: Use email sign-in or create dev build with expo-dev-client

**Firebase Initialization Race Condition:**
- Symptoms: Potential double initialization of Firebase Auth
- Files: `/Users/deon/Desktop/calm-bible-reader/config/firebase.ts` (lines 41-53)
- Trigger: Complex initialization logic checking getApps().length twice
- Workaround: Currently handled with try/catch, but fragile
- Fix approach: Simplify to single initialization path

**Scripture Reference Parsing Fragility:**
- Symptoms: Fails on non-standard reference formats
- Files: `/Users/deon/Desktop/calm-bible-reader/app/snippet/[id].tsx` (lines 25-48)
- Trigger: References like "Psalms 23" vs "Psalm 23", multi-chapter ranges
- Current mitigation: Regex matching with normalization
- Fix approach: Use a proper reference parsing library or normalize all references at input

## Security Considerations

**Environment Variables Exposure:**
- Risk: Firebase config exposed in client bundle
- Files: `/Users/deon/Desktop/calm-bible-reader/config/firebase.ts`, `/Users/deon/Desktop/calm-bible-reader/.env`
- Current mitigation: Firebase security rules (assumed), EXPO_PUBLIC_ prefix intentional
- Recommendations: Audit Firestore security rules, ensure sensitive operations use Cloud Functions

**No Input Validation:**
- Risk: User-provided data (scriptures, references) stored without validation
- Files: `/Users/deon/Desktop/calm-bible-reader/services/scripturesService.ts`, `/Users/deon/Desktop/calm-bible-reader/admin/src/components/SnippetEditor.tsx`
- Current mitigation: None detected
- Recommendations: Add Zod or Yup validation schemas, sanitize HTML/markdown input

**Admin Access Control:**
- Risk: Admin status checked client-side only
- Files: `/Users/deon/Desktop/calm-bible-reader/contexts/AdminContext.tsx`
- Current mitigation: Simple password check in AsyncStorage
- Recommendations: Move admin operations to Cloud Functions with proper auth checks

**Push Token Storage:**
- Risk: Push tokens stored in Firestore without user consent tracking
- Files: `/Users/deon/Desktop/calm-bible-reader/services/notificationScheduler.ts` (lines 340-365)
- Current mitigation: User must enable notifications
- Recommendations: Add explicit consent UI, allow token deletion

## Performance Bottlenecks

**Notification Scheduling Complexity:**
- Problem: Schedules 2 weeks of notifications in single synchronous operation
- Files: `/Users/deon/Desktop/calm-bible-reader/services/notificationScheduler.ts` (lines 198-305)
- Cause: Nested loops (weeks × days × times × snippets), Firebase reads for every schedule
- Improvement path: Move to background task, batch Firebase reads, reduce scheduling window to 1 week

**Bible Chapter Caching:**
- Problem: Each chapter cached separately, no prefetching
- Files: `/Users/deon/Desktop/calm-bible-reader/services/bibleApi.ts` (lines 103-191)
- Cause: Individual chapter fetches, 30-day expiry
- Improvement path: Prefetch next chapter, batch download for offline mode, compress cached data

**Large Admin Screen:**
- Problem: 795-line component with multiple responsibilities
- Files: `/Users/deon/Desktop/calm-bible-reader/app/admin.tsx`
- Cause: Scripture import, notification scheduling, user management in one file
- Improvement path: Split into separate screens/components, use React Query for data fetching

**No Code Splitting:**
- Problem: All code bundled together
- Files: Entire mobile app
- Cause: React Native limitation, no dynamic imports used
- Improvement path: Use React.lazy where possible, remove unused features (admin panel)

## Fragile Areas

**Premium Status Logic:**
- Files: `/Users/deon/Desktop/calm-bible-reader/contexts/SubscriptionContext.tsx` (lines 120-125), `/Users/deon/Desktop/calm-bible-reader/services/notificationScheduler.ts` (lines 36-67)
- Why fragile: Premium status sourced from 3 places (local subscription, Firestore isPremium, trial)
- Safe modification: Always test all 3 paths, use SubscriptionContext.isSubscribed abstraction
- Test coverage: None

**Notification Scheduling:**
- Files: `/Users/deon/Desktop/calm-bible-reader/services/notificationScheduler.ts`
- Why fragile: Complex scheduling logic, timezone assumptions, quiet hours, snippet rotation
- Safe modification: Never modify without testing on real device, verify snippet index rotation
- Test coverage: None

**Firebase Conditional Initialization:**
- Files: `/Users/deon/Desktop/calm-bible-reader/config/firebase.ts`, all files checking `isFirebaseConfigured`
- Why fragile: Many null checks, app should work offline or without Firebase
- Safe modification: Always check `isFirebaseConfigured` before using `db` or `auth`
- Test coverage: None

**Scripture Reference Parsing:**
- Files: `/Users/deon/Desktop/calm-bible-reader/app/snippet/[id].tsx` (lines 25-48)
- Why fragile: Regex-based parsing, special case for Psalms
- Safe modification: Add test cases before changing regex
- Test coverage: None

## Scaling Limits

**AsyncStorage for Large Data:**
- Current capacity: AsyncStorage used for Bible chapter cache (could be hundreds of chapters × ~5KB each)
- Limit: AsyncStorage has ~6MB limit on iOS, performance degrades with many keys
- Scaling path: Migrate to SQLite (expo-sqlite) or WatermelonDB for structured data

**Weekly Content Snippet Count:**
- Current capacity: All snippets for a week loaded into memory at once
- Limit: Performance degrades if week has >100 snippets
- Scaling path: Paginate snippet loading, load on-demand

**Notification Limit:**
- Current capacity: Scheduling 2 weeks × up to 7 days × multiple times per day
- Limit: iOS/Android limit scheduled notifications to 64
- Scaling path: Already partially addressed by 2-week window, reduce perDay or use background fetch

## Dependencies at Risk

**Firebase v12 on React Native:**
- Risk: Firebase JS SDK not optimized for React Native, large bundle size
- Impact: ~500KB+ added to bundle, slower cold starts
- Migration plan: Consider React Native Firebase (@react-native-firebase) for better performance

**React 19 + Expo SDK 54:**
- Risk: React 19 in alpha compatibility mode (legacy-peer-deps in .npmrc)
- Impact: Potential runtime issues with concurrent rendering
- Migration plan: Wait for Expo SDK with official React 19 support

**Expo Router 6:**
- Risk: Still evolving API, breaking changes between minors
- Impact: Navigation refactors on upgrades
- Migration plan: Pin version, test thoroughly before upgrading

## Missing Critical Features

**Error Boundary:**
- Problem: No error boundaries to catch React errors
- Blocks: Production crash reporting, graceful failure
- Priority: High

**Offline Support:**
- Problem: No offline queue for failed writes (bookmarks, progress)
- Blocks: Unreliable experience on poor network
- Priority: Medium

**Analytics:**
- Problem: No usage tracking or error monitoring
- Blocks: Can't measure engagement or identify issues
- Priority: Medium

**Rate Limiting:**
- Problem: No rate limiting on Bible API calls
- Blocks: Could hit API limits or cause abuse
- Priority: Low

## Test Coverage Gaps

**Authentication Flow:**
- What's not tested: Email/Google/Apple sign-in, token refresh, logout
- Files: `/Users/deon/Desktop/calm-bible-reader/contexts/AuthContext.tsx`
- Risk: Auth bugs only discovered in production
- Priority: High

**Notification Scheduling:**
- What's not tested: Quiet hours logic, snippet rotation, timezone handling, premium gating
- Files: `/Users/deon/Desktop/calm-bible-reader/services/notificationScheduler.ts`
- Risk: Users don't receive notifications or get wrong content
- Priority: High

**Subscription/Premium Logic:**
- What's not tested: Trial start/expiry, subscription purchase, premium status checks
- Files: `/Users/deon/Desktop/calm-bible-reader/contexts/SubscriptionContext.tsx`
- Risk: Paywall broken or premium users blocked
- Priority: High

**Bible API Integration:**
- What's not tested: Chapter fetching, caching, HTML stripping, error handling
- Files: `/Users/deon/Desktop/calm-bible-reader/services/bibleApi.ts`
- Risk: Bible content missing or malformed
- Priority: Medium

**Scripture Reference Parsing:**
- What's not tested: All reference formats, edge cases
- Files: `/Users/deon/Desktop/calm-bible-reader/app/snippet/[id].tsx`
- Risk: Links to wrong chapter or fail to parse
- Priority: Medium

---

*Concerns audit: 2026-01-18*
