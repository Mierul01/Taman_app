import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import CustomTabBar from './CustomTabBar';
import DashboardScreen from '../screens/DashboardScreen';
import ProgramsScreen from '../screens/ProgramsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import CharityScreen from '../screens/CharityScreen';
import CommitteeScreen from '../screens/CommitteeScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { user } = useAuth();
  const canViewCollections = user ? user.role !== 'resident' : false;

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Programs" component={ProgramsScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Charity" component={CharityScreen} />
      <Tab.Screen name="Committee" component={CommitteeScreen} />
      {canViewCollections && <Tab.Screen name="Collections" component={CollectionsScreen} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
