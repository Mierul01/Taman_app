export const SELANGOR_DISTRICTS = [
  'Gombak',
  'Hulu Langat',
  'Hulu Selangor',
  'Klang',
  'Kuala Langat',
  'Kuala Selangor',
  'Petaling',
  'Sabak Bernam',
  'Sepang',
] as const;

export type SelangorDistrict = (typeof SELANGOR_DISTRICTS)[number];

export const SELANGOR_CITIES_BY_DISTRICT: Record<SelangorDistrict, string[]> = {
  Gombak: ['Gombak', 'Batu Caves', 'Selayang', 'Rawang', 'Taman Melawati', 'Ulu Kelang', 'Bukit Antarabangsa'],
  'Hulu Langat': ['Kajang', 'Bangi', 'Semenyih', 'Balakong', 'Cheras', 'Ampang', 'Batu 9 Cheras', 'Broga'],
  'Hulu Selangor': ['Kuala Kubu Bharu', 'Rasa', 'Batang Kali', 'Serendah', 'Kerling', 'Ulu Yam'],
  Klang: ['Klang', 'Port Klang', 'Bukit Tinggi', 'Meru', 'Kapar', 'Bandar Botanic', 'Bukit Raja', 'Kota Kemuning'],
  'Kuala Langat': ['Banting', 'Telok Panglima Garang', 'Jenjarom', 'Morib', 'Bandar Saujana Putra', 'Tanjung Sepat'],
  'Kuala Selangor': ['Kuala Selangor', 'Tanjung Karang', 'Bestari Jaya', 'Ijok', 'Jeram'],
  Petaling: [
    'Petaling Jaya',
    'Subang Jaya',
    'Shah Alam',
    'Puchong',
    'Kelana Jaya',
    'Bandar Utama',
    'Sungai Buloh',
    'Kota Damansara',
    'Damansara Perdana',
    'Ara Damansara',
    'Sunway',
    'USJ',
    'Setia Alam',
  ],
  'Sabak Bernam': ['Sabak Bernam', 'Sungai Besar', 'Sekinchan', 'Panchang Bedena'],
  Sepang: ['Sepang', 'Salak Tinggi', 'Cyberjaya', 'Dengkil', 'Bandar Baru Salak Tinggi'],
};

export const SELANGOR_CITIES: string[] = Array.from(
  new Set(Object.values(SELANGOR_CITIES_BY_DISTRICT).flat())
).sort();
