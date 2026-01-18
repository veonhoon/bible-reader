import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/constants/translations';

/**
 * Hook for accessing translations in the current language
 * @example
 * const { t } = useTranslation();
 * <Text>{t('settings')}</Text>
 * <Text>{t('dayOf', { current: 1, total: 7 })}</Text>
 */
export const useTranslation = () => {
  const { language } = useLanguage();

  return {
    t: (key: string, params?: Record<string, string | number>) => t(key, language, params),
    language,
  };
};

export default useTranslation;
