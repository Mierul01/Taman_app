import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as firebaseUpdatePassword,
  deleteUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, getSecondaryAuth } from '../firebase/config';

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
  changePassword: (newPassword: string) => Promise<void>;
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

const usersCol = collection(db, 'users');

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUser(snap.exists() ? normalize(snap.data()) : null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (!snap.exists()) {
        return { success: false, messageKey: 'common.loginFailed' };
      }
      setUser(normalize(snap.data()));
      return { success: true };
    } catch {
      return { success: false, messageKey: 'common.loginFailed' };
    }
  };

  const register = async (data: Omit<User, 'familyMembers' | 'role'> & { password: string }) => {
    try {
      const emailTrimmed = data.email.trim();
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(emailTrimmed.toLowerCase());

      // Firestore rules require an authenticated request to read `users`, so
      // the auth account must exist before this "am I the first person in
      // this park" check can run.
      const cred = await createUserWithEmailAndPassword(auth, emailTrimmed, data.password);
      const parkSnap = await getDocs(query(usersCol, where('parkName', '==', data.parkName), limit(1)));
      const isFirstInPark = parkSnap.empty;

      const newUser: User = {
        name: data.name,
        email: emailTrimmed,
        phone: data.phone,
        address: data.address,
        postcode: data.postcode,
        city: data.city,
        parkName: data.parkName,
        familyMembers: [],
        role: isFirstInPark || isSuperAdmin ? 'admin' : 'resident',
      };
      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      setUser(normalize(newUser));
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        return { success: false, messageKey: 'common.emailTaken' };
      }
      return { success: false, messageKey: 'register.failed' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    await deleteDoc(doc(db, 'users', auth.currentUser.uid));
    await deleteUser(auth.currentUser);
    setUser(null);
  };

  const persistUser = async (updated: User) => {
    if (!auth.currentUser) return;
    setUser(updated);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { ...updated });
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return;
    await persistUser({ ...user, ...updates });
  };

  const updateAvatar = async (avatarUri: string | undefined) => {
    if (!user) return;
    await persistUser({ ...user, avatarUri });
  };

  const changePassword = async (newPassword: string) => {
    if (!auth.currentUser) return;
    await firebaseUpdatePassword(auth.currentUser, newPassword);
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
    try {
      const secondaryAuth = getSecondaryAuth();
      const emailTrimmed = login.email.trim();
      const cred = await createUserWithEmailAndPassword(secondaryAuth, emailTrimmed, login.password);

      const dependentProfile: User = {
        name: member.name,
        email: emailTrimmed,
        phone: user.phone,
        address: user.address,
        postcode: user.postcode,
        city: user.city,
        parkName: user.parkName,
        familyMembers: [],
        role: 'resident',
        dependentOf: user.email,
      };
      await setDoc(doc(db, 'users', cred.user.uid), dependentProfile);
      await signOut(secondaryAuth);

      const newMember: FamilyMember = { ...member, linkedEmail: dependentProfile.email };
      await persistUser({ ...user, familyMembers: [...user.familyMembers, newMember] });
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        return { success: false, messageKey: 'common.emailTaken' };
      }
      return { success: false, messageKey: 'profile.memberCreateFailed' };
    }
  };

  const getParkUsers = async (parkName: string): Promise<User[]> => {
    const snap = await getDocs(query(usersCol, where('parkName', '==', parkName)));
    return snap.docs.map((d) => normalize(d.data()));
  };

  const setUserRole = async (email: string, role: Role) => {
    const snap = await getDocs(query(usersCol, where('email', '==', email), limit(1)));
    if (snap.empty) return;
    await updateDoc(snap.docs[0].ref, { role });
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      setUser({ ...user, role });
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
      changePassword,
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
