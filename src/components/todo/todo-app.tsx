"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Task } from '@/lib/types';
import TaskForm from './task-form';
import TaskList from './task-list';
import { Button } from '@/components/ui/button';
import { WeedoLogo } from '@/components/icons';
import { LogOut } from 'lucide-react';

type TodoAppProps = {
  name: string;
  onLogout: () => void;
};

export default function TodoApp({ name, onLogout }: TodoAppProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('weedo-tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Could not parse tasks from local storage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('weedo-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks to local storage", error);
    }
  }, [tasks]);

  const addTask = (text: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <WeedoLogo className="w-10 h-10 text-primary hidden sm:block" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {getGreeting}, {name}!
            </h1>
            <p className="text-muted-foreground">Here are your tasks.</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Log out">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>
      
      <main>
        <div className="mb-8">
          <TaskForm onAddTask={addTask} />
        </div>
        
        <TaskList
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
