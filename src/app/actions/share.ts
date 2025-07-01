'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { z } from 'zod';

const ShareDataSchema = z.object({
  name: z.string().min(1),
  tasks: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
    createdAt: z.string(),
    description: z.string().optional(),
  })),
});

type ShareData = z.infer<typeof ShareDataSchema>;

export async function createShareLink(data: ShareData): Promise<{ success: boolean; id?: string; error?: string }> {
  const validation = ShareDataSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Invalid data provided.' };
  }

  const { name, tasks } = validation.data;
  const id = crypto.randomUUID().slice(0, 8); // Short and sweet ID

  try {
    const docRef = doc(db, 'shared_lists', id);
    await setDoc(docRef, { name, tasks, createdAt: new Date() });
    return { success: true, id };
  } catch (error) {
    console.error("Firebase write error:", error);
    return { success: false, error: 'Could not create share link on the server.' };
  }
}
