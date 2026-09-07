import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PaymentProvider } from './src/context/PaymentContext';
import { ThemeProvider, useAppTheme, useThemeColors } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';
import UpdateBanner from './src/components/UpdateBanner';

function useHideNativePasswordReveal() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = `
      input[type="password"]::-ms-reveal,
      input[type="password"]::-ms-clear {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

function AppShell() {
  const { isDarkMode } = useAppTheme();
  const colors = useThemeColors();
  const navTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <RootNavigator />
      <UpdateBanner />
    </NavigationContainer>
  );
}

export default function App() {
  useHideNativePasswordReveal();
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <PaymentProvider>
              <AppShell />
            </PaymentProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
