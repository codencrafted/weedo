"use client";

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import TaskList from './task-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let initialTasks: Task[] = [];
    try {
      const storedTasks = localStorage.getItem('weedo-tasks');
      if (storedTasks) {
        initialTasks = JSON.parse(storedTasks);
      }
    } catch (error) {
      console.error("Could not parse tasks from local storage", error);
      initialTasks = [];
    }

    if (initialTasks.length === 0) {
      initialTasks = Array.from({ length: 8 }).map((_, i) => ({
        id: crypto.randomUUID(),
        text: 'gym',
        completed: i > 5, // Mark some as completed for visual variety
        createdAt: new Date().toISOString(),
      }));
    }
    
    setTasks(initialTasks);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('weedo-tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Could not save tasks to local storage", error);
      }
    }
  }, [tasks, isLoading]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
      <header className="flex justify-around items-center mb-6 py-4 text-center">
        <h1 className="text-xl font-bold text-muted-foreground w-1/3">Yesterday</h1>
        <h1 className="text-2xl font-bold text-foreground w-1/3">Today</h1>
        <h1 className="text-xl font-bold text-muted-foreground w-1/3">Tomorrow</h1>
      </header>
      
      <main className="flex-grow">
        <TaskList
          tasks={tasks}
          onToggleTask={toggleTask}
          isLoading={isLoading}
        />
      </main>

      <footer className="mt-auto pt-8">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">ai advisor</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground">you have time to do other tasy the gym time start now</p>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
