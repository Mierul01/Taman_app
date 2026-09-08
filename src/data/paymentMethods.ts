export type PaymentMethodGroup = 'bank' | 'ewallet' | 'other';

export type PaymentMethodOption = {
  label: string;
  group: PaymentMethodGroup;
};

// Commercial, Islamic and development banks licensed in Malaysia.
const MALAYSIAN_BANKS: string[] = [
  'Maybank',
  'CIMB Bank',
  'Public Bank',
  'RHB Bank',
  'Hong Leong Bank',
  'AmBank',
  'Bank Islam Malaysia',
  'Bank Muamalat Malaysia',
  'Bank Rakyat',
  'Bank Simpanan Nasional (BSN)',
  'Affin Bank',
  'Alliance Bank',
  'MBSB Bank',
  'Agrobank',
  'Al Rajhi Bank Malaysia',
  'Kuwait Finance House Malaysia',
  'OCBC Bank Malaysia',
  'HSBC Bank Malaysia',
  'Standard Chartered Malaysia',
  'UOB Malaysia',
  'Citibank Malaysia',
  'China Construction Bank Malaysia',
  'Bank of China Malaysia',
  'ICBC Malaysia',
  'India International Bank Malaysia',
  'Deutsche Bank Malaysia',
  'J.P. Morgan Malaysia',
  'Bank of America Malaysia',
  'Sumitomo Mitsui Banking Corporation Malaysia',
  'BNP Paribas Malaysia',
];

// Popular Malaysian e-wallets / instant payment apps.
const MALAYSIAN_EWALLETS: string[] = [
  "Touch 'n Go eWallet",
  'Boost',
  'GrabPay',
  'ShopeePay',
  'MAE by Maybank',
  'BigPay',
  'Setel',
  'FavePay',
];

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  ...MALAYSIAN_BANKS.map((label) => ({ label, group: 'bank' as const })),
  ...MALAYSIAN_EWALLETS.map((label) => ({ label, group: 'ewallet' as const })),
];
