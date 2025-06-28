"use client";

import React, { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import TaskList from './task-list';
import TaskForm from './task-form';
import { Confetti } from './confetti';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { isSameDay, startOfDay, parseISO, subDays, addDays, format, isToday, isYesterday, isTomorrow } from 'date-fns';

type TodoAppProps = {
  name: string;
  onLogout: () => void;
};

const formatDateHeader = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'EEE, MMM d');
};


export default function TodoApp({ name, onLogout }: TodoAppProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [centerDate, setCenterDate] = useState(() => startOfDay(new Date()));

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
        { id: crypto.randomUUID(), text: 'Review project proposal', completed: true, createdAt: subDays(now, 1).toISOString() },
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
      createdAt: centerDate.toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const visibleDates = [
      subDays(centerDate, 1),
      centerDate,
      addDays(centerDate, 1)
  ];

  const dailyTasks = visibleDates.map(date => 
    tasks
      .filter(task => {
        try {
          return isSameDay(parseISO(task.createdAt), date);
        } catch {
          return false;
        }
      })
      .sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1)
  );

  const handleHeaderClick = (index: number) => {
    if (index === 0) {
        setCenterDate(subDays(centerDate, 1));
    } else if (index === 1) {
        setCenterDate(startOfDay(new Date()));
    } else if (index === 2) {
        setCenterDate(addDays(centerDate, 1));
    }
  };


  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
       {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <header className="flex justify-between items-center mb-6 py-4">
        <h1 className="text-3xl font-bold text-foreground">
          Hi, {name}!
        </h1>
        <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>
      
        <main className="flex-grow mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {visibleDates.map((date, index) => (
                    <div key={date.toISOString()}>
                        <h2 
                            className="text-xl font-bold text-center mb-4 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => handleHeaderClick(index)}
                            title={index === 0 ? "Previous Day" : index === 1 ? "Go to Today" : "Next Day"}
                        >
                            {formatDateHeader(date)}
                        </h2>
                        <TaskList tasks={dailyTasks[index]} onToggleTask={toggleTask} isLoading={isLoading} />
                    </div>
                ))}
            </div>
        </main>

      <footer className="mt-auto pt-8">
        <TaskForm onAddTask={addTask} />
      </footer>
    </div>
  );
}
