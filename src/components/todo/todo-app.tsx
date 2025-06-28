"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Task } from '@/lib/types';
import TaskList from './task-list';
import TaskForm from './task-form';
import { Confetti } from './confetti';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut } from 'lucide-react';
import { isSameDay, startOfDay, parseISO, subDays, addDays } from 'date-fns';

type TodoAppProps = {
  name: string;
  onLogout: () => void;
};

export default function TodoApp({ name, onLogout }: TodoAppProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

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
      const now = new Date();
      initialTasks = [
        { id: crypto.randomUUID(), text: 'Review project proposal', completed: true, createdAt: subDays(now, 2).toISOString() },
        { id: crypto.randomUUID(), text: 'Call the vet', completed: false, createdAt: subDays(now, 1).toISOString() },
        { id: crypto.randomUUID(), text: 'Finish the design mockups', completed: false, createdAt: now.toISOString() },
        { id: crypto.randomUUID(), text: 'Go for a run', completed: true, createdAt: now.toISOString() },
        { id: crypto.randomUUID(), text: 'Buy groceries', completed: false, createdAt: now.toISOString() },
        { id: crypto.randomUUID(), text: 'Team meeting', completed: false, createdAt: addDays(now, 1).toISOString() },
        { id: crypto.randomUUID(), text: 'Doctor\'s appointment', completed: false, createdAt: addDays(now, 2).toISOString() },
        { id: crypto.randomUUID(), text: 'Plan weekend trip', completed: false, createdAt: addDays(now, 4).toISOString() },
      ];
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
    const taskToToggle = tasks.find(t => t.id === id);
    if (taskToToggle && !taskToToggle.completed) {
      setShowConfetti(true);
    }
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = (text: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const categorizedTasks = useMemo(() => {
    const categories: { [key: string]: Task[] } = {
        yesterday: [],
        today: [],
        tomorrow: [],
        upcoming: [],
    };

    const now = startOfDay(new Date());
    const tomorrowDate = addDays(now, 1);

    tasks.forEach(task => {
        try {
            const taskDate = startOfDay(parseISO(task.createdAt));
            if (isSameDay(taskDate, now)) {
                categories.today.push(task);
            } else if (isSameDay(taskDate, tomorrowDate)) {
                categories.tomorrow.push(task);
            } else if (taskDate < now) {
                categories.yesterday.push(task);
            } else {
                categories.upcoming.push(task);
            }
        } catch {
            categories.today.push(task);
        }
    });

    for (const key in categories) {
        categories[key].sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
    }

    return categories;
  }, [tasks]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
       {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <header className="flex justify-between items-center mb-6 py-4">
        <h1 className="text-3xl font-bold text-foreground">
          Hi, {name}!
        </h1>
        <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>
      
        <Tabs defaultValue="today" className="w-full flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
             <main className="flex-grow mt-6">
                <TabsContent value="yesterday">
                    <TaskList tasks={categorizedTasks.yesterday} onToggleTask={toggleTask} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="today">
                    <TaskList tasks={categorizedTasks.today} onToggleTask={toggleTask} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="tomorrow">
                    <TaskList tasks={categorizedTasks.tomorrow} onToggleTask={toggleTask} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="upcoming">
                    <TaskList tasks={categorizedTasks.upcoming} onToggleTask={toggleTask} isLoading={isLoading} />
                </TabsContent>
             </main>
        </Tabs>

      <footer className="mt-auto pt-8">
        <TaskForm onAddTask={addTask} />
      </footer>
    </div>
  );
}
