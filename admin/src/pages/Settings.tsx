import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from '../components/Layout';
import { Save, RefreshCw } from 'lucide-react';

interface AppSettings {
  featuredScriptureId: string;
  dailyVerseId: string;
  welcomeMessage: string;
  appTheme: 'light' | 'dark' | 'sepia';
}

interface Scripture {
  id: string;
  verse: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    featuredScriptureId: '',
    dailyVerseId: '',
    welcomeMessage: '',
    appTheme: 'light',
  });
  const [scriptures, setScriptures] = useState<Scripture[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch current settings
      const settingsDoc = await getDoc(doc(db, 'settings', 'app_config'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as AppSettings);
      }

      // Fetch scriptures for dropdowns
      const scripturesSnap = await getDocs(collection(db, 'scriptures'));
      const scripturesData = scripturesSnap.docs.map((doc) => ({
        id: doc.id,
        verse: doc.data().verse,
      }));
      setScriptures(scripturesData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await setDoc(doc(db, 'settings', 'app_config'), {
        ...settings,
        updatedAt: Timestamp.now(),
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
            <p className="text-gray-600">Configure the mobile app settings</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Scripture (Home Page)
                </label>
                <select
                  value={settings.featuredScriptureId}
                  onChange={(e) => setSettings({ ...settings, featuredScriptureId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a scripture</option>
                  {scriptures.map((s) => (
                    <option key={s.id} value={s.id}>{s.verse}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  This scripture will be prominently displayed on the app's home screen
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Verse
                </label>
                <select
                  value={settings.dailyVerseId}
                  onChange={(e) => setSettings({ ...settings, dailyVerseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a scripture</option>
                  {scriptures.map((s) => (
                    <option key={s.id} value={s.id}>{s.verse}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  The current daily verse shown to users
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message
                </label>
                <textarea
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter a welcome message for new users..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default App Theme
                </label>
                <div className="flex gap-4">
                  {(['light', 'dark', 'sepia'] as const).map((theme) => (
                    <label
                      key={theme}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                        settings.appTheme === theme
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={settings.appTheme === theme}
                        onChange={(e) => setSettings({ ...settings, appTheme: e.target.value as AppSettings['appTheme'] })}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          theme === 'light' ? 'bg-gray-100 border-gray-300' :
                          theme === 'dark' ? 'bg-gray-800 border-gray-600' :
                          'bg-amber-100 border-amber-300'
                        }`}
                      />
                      <span className="capitalize font-medium">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
