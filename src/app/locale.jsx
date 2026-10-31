import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations } from './translations';
const LocaleContext = createContext(null);
export function LocaleProvider({
  children
}) {
  const [language, setLanguage] = useState(() => ['en', 'fr', 'ar'].includes(localStorage.getItem('language')) ? localStorage.getItem('language') : 'en');
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);
  const t = useCallback((key, values = {}) => {
    let text = language === 'en' ? key : translations[key]?.[language] ?? key;
    Object.entries(values).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value));
    });
    return text;
  }, [language]);
  const date = value => new Intl.DateTimeFormat(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-GB', {
    dateStyle: 'medium'
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
  return <LocaleContext.Provider value={{
    language,
    setLanguage,
    t,
    date
  }}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
  return useContext(LocaleContext);
}
