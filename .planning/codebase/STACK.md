# Technology Stack

**Analysis Date:** 2026-01-18

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code (mobile app, admin panel, cloud functions)
- JavaScript - Build configurations and Firebase Cloud Functions runtime

**Secondary:**
- Not applicable

## Runtime

**Environment:**
- Node.js 20 (Cloud Functions)
- React Native 0.81.5 (mobile app runtime)
- React 19.1.0 (mobile app)
- React 18.3.1 (admin panel)

**Package Manager:**
- npm (package-lock.json present in root, admin/, and admin/functions/)
- Lockfile: present

## Frameworks

**Core:**
- Expo 54.0.27 - React Native development framework for mobile app
- Expo Router 6.0.17 - File-based navigation for mobile app
- Vite 5.4.11 - Build tool and dev server for admin panel
- React Router DOM 6.28.0 - Client-side routing for admin panel

**Testing:**
- Not detected

**Build/Dev:**
- Vite 5.4.11 - Admin panel bundler
- Babel (babel-preset-expo) - JavaScript transpiler for mobile app
- Metro - React Native bundler (via Expo)
- TypeScript Compiler - Type checking
- EAS (Expo Application Services) - Mobile app build and deployment
- Tailwind CSS 3.4.15 - Utility-first CSS framework for admin panel
- PostCSS 8.4.49 - CSS processing for admin panel

## Key Dependencies

**Critical:**
- firebase 12.7.0 - Backend services (auth, database, hosting, functions)
- firebase-admin 12.0.0 - Server-side Firebase SDK for Cloud Functions
- firebase-functions 5.0.0 - Cloud Functions runtime
- @anthropic-ai/sdk 0.71.2 - Claude AI integration for document processing
- expo-notifications 0.32.15 - Push notifications for mobile app
- expo-apple-authentication 8.0.8 - Apple Sign In for iOS
- expo-auth-session 7.0.10 - OAuth flows (Google Sign In)

**Infrastructure:**
- @react-native-async-storage/async-storage 2.2.0 - Persistent storage for mobile app
- @tanstack/react-query 5.83.0 - Server state management for mobile app
- zustand 5.0.2 - Client state management for mobile app
- pdfjs-dist 5.4.530 - PDF parsing for document processing (admin panel)
- mammoth 1.11.0 - Word document parsing (admin panel)
- node-fetch 2.7.0 - HTTP requests in Cloud Functions
- lucide-react-native 0.475.0 - Icon library for mobile app
- lucide-react 0.475.0 - Icon library for admin panel

## Configuration

**Environment:**
- Mobile app: `.env` with `EXPO_PUBLIC_*` prefixed variables for Firebase config
- Admin panel: `.env` with `VITE_*` prefixed variables for Firebase and Claude API
- Cloud Functions: Configured via Firebase Console (no .env)
- Environment examples: `.env.example` files in root and `admin/`

**Build:**
- `tsconfig.json` - TypeScript config for mobile app (extends expo/tsconfig.base)
- `admin/tsconfig.json` - TypeScript config for admin panel
- `babel.config.js` - Babel config for mobile app (babel-preset-expo)
- `metro.config.js` - Metro bundler config for mobile app
- `admin/vite.config.ts` - Vite config for admin panel
- `admin/firebase.json` - Firebase Hosting and Functions config
- `eas.json` - Expo Application Services build config
- `app.json` - Expo app configuration
- `admin/tailwind.config.js` - Tailwind CSS config
- `admin/postcss.config.js` - PostCSS config
- `eslint.config.js` - ESLint config for mobile app

## Platform Requirements

**Development:**
- Node.js 20+ (for Cloud Functions development)
- npm
- Expo CLI (via npx expo)
- iOS development: macOS with Xcode (app is iOS-only)

**Production:**
- Firebase Hosting - Admin panel deployed to `https://bibt-49dc8.web.app/`
- Firebase Cloud Functions - Node.js 20 runtime
- Expo Application Services - Mobile app distribution
- iOS App Store - Mobile app deployment (bundle ID: com.deonveon.bibleteacher)

---

*Stack analysis: 2026-01-18*
