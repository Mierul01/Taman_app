import React, { createContext, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
};

export type BankAccountInfo = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

const RECORDS_KEY = '@tlamana_payment_records';
const BANK_ACCOUNTS_KEY = '@tlamana_bank_accounts';

type PaymentContextType = {
  addPaymentRecord: (record: Omit<PaymentRecord, 'id'>) => Promise<void>;
  getUserPaymentRecords: (userEmail: string, feeId: string) => Promise<PaymentRecord[]>;
  getParkPaymentRecords: (parkName: string) => Promise<PaymentRecord[]>;
  getBankAccount: (parkName: string) => Promise<BankAccountInfo | null>;
  setBankAccount: (parkName: string, info: BankAccountInfo) => Promise<void>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const getAllRecords = async (): Promise<PaymentRecord[]> => {
    const raw = await AsyncStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const addPaymentRecord = async (record: Omit<PaymentRecord, 'id'>) => {
    const records = await getAllRecords();
    const newRecord: PaymentRecord = { ...record, id: `pay_${Date.now()}` };
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify([...records, newRecord]));
  };

  const getUserPaymentRecords = async (userEmail: string, feeId: string) => {
    const records = await getAllRecords();
    return records.filter(
      (r) => r.userEmail.toLowerCase() === userEmail.toLowerCase() && r.feeId === feeId
    );
  };

  const getParkPaymentRecords = async (parkName: string) => {
    const records = await getAllRecords();
    return records.filter((r) => r.parkName === parkName);
  };

  const getAllBankAccounts = async (): Promise<Record<string, BankAccountInfo>> => {
    const raw = await AsyncStorage.getItem(BANK_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  };

  const getBankAccount = async (parkName: string) => {
    const accounts = await getAllBankAccounts();
    return accounts[parkName] ?? null;
  };

  const setBankAccount = async (parkName: string, info: BankAccountInfo) => {
    const accounts = await getAllBankAccounts();
    accounts[parkName] = info;
    await AsyncStorage.setItem(BANK_ACCOUNTS_KEY, JSON.stringify(accounts));
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
