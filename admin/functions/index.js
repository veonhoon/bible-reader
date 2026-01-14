const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

// Send push notification via Expo
exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  // Verify the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send notifications'
    );
  }

  const { pushToken, title, body, snippetId } = data;

  if (!pushToken || !title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: pushToken, title, body'
    );
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title: title,
        body: body,
        data: {
          snippetId: snippetId || '',
          type: 'snippet',
        },
        sound: 'default',
        badge: 1,
      }),
    });

    const result = await response.json();
    console.log('Push notification result:', result);

    // Check for errors in the response
    if (result.data && result.data[0] && result.data[0].status === 'error') {
      throw new functions.https.HttpsError(
        'internal',
        result.data[0].message || 'Failed to send notification'
      );
    }

    return { success: true, result };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send notification'
    );
  }
});
