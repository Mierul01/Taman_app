import { SELANGOR_CITIES_BY_DISTRICT } from './selangorLocations';

const OTHER_STATE_CITIES: Record<string, string[]> = {
  Johor: ['Johor Bahru', 'Batu Pahat', 'Muar', 'Kluang', 'Segamat', 'Pontian', 'Kulai', 'Pasir Gudang', 'Kota Tinggi', 'Mersing'],
  Kedah: ['Alor Setar', 'Sungai Petani', 'Kulim', 'Langkawi', 'Jitra', 'Baling'],
  Kelantan: ['Kota Bharu', 'Pasir Mas', 'Tanah Merah', 'Gua Musang', 'Machang'],
  Melaka: ['Bandar Melaka', 'Alor Gajah', 'Jasin', 'Ayer Keroh'],
  'Negeri Sembilan': ['Seremban', 'Port Dickson', 'Nilai', 'Bahau', 'Kuala Pilah'],
  Pahang: ['Kuantan', 'Temerloh', 'Bentong', 'Raub', 'Cameron Highlands', 'Jerantut'],
  Perak: ['Ipoh', 'Taiping', 'Teluk Intan', 'Sitiawan', 'Kuala Kangsar', 'Batu Gajah'],
  Perlis: ['Kangar', 'Arau'],
  'Pulau Pinang': ['George Town', 'Butterworth', 'Bukit Mertajam', 'Bayan Lepas'],
  Sabah: ['Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau'],
  Sarawak: ['Kuching', 'Miri', 'Sibu', 'Bintulu', 'Limbang'],
  Terengganu: ['Kuala Terengganu', 'Kemaman', 'Dungun', 'Marang'],
  'W.P. Kuala Lumpur': ['Kuala Lumpur'],
  'W.P. Putrajaya': ['Putrajaya'],
  'W.P. Labuan': ['Labuan'],
};

export type MalaysiaCityOption = { label: string; disabled?: boolean; isHeader?: boolean };

export function buildMalaysiaCityList(): MalaysiaCityOption[] {
  const items: MalaysiaCityOption[] = [];

  const selangorCities = Array.from(new Set(Object.values(SELANGOR_CITIES_BY_DISTRICT).flat())).sort();
  items.push({ label: 'Selangor', isHeader: true });
  for (const city of selangorCities) {
    items.push({ label: city, disabled: false });
  }

  for (const state of Object.keys(OTHER_STATE_CITIES).sort()) {
    items.push({ label: state, isHeader: true });
    for (const city of OTHER_STATE_CITIES[state]) {
      items.push({ label: city, disabled: true });
    }
  }

  return items;
}
