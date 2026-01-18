# Codebase Structure

**Analysis Date:** 2026-01-18

## Directory Layout

```
calm-bible-reader/
├── admin/                  # Web admin panel (React + Vite)
│   ├── functions/          # Firebase Cloud Functions
│   ├── src/                # Admin source code
│   └── dist/               # Built admin assets
├── app/                    # Mobile app screens (Expo Router)
│   ├── (tabs)/             # Tab navigation screens
│   └── snippet/            # Dynamic snippet detail routes
├── assets/                 # Static assets (images)
├── components/             # Shared React Native components
├── config/                 # Firebase configuration (mobile)
├── constants/              # App constants (colors, themes)
├── contexts/               # React Context providers (mobile)
├── mocks/                  # Static data (Bible book structure)
├── services/               # Business logic services (mobile)
├── .planning/              # GSD planning documents
│   └── codebase/           # Codebase analysis documents
├── app.json                # Expo configuration
├── package.json            # Mobile app dependencies
├── tsconfig.json           # TypeScript config (mobile)
└── CLAUDE.md               # Project documentation
```

## Directory Purposes

**`/admin`:**
- Purpose: Web-based admin panel for content management
- Contains: Vite/React app, Firebase hosting config, Cloud Functions
- Key files: `src/main.tsx` (entry), `src/App.tsx` (routing), `firebase.json` (hosting config)

**`/admin/functions`:**
- Purpose: Firebase Cloud Functions for backend operations
- Contains: Node.js function definitions
- Key files: `index.js` (push notification function)

**`/admin/src/pages`:**
- Purpose: Admin panel page components
- Contains: Dashboard, WeeklyContent, DocumentProcessor, PromptSettings, NotificationSettings, Users, Settings, Login
- Key files: `DocumentProcessor.tsx` (AI snippet generation), `WeeklyContent.tsx` (content management)

**`/admin/src/services`:**
- Purpose: Admin-specific business logic
- Contains: Claude AI integration, document parsing
- Key files: `claudeService.ts` (Anthropic API client), `documentParser.ts` (PDF/DOCX extraction)

**`/admin/src/components`:**
- Purpose: Reusable admin UI components
- Contains: Layout, ProtectedRoute, SnippetEditor
- Key files: `Layout.tsx` (nav wrapper), `SnippetEditor.tsx` (snippet editing UI)

**`/app`:**
- Purpose: File-based routing screens for mobile app (Expo Router)
- Contains: Route components, modal screens, tab screens
- Key files: `_layout.tsx` (root layout with providers), `login.tsx`, `reader.tsx`, `admin.tsx`

**`/app/(tabs)`:**
- Purpose: Bottom tab navigation screens
- Contains: Home (index), Read, Settings, Bookmarks (hidden)
- Key files: `_layout.tsx` (tab config), `index.tsx` (home/weekly content), `read.tsx` (Bible browser)

**`/app/snippet`:**
- Purpose: Dynamic route for snippet detail view
- Contains: Single file dynamic route
- Key files: `[id].tsx` (snippet detail screen with scripture navigation)

**`/components`:**
- Purpose: Shared React Native components
- Contains: Reusable UI elements
- Key files: `Paywall.tsx` (subscription modal)

**`/config`:**
- Purpose: Shared configuration (mobile app)
- Contains: Firebase initialization with platform-specific auth persistence
- Key files: `firebase.ts` (Firebase setup with AsyncStorage)

**`/constants`:**
- Purpose: App-wide constants
- Contains: Theme definitions, color schemes
- Key files: `colors.ts` (ThemeColors, ThemeMode definitions)

**`/contexts`:**
- Purpose: Global state management for mobile app
- Contains: React Context providers for auth, subscription, Bible data, bookmarks, reading progress, theme, custom scriptures, admin
- Key files: `AuthContext.tsx`, `SubscriptionContext.tsx`, `BibleContext.tsx`, `BookmarksContext.tsx`, `ReadingProgressContext.tsx`, `ThemeContext.tsx`, `CustomScripturesContext.tsx`, `AdminContext.tsx`

**`/mocks`:**
- Purpose: Static reference data
- Contains: Bible book metadata (66 books with names, chapters)
- Key files: `bibleData.ts` (BIBLE_BOOKS array, interfaces)

**`/services`:**
- Purpose: Business logic and external API integration (mobile)
- Contains: Bible API client, notification scheduling, weekly content, scriptures
- Key files: `bibleApi.ts`, `notificationScheduler.ts`, `weeklyContentService.ts`, `scripturesService.ts`

