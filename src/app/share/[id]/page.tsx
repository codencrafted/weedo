import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ImportView from '@/components/share/import-view';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { Task } from '@/lib/types';

type SharePageProps = {
  params: { id: string };
};

type ShareData = {
  name: string;
  tasks: Task[];
};

async function getShareData(id: string): Promise<ShareData | null> {
  try {
    const docRef = doc(db, 'shared_lists', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // We need to handle Firestore Timestamps if they exist
      const data = docSnap.data();
      const tasks = data.tasks.map((task: any) => ({
        ...task,
        createdAt: task.createdAt, // Assuming createdAt is stored as an ISO string
      }));
      return { ...data, tasks } as ShareData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Firebase read error:", error);
    return null;
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const data = await getShareData(params.id);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {data ? (
        <ImportView name={data.name} tasks={data.tasks} />
      ) : (
        <Card className="max-w-md w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Link Not Found</CardTitle>
                 <CardDescription>
                    The share link you are trying to access is either invalid or has expired. Please ask for a new link.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
