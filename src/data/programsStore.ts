import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { programs as seedPrograms, Program } from './mockData';

const programsCol = collection(db, 'programs');

export async function getAllPrograms(): Promise<Program[]> {
  const snap = await getDocs(programsCol);
  const custom = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Program);
  return [...seedPrograms, ...custom];
}

export async function addProgram(program: Program): Promise<void> {
  const { id: _id, ...rest } = program;
  await addDoc(programsCol, rest);
}
