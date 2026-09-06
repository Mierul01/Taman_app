export type Program = {
  id: string;
  title: string;
  date: string;
  dateISO: string;
  location: string;
  description: string;
  category: 'Sukan' | 'Gotong-Royong' | 'Perayaan' | 'Kursus';
  parkName?: string;
  createdBy?: string;
};

export const programs: Program[] = [
  {
    id: 'p1',
    title: 'Gotong-Royong Perdana',
    date: '20 Sep 2026',
    dateISO: '2026-09-20',
    location: 'Dewan Serbaguna Taman',
    description: 'Aktiviti membersihkan kawasan taman dan longkang bersama penduduk.',
    category: 'Gotong-Royong',
  },
  {
    id: 'p2',
    title: 'Turnamen Bola Tampar AJK',
    date: '4 Okt 2026',
    dateISO: '2026-10-04',
    location: 'Padang Taman',
    description: 'Pertandingan mesra antara penduduk untuk mengeratkan silaturahim.',
    category: 'Sukan',
  },
  {
    id: 'p3',
    title: 'Sambutan Maulidur Rasul',
    date: '18 Okt 2026',
    dateISO: '2026-10-18',
    location: 'Surau Taman',
    description: 'Majlis sambutan dan jamuan makan malam bersama penduduk.',
    category: 'Perayaan',
  },
  {
    id: 'p4',
    title: 'Kursus Motivasi Keluarga',
    date: '2 Nov 2026',
    dateISO: '2026-11-02',
    location: 'Dewan Serbaguna Taman',
    description: 'Ceramah motivasi untuk keharmonian keluarga dan komuniti.',
    category: 'Kursus',
  },
];

export type FeeItem = {
  id: string;
  title: string;
  description: string;
  amount: number;
  period: string;
};

export const feeItems: FeeItem[] = [
  {
    id: 'f1',
    title: 'Yuran Keselamatan Bulanan',
    description: 'Yuran pengawal keselamatan dan penyelenggaraan pondok pengawal.',
    amount: 30,
    period: 'Bulanan',
  },
  {
    id: 'f2',
    title: 'Yuran Penyelenggaraan Taman',
    description: 'Penyelenggaraan taman permainan dan kawasan lapang.',
    amount: 15,
    period: 'Bulanan',
  },
  {
    id: 'f3',
    title: 'Yuran Keahlian Tahunan',
    description: 'Yuran keahlian Persatuan Penduduk Taman.',
    amount: 24,
    period: 'Tahunan',
  },
];

export type CharityItem = {
  id: string;
  title: string;
  description: string;
  suggestedAmount: number;
};

export const charityItems: CharityItem[] = [
  {
    id: 'c1',
    title: 'Tabung Khairat Kematian',
    description: 'Sumbangan untuk membantu keluarga penduduk yang ditimpa kematian.',
    suggestedAmount: 10,
  },
  {
    id: 'c2',
    title: 'Tabung Bantuan Bencana',
    description: 'Bantuan kecemasan untuk mangsa banjir dan bencana alam.',
    suggestedAmount: 20,
  },
  {
    id: 'c3',
    title: 'Tabung Anak Yatim & Asnaf',
    description: 'Sumbangan untuk anak yatim dan golongan asnaf di sekitar taman.',
    suggestedAmount: 15,
  },
];

export const totalHouseholds = 120;

export type EmergencyContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
};

export const emergencyContacts: EmergencyContact[] = [
  { id: 'e1', name: 'Balai Bomba', role: 'Kecemasan - Bomba', phone: '994' },
  { id: 'e2', name: 'Balai Polis', role: 'Kecemasan - Polis', phone: '999' },
  { id: 'e3', name: 'Ambulans / Hospital', role: 'Kecemasan - Perubatan', phone: '999' },
];
