import React, { createContext, useContext, useMemo } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export type PaymentRecord = {
  id: string;
  userEmail: string;
  userName: string;
  parkName: string;
  feeId: string;
  feeTitle: string;
  feeType: 'yuran' | 'khairat';
  amount: number;
  date: string;
  receiptUri?: string;
  referenceNumber?: string;
};

export type BankAccountInfo = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  methodGroup?: 'bank' | 'ewallet' | 'other';
  qrImageUri?: string;
};

const recordsCol = collection(db, 'paymentRecords');
const bankAccountsCol = collection(db, 'bankAccounts');

export type FeeType = 'yuran' | 'khairat';

type PaymentContextType = {
  addPaymentRecord: (record: Omit<PaymentRecord, 'id'>) => Promise<void>;
  getUserPaymentRecords: (userEmail: string, feeId: string) => Promise<PaymentRecord[]>;
  getParkPaymentRecords: (parkName: string) => Promise<PaymentRecord[]>;
  getBankAccount: (parkName: string, feeType: FeeType) => Promise<BankAccountInfo | null>;
  setBankAccount: (parkName: string, feeType: FeeType, info: BankAccountInfo) => Promise<void>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

function bankAccountDocId(parkName: string, feeType: FeeType) {
  // Firestore doc IDs can't contain "/", and park names are free text.
  return `${encodeURIComponent(parkName)}_${feeType}`;
}

// Pre-separation doc id, kept only so a park's existing (shared) account
// data isn't silently lost the first time this loads — treated as the
// yuran account, since that's what most parks set up first.
function legacyBankAccountDocId(parkName: string) {
  return encodeURIComponent(parkName);
}

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const addPaymentRecord = async (record: Omit<PaymentRecord, 'id'>) => {
    await addDoc(recordsCol, record);
  };

  const getUserPaymentRecords = async (userEmail: string, feeId: string) => {
    const snap = await getDocs(
      query(recordsCol, where('userEmail', '==', userEmail), where('feeId', '==', feeId))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PaymentRecord);
  };

  const getParkPaymentRecords = async (parkName: string) => {
    const snap = await getDocs(query(recordsCol, where('parkName', '==', parkName)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PaymentRecord);
  };

  const getBankAccount = async (parkName: string, feeType: FeeType) => {
    const snap = await getDoc(doc(bankAccountsCol, bankAccountDocId(parkName, feeType)));
    if (snap.exists()) return snap.data() as BankAccountInfo;

    if (feeType === 'yuran') {
      const legacySnap = await getDoc(doc(bankAccountsCol, legacyBankAccountDocId(parkName)));
      if (legacySnap.exists()) return legacySnap.data() as BankAccountInfo;
    }
    return null;
  };

  const setBankAccount = async (parkName: string, feeType: FeeType, info: BankAccountInfo) => {
    await setDoc(doc(bankAccountsCol, bankAccountDocId(parkName, feeType)), info);
  };

  const value = useMemo(
    () => ({
      addPaymentRecord,
      getUserPaymentRecords,
      getParkPaymentRecords,
      getBankAccount,
      setBankAccount,
    }),
    []
  );

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};

export const usePayments = () => {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayments must be used within PaymentProvider');
  return ctx;
};
