import { useState, useEffect } from 'react';
import {
  Bell,
  Loader2,
  CheckCircle,
  AlertCircle,
  Send,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import Layout from '../components/Layout';

interface Snippet {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  snippet: string;
  scripture: {
    reference: string;
    text: string;
  };
}

interface WeeklyContent {
  id: string;
  weekTitle: string;
  snippets: Snippet[];
}

interface TestDevice {
  pushToken: string;
  platform: string;
  registeredAt: any;
}

export default function NotificationSettings() {
  const [device, setDevice] = useState<TestDevice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastSentSnippet, setLastSentSnippet] = useState<Snippet | null>(null);

  // Listen for device registration in real-time
  useEffect(() => {
    const docRef = doc(db, 'adminSettings', 'testDevice');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setDevice(docSnap.data() as TestDevice);
      } else {
        setDevice(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to device:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get random snippet from latest content
  const getRandomSnippet = async (): Promise<Snippet | null> => {
    try {
      const q = query(
        collection(db, 'weeklyContent'),
        orderBy('publishedAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const content = snapshot.docs[0].data() as WeeklyContent;
      if (!content.snippets || content.snippets.length === 0) {
        return null;
      }

      // Pick random snippet
      const randomIndex = Math.floor(Math.random() * content.snippets.length);
      return content.snippets[randomIndex];
    } catch (error) {
      console.error('Error fetching snippet:', error);
      return null;
    }
  };

  // Send test notification
  const handleSendTestNotification = async () => {
    if (!device?.pushToken) {
      setStatus({ type: 'error', message: 'No device registered. Open the mobile app first.' });
      return;
    }

    setIsSending(true);
    setStatus(null);
    setLastSentSnippet(null);

    try {
      console.log('[Notification] Starting to send test notification');
      console.log('[Notification] Push token:', device.pushToken);

      // Get random snippet
      const snippet = await getRandomSnippet();
      console.log('[Notification] Got snippet:', snippet?.title);

      if (!snippet) {
        setStatus({ type: 'error', message: 'No snippets found. Please publish some content first.' });
        setIsSending(false);
        return;
      }

      console.log('[Notification] Sending via Cloud Function...');

      // Send notification via Firebase Cloud Function (avoids CORS)
      const sendPushNotification = httpsCallable(functions, 'sendPushNotification');
      const result = await sendPushNotification({
        pushToken: device.pushToken,
        title: snippet.title,
        body: snippet.body,
        snippetId: snippet.id,
      });

      console.log('Push notification result:', result.data);
      setLastSentSnippet(snippet);
      setStatus({ type: 'success', message: 'Test notification sent!' });
    } catch (error: any) {
      console.error('Error sending notification:', error);
      const errorMessage = error?.message || String(error);
      setStatus({ type: 'error', message: `Failed: ${errorMessage}` });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Test Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            Send test notifications to your device
          </p>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            {status.message}
          </div>
        )}

        {/* Device Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <Smartphone className="w-5 h-5" />
              <h2 className="font-semibold">Test Device</h2>
            </div>
            {device && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>

          {device ? (
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-gray-500">Push Token</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {device.pushToken}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Platform: <strong className="text-gray-700">{device.platform}</strong></span>
                <span>Registered: <strong className="text-gray-700">{formatDate(device.registeredAt)}</strong></span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No device registered</p>
              <p className="text-sm text-gray-400 mt-1">
                Open the mobile app to automatically register your device
              </p>
            </div>
          )}
        </div>

        {/* Test Notification Button */}
        <button
          onClick={handleSendTestNotification}
          disabled={isSending || !device?.pushToken}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isSending ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              Test Notification
            </>
          )}
        </button>

        {!device?.pushToken && (
          <p className="text-sm text-center text-gray-400">
            Open the mobile app to register your device
          </p>
        )}

        {/* Last Sent Snippet */}
        {lastSentSnippet && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Last Sent Snippet</h3>
            <p className="font-semibold text-gray-900">{lastSentSnippet.title}</p>
            <p className="text-sm text-gray-600">{lastSentSnippet.body}</p>
            {lastSentSnippet.scripture && (
              <p className="text-xs text-primary">
                {lastSentSnippet.scripture.reference}
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
