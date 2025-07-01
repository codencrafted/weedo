'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingAnimation } from '@/components/todo/typewriter-animation';

type SyncPageProps = {
  params: { id: string };
};

export default function SyncPage({ params }: SyncPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      try {
        // Overwrite any existing user ID. This is how a new device gets synced.
        localStorage.setItem('weedo-user-id', params.id);
        
        // Remove old data to prevent confusion or merging issues
        localStorage.removeItem('weedo-name');
        localStorage.removeItem('weedo-tasks');
        localStorage.removeItem('weedo-tasks-initialized');

        router.push('/');
      } catch (error) {
        console.error("Could not access local storage to sync", error);
        // Fallback or show an error message
        router.push('/');
      }
    } else {
        // If no ID is provided, just go home.
        router.push('/');
    }
  }, [params.id, router]);

  return <LoadingAnimation />;
}
