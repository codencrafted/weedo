"use client";

import React, { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import TaskList from './task-list';
import TaskForm from './task-form';
import { Confetti } from './confetti';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { isSameDay, startOfDay, parseISO, subDays, addDays, format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [viewMode, setViewMode] = useState<'week' | 'day'>('day');

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

  const selectedDayTasks = tasks
    .filter(task => {
      try {
        return isSameDay(parseISO(task.createdAt), centerDate);
      } catch {
        return false;
      }
    })
    .sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

  const handleHeaderClick = (date: Date) => {
    setCenterDate(date);
    setViewMode('day');
  };

  const handleDayNavigation = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
          setCenterDate(subDays(centerDate, 1));
      } else {
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
          <AnimatePresence mode="wait">
            {viewMode === 'week' ? (
              <motion.div
                key="week"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                  {visibleDates.map((date, index) => (
                      <div key={date.toISOString()}>
                          <h2 
                              className="text-xl font-bold text-center mb-4 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                              onClick={() => handleHeaderClick(date)}
                              title={`View tasks for ${format(date, 'PPP')}`}
                          >
                              {formatDateHeader(date)}
                          </h2>
                          <TaskList tasks={dailyTasks[index]} onToggleTask={toggleTask} isLoading={isLoading} />
                      </div>
                  ))}
              </motion.div>
            ) : (
              <motion.div
                key="day"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex justify-between items-center mb-4">
                    <Button variant="outline" size="icon" onClick={() => handleDayNavigation('prev')} aria-label="Previous Day">
                        <ChevronLeft />
                    </Button>
                    <h2 
                      className="text-2xl font-bold text-center cursor-pointer hover:underline"
                      onClick={() => setCenterDate(startOfDay(new Date()))}
                      title="Go to Today"
                    >
                        {formatDateHeader(centerDate)}
                    </h2>
                    <Button variant="outline" size="icon" onClick={() => handleDayNavigation('next')} aria-label="Next Day">
                        <ChevronRight />
                    </Button>
                </div>
                <div className="flex justify-center mb-6">
                    <Button variant="ghost" onClick={() => setViewMode('week')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Back to Week View
                    </Button>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={centerDate.toISOString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TaskList tasks={selectedDayTasks} onToggleTask={toggleTask} isLoading={isLoading} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      <footer className="mt-auto pt-8">
        {viewMode === 'day' && <TaskForm onAddTask={addTask} />}
      </footer>
    </div>
  );
}
