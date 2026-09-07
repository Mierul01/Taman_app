import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  inMemoryPersistence,
  initializeAuth,
} from 'firebase/auth';
// @ts-expect-error -- firebase/auth's package.json "exports" map lists a
// "types" condition ahead of "react-native", so tsc's type resolution (run
// outside Metro) picks the browser typings and misses this symbol. Metro
// resolves the "react-native" condition correctly at runtime/bundle time,
// so this actually works on-device; it's a types-only false positive.
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// From Firebase Console -> Project Settings -> General -> "Your apps" ->
// Web app (</>) -> SDK setup and configuration -> Config. These values are
// not secret (Firestore access is controlled by Security Rules, not by
// hiding this object).
export const firebaseConfig = {
  apiKey: 'AIzaSyAAMuXmz2xVkJZilXlhpSNbd1isy-xtEuU',
  authDomain: 'taman-app-a8805.firebaseapp.com',
  databaseURL: 'https://taman-app-a8805-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'taman-app-a8805',
  storageBucket: 'taman-app-a8805.firebasestorage.app',
  messagingSenderId: '92723362135',
  appId: '1:92723362135:web:aba7c892c73d9a9fdf2612',
  measurementId: 'G-Z8V6LVMYTV',
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance: Auth;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = authInstance;
export const db = getFirestore(app);

// Used to toggle "Remember me" at login time: keep the session across app
// restarts (the default), or only for as long as this app instance stays
// open in memory.
export const rememberMePersistence = Platform.OS === 'web' ? browserLocalPersistence : getReactNativePersistence(AsyncStorage);
export const sessionOnlyPersistence = Platform.OS === 'web' ? browserSessionPersistence : inMemoryPersistence;

// A second, isolated Firebase Auth session used only for creating a linked
// family-member account. Firebase Auth's createUserWithEmailAndPassword()
// switches the *current* session to the newly created user, which would log
// the guardian out of their own account. Running it on a separate app
// instance keeps the guardian's primary session untouched.
let secondaryApp: FirebaseApp | undefined;
let secondaryAuth: Auth | undefined;

export function getSecondaryAuth(): Auth {
  if (!secondaryAuth) {
    secondaryApp = getApps().some((a) => a.name === 'secondary')
      ? getApp('secondary')
      : initializeApp(firebaseConfig, 'secondary');
    secondaryAuth =
      Platform.OS === 'web'
        ? getAuth(secondaryApp)
        : initializeAuth(secondaryApp, { persistence: getReactNativePersistence(AsyncStorage) });
  }
  return secondaryAuth;
}
