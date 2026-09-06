import AsyncStorage from '@react-native-async-storage/async-storage';
import { programs as seedPrograms, Program } from './mockData';

const CUSTOM_PROGRAMS_KEY = '@tlamana_custom_programs';

export async function getAllPrograms(): Promise<Program[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_PROGRAMS_KEY);
  const custom: Program[] = raw ? JSON.parse(raw) : [];
  return [...seedPrograms, ...custom];
}

export async function addProgram(program: Program): Promise<void> {
  const raw = await AsyncStorage.getItem(CUSTOM_PROGRAMS_KEY);
  const custom: Program[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem(CUSTOM_PROGRAMS_KEY, JSON.stringify([...custom, program]));
}
