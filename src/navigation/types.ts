import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  PdpaNotice: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ProgramDetail: { programId: string };
  AddProgram: undefined;
  ProfileEdit: undefined;
  Notifications: undefined;
  Settings: undefined;
  AdminPanel: undefined;
  BankAccountSettings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Programs: undefined;
  Payments: undefined;
  Charity: undefined;
  Committee: undefined;
  Collections: undefined;
  Profile: undefined;
};
