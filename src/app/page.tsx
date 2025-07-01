"use client";

import { useState, useEffect } from 'react';
import NamePrompt from '@/components/todo/name-prompt';
import TodoApp from '@/components/todo/todo-app';
import { LoadingAnimation } from '@/components/todo/typewriter-animation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type View = 'loading' | 'name' | 'app';

export default function Home() {
  const [view, setView] = useState<View>('loading');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        let id = localStorage.getItem('weedo-user-id');
        
        if (id) {
          const userDoc = await getDoc(doc(db, 'users', id));
          if (userDoc.exists()) {
            setUserId(id);
            setView('app');
          } else {
            // Data inconsistency (e.g., cleared DB but not local storage), so we start over.
            localStorage.removeItem('weedo-user-id');
            setView('name');
          }
        } else {
          setView('name');
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        setView('name'); // Fallback on error
      }
    };

    initializeUser();
  }, []);

  const handleNameSet = (newUserId: string) => {
    try {
      localStorage.setItem('weedo-user-id', newUserId);
      setUserId(newUserId);
      setView('app');
    } catch (error) {
      console.error("Could not access local storage for user ID", error);
    }
  };

  if (view === 'loading') {
    return <LoadingAnimation />;
  }

  return (
    <main className="min-h-screen bg-background font-body">
      {view === 'name' && <NamePrompt onNameSet={handleNameSet} />}
      {view === 'app' && userId && <TodoApp userId={userId} />}
    </main>
  );
}
