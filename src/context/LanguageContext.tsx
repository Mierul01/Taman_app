import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language } from '../i18n/translations';

const LANGUAGE_KEY = '@tlamana_language';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function resolve(path: string, lang: Language): string {
  const parts = path.split('.');
  let node: any = translations[lang];
  for (const part of parts) {
    node = node?.[part];
  }
  if (typeof node === 'string') return node;
  return path;
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ms');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (stored === 'en' || stored === 'ms') setLanguageState(stored);
    })();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (path: string, params?: Record<string, string | number>) => {
    let str = resolve(path, language);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        str = str.replace(`{${key}}`, String(value));
      });
    }
    return str;
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
