# Debugging Guide: Mobile App Content & Notifications

## Issues Being Debugged

1. **Published snippets not showing on mobile app front page**
2. **Notification taps not redirecting to snippet detail screen**

## What I've Added

I've added comprehensive logging throughout the app to help identify exactly where the issue is occurring. All logs are prefixed with the component name in brackets (e.g., `[WeeklyContent]`, `[HomeScreen]`, `[Notifications]`).

## How to Debug

### Step 1: Check if Content is Published

1. Open the **Admin Panel** at https://bibt-49dc8.web.app/
2. Log in with your admin credentials
3. Navigate to **"Weekly Content"** page
4. Verify that you have published content there
   - If you see "No content published yet", you need to publish content first:
     - Go to **"Process Doc"** page
     - Upload a document (PDF or DOCX)
     - Process it with Claude
     - Click **"Publish X Snippets"** button

### Step 2: Run the Mobile App and Check Logs

1. Start the app in development mode:
   ```bash
   npx expo start
   ```

2. Open the app on your device/simulator

3. Watch the Metro bundler console for logs

### Step 3: Analyze the Logs

Look for these key log sequences:

#### A. Content Loading (Home Screen)
```
[HomeScreen] Setting up weekly content subscription
[WeeklyContent] Subscribing to content...
[WeeklyContent] Firebase configured: true
[WeeklyContent] DB available: true
[WeeklyContent] Snapshot received, empty: false
[WeeklyContent] Content loaded: <WEEK_TITLE> with <N> snippets
[HomeScreen] Content update received: has data
[HomeScreen] Content details: { weekId, weekTitle, totalSnippets, publishedAt }
[HomeScreen] Today's snippets: <N> snippets
```

**If you see:**
- `Firebase configured: false` → Check your `.env` file has correct Firebase credentials
- `DB available: false` → Firebase initialization failed
- `Snapshot received, empty: true` → No content in Firestore (publish content in admin panel)
- `No content found` → Database query returned no results
- `Content update received: no data` → Query succeeded but returned null

#### B. Snippet Detail Screen
```
[SnippetDetail] Loading snippet with ID: <ID>
[WeeklyContent] getSnippetById called with ID: <ID>
[WeeklyContent] Searching for snippet in <N> snippets
[SnippetDetail] Snippet loaded successfully: <TITLE>
```

**If you see:**
- `Snippet not found` → The snippet ID doesn't match any published snippets
- `No content available` → No published content to search in

#### C. Notification Handling
```
[Notifications] Setting up notification handlers
[Notifications] Notification handlers set up successfully
```

When you tap a notification:
```
[Notifications] Notification tapped!
[Notifications] Response data: { snippetId: "...", weekId: "..." }
[Notifications] Navigating to snippet: <ID>
[SnippetDetail] Loading snippet with ID: <ID>
```

**If you see:**
- `No snippetId in notification data` → Notification was sent without snippet ID
- Nothing after tapping notification → Handler not firing (iOS permissions issue?)

## Common Issues & Solutions

### Issue 1: "No content yet" message on home screen

**Cause:** No published content in Firestore

**Solution:**
1. Go to admin panel → "Process Doc"
2. Upload and process a document
3. Click "Publish" button
4. Wait a few seconds for real-time sync
5. Check mobile app - content should appear immediately

### Issue 2: Content published but not showing on mobile

**Cause:** Firebase configuration mismatch or permissions

**Check:**
1. Verify `.env` file has correct Firebase project ID: `bibt-49dc8`
2. Check logs show `Firebase configured: true`
3. Verify Firestore rules allow read access (already correct in `admin/firestore.rules`)

### Issue 3: Notification taps don't navigate to snippet

**Possible causes:**

A. **Notification scheduled with wrong data structure**
   - Check `notificationScheduler.ts:272-282` - snippet data should include `snippetId`
   - The code looks correct, so this is unlikely

B. **iOS notification permissions not granted**
   - User must grant notification permissions
   - Check Settings → Bible Teacher → Notifications

C. **Snippet ID mismatch**
   - The ID in the notification doesn't match any published snippet
   - Check logs for "Snippet not found" message
   - Compare notification `snippetId` with published snippet IDs

### Issue 4: "Today's snippets: 0 snippets" even when content exists

**Cause:** The `publishedAt` date calculation is putting all snippets in future days

**Check:**
- Look at `publishedAt` in logs
- If it's in the future, the app thinks it's Day 0 and may show no snippets
- If published more than 7 days ago, it cycles back to Day 0-6

**Solution:**
- Re-publish content from admin panel (it will use current timestamp)

## Testing Notifications

### Manual Test

1. Ensure you have published content
2. Enable notifications in the app
3. Make yourself premium (if needed):
   - Admin panel → Users → Find your user → Set Premium
4. Trigger a test notification (modify `notificationScheduler.ts` to schedule one in 10 seconds)
5. Tap the notification
6. Check logs for navigation

### Verify Notification Data

Add temporary logging in `notificationScheduler.ts` after line 288:
```typescript
console.log('Scheduled notification with data:', {
  snippetId: snippet.id,
  weekId: content.weekId,
  title: snippet.title
});
```

## Firebase Console Checks

1. Open Firebase Console: https://console.firebase.google.com/project/bibt-49dc8
2. Go to Firestore Database
3. Check `weeklyContent` collection:
   - Should have at least one document
   - Each document should have `snippets` array
   - Each snippet should have `id`, `title`, `body`, etc.

4. Check `adminSettings/notificationSchedule`:
   - Should exist with `perDay`, `days`, `times` fields

## Next Steps

1. Run the app and collect the logs
2. Share the logs with me
3. I can pinpoint the exact issue based on what's logged
4. We can fix the specific problem

## Quick Wins to Try First

1. **Re-publish content** from admin panel (use latest timestamp)
2. **Clear app data** and restart (Settings → Apps → Bible Teacher → Clear Data)
3. **Check Firebase rules are deployed**:
   ```bash
   cd admin
   npx firebase-tools deploy --only firestore:rules
   ```

---

**Note:** The logging I added is comprehensive and will show exactly where the problem is. Run the app, reproduce the issue, and check the console output against the patterns above.
