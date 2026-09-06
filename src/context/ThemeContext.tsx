import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, buildTypography } from '../theme/theme';

const DARK_MODE_KEY = '@tlamana_dark_mode';

type ThemeContextType = {
  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (stored) setIsDarkMode(stored === 'true');
    })();
  }, []);

  const setDarkMode = (value: boolean) => {
    setIsDarkMode(value);
    AsyncStorage.setItem(DARK_MODE_KEY, String(value));
  };

  const value = useMemo(() => ({ isDarkMode, setDarkMode }), [isDarkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
};

export const useThemeColors = () => {
  const { isDarkMode } = useAppTheme();
  return isDarkMode ? darkColors : lightColors;
};

export const useThemeTypography = () => {
  const colors = useThemeColors();
  return useMemo(() => buildTypography(colors), [colors]);
};
