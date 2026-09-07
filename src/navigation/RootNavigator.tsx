import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { colors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PdpaNoticeScreen from '../screens/PdpaNoticeScreen';
import MainTabNavigator from './MainTabNavigator';
import ProgramDetailScreen from '../screens/ProgramDetailScreen';
import AddProgramScreen from '../screens/AddProgramScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import BankAccountSettingsScreen from '../screens/BankAccountSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingView() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
          <Stack.Screen name="AddProgram" component={AddProgramScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          <Stack.Screen name="BankAccountSettings" component={BankAccountSettingsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="PdpaNotice" component={PdpaNoticeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
