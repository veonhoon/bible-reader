import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Smartphone } from 'lucide-react';

interface WeeklyContent {
  weekTitle: string;
  publishedAt: Date;
  snippetCount: number;
}

interface AppSettings {
  appTheme: 'light' | 'dark' | 'sepia';
}

const themeColors = {
  light: {
    background: '#FAF9F6',
    card: '#FFFFFF',
    text: '#1E1E1E',
    textSecondary: '#5A5A5A',
    accent: '#2C3E73',
    border: '#E8E6E1',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#EDEDED',
    textSecondary: '#B0B0B0',
    accent: '#5A7BC9',
    border: '#2D2D2D',
  },
  sepia: {
    background: '#F4ECD8',
    card: '#FBF7EE',
    text: '#3D3229',
    textSecondary: '#5E5244',
    accent: '#6B4423',
    border: '#D9CEBC',
  },
};

export default function MobilePreview() {
  const [content, setContent] = useState<WeeklyContent | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest weekly content
        const contentQuery = query(
          collection(db, 'weeklyContent'),
          orderBy('publishedAt', 'desc'),
          limit(1)
        );
        const contentSnap = await getDocs(contentQuery);

        if (!contentSnap.empty) {
          const data = contentSnap.docs[0].data();
          setContent({
            weekTitle: data.weekTitle,
            publishedAt: data.publishedAt?.toDate() || new Date(),
            snippetCount: data.snippetCount || 0,
          });
        }

        // Fetch app theme
        const settingsDoc = await getDoc(doc(db, 'settings', 'app_config'));
        if (settingsDoc.exists()) {
          const settings = settingsDoc.data() as AppSettings;
          setTheme(settings.appTheme || 'light');
        }
      } catch (error) {
        console.error('Error fetching mobile preview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const colors = themeColors[theme];

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900">Mobile App Preview</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6">Live preview of what users see on their phone</p>

      {/* Phone mockup */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Phone frame */}
          <div className="w-[280px] h-[560px] bg-black rounded-[2.5rem] p-3 shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

            {/* Screen */}
            <div
              className="w-full h-full rounded-[2rem] overflow-hidden"
              style={{ backgroundColor: colors.background }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : content ? (
                <div className="p-5 space-y-4 overflow-auto h-full">
                  {/* Week Title */}
                  <div className="mt-6">
                    <h1
                      className="text-xl font-bold mb-2"
                      style={{ color: colors.text }}
                    >
                      {content.weekTitle}
                    </h1>
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        {formatDate(content.publishedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Card */}
                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: colors.card,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <p
                      className="font-semibold mb-2"
                      style={{ color: colors.text }}
                    >
                      Day 1 of 7
                    </p>
                    <div
                      className="h-2 rounded-full mb-2"
                      style={{ backgroundColor: colors.border }}
                    >
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: colors.accent,
                          width: '14%'
                        }}
                      ></div>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {content.snippetCount} teachings for today
                    </p>
                  </div>

                  {/* Notification Toggle */}
                  <div
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{
                      backgroundColor: colors.card,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: colors.text }}
                        >
                          Daily Teachings
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Get notified
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-11 h-6 rounded-full relative"
                      style={{ backgroundColor: colors.border }}
                    >
                      <div
                        className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"
                      ></div>
                    </div>
                  </div>

                  {/* Sample snippet card */}
                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: colors.card,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <p
                      className="font-semibold text-sm mb-1"
                      style={{ color: colors.text }}
                    >
                      Today's Teaching
                    </p>
                    <p
                      className="text-xs mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Tap to read more
                    </p>
                    <div className="flex justify-end">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-6 text-center">
                  <div>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={colors.textSecondary}
                      strokeWidth="2"
                      className="mx-auto mb-3"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    <p
                      className="font-semibold text-sm mb-1"
                      style={{ color: colors.text }}
                    >
                      No Content Yet
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      Publish weekly content to see it here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theme indicator */}
      <div className="mt-4 text-center">
        <span className="text-xs text-gray-500">
          Current theme: <span className="capitalize font-medium">{theme}</span>
        </span>
      </div>
    </div>
  );
}
