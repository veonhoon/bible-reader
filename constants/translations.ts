import { AppLanguage } from '@/contexts/LanguageContext';

export const translations = {
  en: {
    // Settings Screen
    settings: 'Settings',
    readingMode: 'Reading Mode',
    language: 'Language',
    languageDescription: 'Choose your preferred language',
    english: 'English',
    korean: '한국어',
    light: 'Light',
    dark: 'Dark',
    sepia: 'Sepia',
    savedScriptures: 'Saved Scriptures & Highlights',
    viewBookmarks: 'View your bookmarks and highlights',
    reminders: 'Reminders & Notifications',
    manageReminders: 'Manage your reminders',
    enableNotifications: 'Enable push notifications',
    readingIsFree: 'Reading is always free.',
    madeWithLove: 'Made with faith and love',
    account: 'Account',
    signedInAs: 'Signed in as',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    syncProgress: 'Sync your progress across devices',

    // Home Screen
    home: 'Home',
    noContentYet: 'No Content Yet',
    noContentMessage: 'Daily teachings will appear here once published. Check back soon!',
    dayOf: 'Day {{current}} of {{total}}',
    teachingsForToday: '{{count}} teachings for today',
    dailyTeachings: 'Daily Teachings',
    receiveInsights: 'Receive daily scripture insights',
    getNotified: 'Get notified',
    premium: 'Premium',
    todaysTeaching: "Today's Teaching",
    tapToRead: 'Tap to read more',

    // Read Screen
    read: 'Read',
    bookmarks: 'Bookmarks',

    // Common
    loading: 'Loading...',
    search: 'Search',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
  },
  ko: {
    // Settings Screen
    settings: '설정',
    readingMode: '읽기 모드',
    language: '언어',
    languageDescription: '원하는 언어를 선택하세요',
    english: 'English',
    korean: '한국어',
    light: '밝게',
    dark: '어둡게',
    sepia: '세피아',
    savedScriptures: '저장된 성경 구절 및 하이라이트',
    viewBookmarks: '북마크와 하이라이트 보기',
    reminders: '알림 및 푸시 알림',
    manageReminders: '알림 관리',
    enableNotifications: '푸시 알림 활성화',
    readingIsFree: '읽기는 항상 무료입니다.',
    madeWithLove: '믿음과 사랑으로 만들었습니다',
    account: '계정',
    signedInAs: '로그인:',
    signOut: '로그아웃',
    signIn: '로그인',
    syncProgress: '여러 기기에서 진행 상황 동기화',

    // Home Screen
    home: '홈',
    noContentYet: '아직 콘텐츠가 없습니다',
    noContentMessage: '매일의 가르침이 게시되면 여기에 표시됩니다. 곧 다시 확인하세요!',
    dayOf: '{{total}}일 중 {{current}}일',
    teachingsForToday: '오늘의 가르침 {{count}}개',
    dailyTeachings: '매일의 가르침',
    receiveInsights: '매일 성경 통찰 받기',
    getNotified: '알림 받기',
    premium: '프리미엄',
    todaysTeaching: '오늘의 가르침',
    tapToRead: '더 읽으려면 탭하세요',

    // Read Screen
    read: '읽기',
    bookmarks: '북마크',

    // Common
    loading: '로딩 중...',
    search: '검색',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    done: '완료',
  },
};

export const t = (key: string, lang: AppLanguage, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    value = value?.[k];
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters like {{count}}, {{current}}, etc.
  if (params) {
    return Object.entries(params).reduce((str, [param, val]) => {
      return str.replace(new RegExp(`{{${param}}}`, 'g'), String(val));
    }, value);
  }

  return value;
};

export default translations;
