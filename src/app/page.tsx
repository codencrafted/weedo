"use client";

import { useState, useEffect } from 'react';
import NamePrompt from '@/components/todo/name-prompt';
import TodoApp from '@/components/todo/todo-app';
import { Skeleton } from '@/components/ui/skeleton';
import { WeedoLogo } from '@/components/icons';

export default function Home() {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('weedo-name');
      if (storedName) {
        setName(storedName);
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    } finally {
      // Add a small delay to prevent UI flicker
      setTimeout(() => setIsLoading(false), 300);
    }
  }, []);

  const handleNameSet = (newName: string) => {
    try {
      if (newName.trim()) {
        localStorage.setItem('weedo-name', newName.trim());
        setName(newName.trim());
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-md p-8 space-y-6">
          <div className="flex justify-center mb-4">
             <WeedoLogo className="w-16 h-16 text-primary" />
          </div>
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-24 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background font-body">
      {name ? <TodoApp name={name} /> : <NamePrompt onNameSet={handleNameSet} />}
    </main>
  );
}
