export const OTHER_MALAYSIA_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Terengganu',
  'W.P. Kuala Lumpur',
  'W.P. Putrajaya',
  'W.P. Labuan',
];

export type MalaysiaStateOption = { label: string; disabled?: boolean };

export const MALAYSIA_STATE_OPTIONS: MalaysiaStateOption[] = [
  { label: 'Selangor', disabled: false },
  ...OTHER_MALAYSIA_STATES.map((label) => ({ label, disabled: true })),
];
