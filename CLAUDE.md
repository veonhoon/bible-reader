# Project Notes for Claude

## Admin Panel
- **Live URL**: https://bibt-49dc8.web.app/
- **Firebase Project**: bibt-49dc8
- Hosted on Firebase Hosting
- To deploy: `cd admin && npm run build && npx firebase-tools deploy --only hosting`

## Firebase Structure
- `adminSettings/prompt` - editable Claude AI prompt
- `adminSettings/notificationSchedule` - {perDay, days, times}
- `adminSettings/testDevice` - push token for test notifications
- `weeklyContent/{weekId}` - {weekTitle, snippets[], snippetCount}

## Mobile App
- iOS only (Expo/React Native)
- User only has ON/OFF toggle for notifications
- Admin controls all notification scheduling

## Key Files
- Admin panel: `/admin/`
- Mobile services: `/services/weeklyContentService.ts`, `/services/notificationScheduler.ts`
- Snippet detail screen: `/app/snippet/[id].tsx`
