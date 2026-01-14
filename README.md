# Bible Teacher

A native iOS app for daily Bible teachings and spiritual growth.

## Tech Stack

- **React Native** with **Expo**
- **Expo Router** for navigation
- **Firebase** for backend (Firestore, Auth, Cloud Functions)
- **TypeScript**

## Features

- Daily Bible snippets and teachings
- AI-powered explanations using Claude
- Push notifications for daily reminders
- Apple Sign In authentication
- Admin panel for content management

## Development

```bash
# Install dependencies
bun install

# Start development server
bun start

# Run on iOS simulator
bun run ios
```

## Admin Panel

The admin panel is hosted at https://bibt-49dc8.web.app/

To deploy admin panel updates:
```bash
cd admin && npm run build && npx firebase-tools deploy --only hosting
```

## Project Structure

```
├── app/                    # App screens (Expo Router)
├── admin/                  # Admin panel (React)
├── services/               # Firebase and notification services
├── components/             # Reusable components
├── constants/              # App constants
└── assets/                 # Images and fonts
```
