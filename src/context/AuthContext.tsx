import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FamilyMember = {
  id: string;
  name: string;
  relationship: string;
  age?: string;
  linkedEmail?: string;
};

export type Role = 'resident' | 'ajk' | 'treasurer' | 'chairman' | 'admin';

export type User = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  parkName: string;
  familyMembers: FamilyMember[];
  role: Role;
  dependentOf?: string;
  avatarUri?: string;
};

export type ProfileUpdate = Pick<User, 'name' | 'phone' | 'address' | 'postcode' | 'city'>;

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; messageKey?: string }>;
  register: (
    data: Omit<User, 'familyMembers' | 'role'> & { password: string }
  ) => Promise<{ success: boolean; messageKey?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  updateAvatar: (avatarUri: string | undefined) => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, 'linkedEmail'>) => Promise<void>;
  removeFamilyMember: (id: string) => Promise<void>;
  addFamilyMemberWithLogin: (
    member: Omit<FamilyMember, 'linkedEmail'>,
    login: { email: string; password: string }
  ) => Promise<{ success: boolean; messageKey?: string }>;
  getParkUsers: (parkName: string) => Promise<User[]>;
  setUserRole: (email: string, role: Role) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = '@tlamana_users';
const SESSION_KEY = '@tlamana_session';

type StoredUser = User & { password: string };

const SUPER_ADMIN_EMAILS = ['mamirulaimanz01@gmail.com'];

function normalize(u: any): User {
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(String(u.email).toLowerCase());
  return {
    ...u,
    familyMembers: u.familyMembers ?? [],
    role: isSuperAdmin ? 'admin' : u.role ?? 'resident',
    parkName: u.parkName ?? '',
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) setUser(normalize(JSON.parse(session)));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const getUsers = async (): Promise<StoredUser[]> => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const login = async (email: string, password: string) => {
    const users = await getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, messageKey: 'common.loginFailed' };
    }
    const { password: _pw, ...publicUser } = found;
    const normalized = normalize(publicUser);
    setUser(normalized);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
    return { success: true };
  };

  const register = async (data: Omit<User, 'familyMembers' | 'role'> & { password: string }) => {
    const users = await getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (exists) {
      return { success: false, messageKey: 'common.emailTaken' };
    }
    const isFirstInPark = !users.some((u) => u.parkName === data.parkName);
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(data.email.trim().toLowerCase());
    const newRecord: StoredUser = {
      ...data,
      familyMembers: [],
      role: isFirstInPark || isSuperAdmin ? 'admin' : 'resident',
    };
    const newUsers = [...users, newRecord];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    const { password: _pw, ...publicUser } = newRecord;
    setUser(publicUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const deleteAccount = async () => {
    if (!user) return;
    const users = await getUsers();
    const remaining = users.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(remaining));
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const persistUser = async (updated: User) => {
    setUser(updated);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const users = await getUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === updated.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return;
    await persistUser({ ...user, ...updates });
  };

  const updateAvatar = async (avatarUri: string | undefined) => {
    if (!user) return;
    await persistUser({ ...user, avatarUri });
  };

  const addFamilyMember = async (member: Omit<FamilyMember, 'linkedEmail'>) => {
    if (!user) return;
    await persistUser({ ...user, familyMembers: [...user.familyMembers, { ...member }] });
  };

  const removeFamilyMember = async (id: string) => {
    if (!user) return;
    await persistUser({
      ...user,
      familyMembers: user.familyMembers.filter((m) => m.id !== id),
    });
  };

  const addFamilyMemberWithLogin = async (
    member: Omit<FamilyMember, 'linkedEmail'>,
    login: { email: string; password: string }
  ) => {
    if (!user) return { success: false, messageKey: 'common.loginFailed' };
    const users = await getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === login.email.trim().toLowerCase());
    if (exists) {
      return { success: false, messageKey: 'common.emailTaken' };
    }
    const dependentRecord: StoredUser = {
      name: member.name,
      email: login.email.trim(),
      password: login.password,
      phone: user.phone,
      address: user.address,
      postcode: user.postcode,
      city: user.city,
      parkName: user.parkName,
      familyMembers: [],
      role: 'resident',
      dependentOf: user.email,
    };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, dependentRecord]));

    const newMember: FamilyMember = { ...member, linkedEmail: dependentRecord.email };
    await persistUser({ ...user, familyMembers: [...user.familyMembers, newMember] });
    return { success: true };
  };

  const getParkUsers = async (parkName: string): Promise<User[]> => {
    const users = await getUsers();
    return users
      .filter((u) => u.parkName === parkName)
      .map(({ password: _pw, ...publicUser }) => normalize(publicUser));
  };

  const setUserRole = async (email: string, role: Role) => {
    const users = await getUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return;
    users[idx] = { ...users[idx], role };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      await persistUser({ ...user, role });
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      deleteAccount,
      updateProfile,
      updateAvatar,
      addFamilyMember,
      removeFamilyMember,
      addFamilyMemberWithLogin,
      getParkUsers,
      setUserRole,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