**`.planning/codebase/`:**
- Purpose: GSD codebase mapping documents
- Contains: Architecture, structure, stack, testing, conventions, concerns docs
- Generated: Yes (by GSD agents)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Mobile app root with provider nesting
- `app/(tabs)/_layout.tsx`: Tab navigation configuration
- `admin/src/main.tsx`: Admin panel entry point

**Configuration:**
- `app.json`: Expo config (bundle ID, plugins, permissions)
- `package.json`: Mobile dependencies (Expo, Firebase, React Native)
- `admin/package.json`: Admin dependencies (React, Vite, Anthropic SDK)
- `config/firebase.ts`: Mobile Firebase initialization
- `admin/src/config/firebase.ts`: Admin Firebase initialization
- `.env`: Environment variables (mobile, not committed)
- `admin/.env`: Environment variables (admin, not committed)
- `firebase.json`: Firebase hosting/functions config
- `firestore.rules`: Firestore security rules
- `firestore.indexes.json`: Firestore composite indexes

**Core Logic:**
- `services/weeklyContentService.ts`: Weekly content data access and day-based slicing
- `services/notificationScheduler.ts`: Push notification scheduling logic
- `contexts/AuthContext.tsx`: Authentication flow (Apple, Google, Email)
- `contexts/SubscriptionContext.tsx`: Premium subscription state
- `admin/src/services/claudeService.ts`: AI snippet generation

**Testing:**
- Not detected (no test files found)

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `Paywall.tsx`, `SnippetEditor.tsx`)
- Services: camelCase (e.g., `bibleApi.ts`, `weeklyContentService.ts`)
- Contexts: PascalCase with "Context" suffix (e.g., `AuthContext.tsx`)
- Screens: kebab-case or descriptive (e.g., `reader.tsx`, `notification-settings.tsx`, `[id].tsx`)

**Directories:**
- Lowercase with hyphens for special Expo Router syntax (e.g., `(tabs)`, `snippet`)
- camelCase for standard directories (e.g., `components`, `contexts`, `services`)

## Where to Add New Code

**New Mobile Screen:**
- Primary code: `app/{screen-name}.tsx` (modal/card) or `app/(tabs)/{screen-name}.tsx` (tab)
- Register in: `app/_layout.tsx` (add Stack.Screen) or `app/(tabs)/_layout.tsx` (add Tabs.Screen)
- Tests: Not applicable (no test setup)

**New Service/Business Logic:**
- Implementation: `services/{feature-name}Service.ts` (mobile) or `admin/src/services/{feature}Service.ts` (admin)
- Import in: Contexts or screens that need the functionality

**New Context Provider:**
- Implementation: `contexts/{Feature}Context.tsx`
- Register in: `app/_layout.tsx` (add provider wrapper in nesting order)
- Hook export: Use `createContextHook` pattern for type-safe hooks

**New Admin Page:**
- Implementation: `admin/src/pages/{PageName}.tsx`
- Register in: `admin/src/App.tsx` (add Route with ProtectedRoute wrapper)
- Navigation: Add link in `admin/src/components/Layout.tsx`

**New Cloud Function:**
- Implementation: Add export to `admin/functions/index.js`
- Deploy: `cd admin && npx firebase-tools deploy --only functions`

**Utilities:**
- Shared helpers: Add to relevant service file or create new service
- Mobile constants: `constants/{name}.ts`
- Admin utilities: `admin/src/services/{name}.ts`

## Special Directories

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignore)

**`.expo/`:**
- Purpose: Expo build cache and settings
- Generated: Yes (expo start)
- Committed: No (.gitignore)

**`admin/dist/`:**
- Purpose: Built admin panel for Firebase hosting
- Generated: Yes (npm run build)
- Committed: No (.gitignore)

**`admin/.firebase/`:**
- Purpose: Firebase CLI cache
- Generated: Yes (firebase deploy)
- Committed: No (.gitignore)

**`.git/`:**
- Purpose: Git version control
- Generated: Yes (git init)
- Committed: No (internal Git structure)

**`.claude/`:**
- Purpose: Claude Code SDK configuration
- Generated: Yes (Claude Code project setup)
- Committed: Yes (project-specific agents and commands)

**`get-shit-done/`:**
- Purpose: Untracked GSD workflow directory (appears to be nested git repo)
- Generated: Manual
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-01-18*
