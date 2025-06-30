"use client";

import { useState, useEffect } from 'react';
import NamePrompt from '@/components/todo/name-prompt';
import TodoApp from '@/components/todo/todo-app';
import InitialTasks from '@/components/todo/initial-tasks';
import type { Task } from '@/lib/types';
import { LoadingAnimation } from '@/components/todo/typewriter-animation';

type View = 'loading' | 'name' | 'tasks' | 'app';

export default function Home() {
  const [name, setName] = useState<string | null>(null);
  const [view, setView] = useState<View>('loading');
  const [isFirstSession, setIsFirstSession] = useState(false);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('weedo-name');
      const tasksInitialized = localStorage.getItem('weedo-tasks-initialized');

      if (storedName) {
        setName(storedName);
        if (tasksInitialized) {
          setView('app');
        } else {
          setView('tasks');
        }
      } else {
        setView('name');
      }
    } catch (error) {
      console.error("Could not access local storage", error);
      setView('name'); // Fallback
    }
  }, []);

  const handleNameSet = (newName: string) => {
    try {
      if (newName.trim()) {
        const trimmedName = newName.trim();
        localStorage.setItem('weedo-name', trimmedName);
        setName(trimmedName);
        setView('tasks');
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  };

  const handleTasksSet = (tasks: Task[]) => {
    try {
      localStorage.setItem('weedo-tasks', JSON.stringify(tasks));
      localStorage.setItem('weedo-tasks-initialized', 'true');
      setIsFirstSession(true);
      setView('app');
    } catch (error) {
      console.error("Could not save tasks to local storage", error);
    }
  };

  if (view === 'loading') {
    return <LoadingAnimation />;
  }

  return (
    <main className="min-h-screen bg-background font-body">
      {view === 'name' && <NamePrompt onNameSet={handleNameSet} />}
      {view === 'tasks' && name && <InitialTasks name={name} onTasksSet={handleTasksSet} />}
      {view === 'app' && name && <TodoApp name={name} isFirstSession={isFirstSession} />}
    </main>
  );
}
