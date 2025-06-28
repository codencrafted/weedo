"use client";

import React, { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import TaskList from './task-list';
import TaskForm from './task-form';
import { Confetti } from './confetti';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Settings } from 'lucide-react';
import { isSameDay, startOfDay, parseISO, subDays, addDays, format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WeedoLogo } from '@/components/icons';
import { useRouter } from 'next/navigation';

type TodoAppProps = {
  name: string;
};

const formatDateHeader = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'EEE, MMM d');
};


export default function TodoApp({ name }: TodoAppProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [centerDate, setCenterDate] = useState(() => startOfDay(new Date()));
  const [viewMode, setViewMode] = useState<'week' | 'day'>('day');
  const [slideDirection, setSlideDirection] = useState(0);

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
    setViewMode('day'); // Start in day view
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
    setSlideDirection(0);
    setCenterDate(date);
    setViewMode('day');
  };

  const handleDayNavigation = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
          setSlideDirection(-1);
          setCenterDate(subDays(centerDate, 1));
      } else {
          setSlideDirection(1);
          setCenterDate(addDays(centerDate, 1));
      }
  };

  const tapAnimationVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  const navButtonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  const leftArrowVariants = {
    rest: { x: 0 },
    hover: { x: -2 },
  };

  const rightArrowVariants = {
    rest: { x: 0 },
    hover: { x: 2 },
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
       {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <header className="flex justify-between items-center mb-6 py-4">
        <WeedoLogo className="w-8 h-8 text-primary" />
        <div className="flex items-center gap-2">
            {viewMode === 'day' && (
              <motion.button
                className={cn(buttonVariants({ variant: 'ghost' }), "relative overflow-hidden gap-0 hover:bg-transparent")}
                onClick={() => {
                  setSlideDirection(0);
                  setViewMode('week');
                }}
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <motion.div
                    className="overflow-hidden whitespace-nowrap"
                    variants={{
                        rest: { width: 0, opacity: 0, marginLeft: 0 },
                        hover: { width: 'auto', opacity: 1, marginLeft: '0.5rem' }
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    Week View
                </motion.div>
              </motion.button>
            )}
             <motion.div
                variants={tapAnimationVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={() => router.push('/settings')}
                className="cursor-pointer"
             >
                <Button variant="ghost" size="icon" aria-label="Settings" className="hover:bg-transparent">
                    <Settings className="h-5 w-5" />
                </Button>
            </motion.div>
        </div>
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
                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={navButtonVariants}>
                      <Button variant="outline" size="icon" onClick={() => handleDayNavigation('prev')} aria-label="Previous Day">
                          <motion.div variants={leftArrowVariants}>
                            <ChevronLeft />
                          </motion.div>
                      </Button>
                    </motion.div>
                    <div className="relative h-10 w-64 flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.h2
                          key={centerDate.toISOString()}
                          className="text-2xl font-bold text-center cursor-pointer hover:underline"
                          onClick={() => {
                            setSlideDirection(0);
                            setCenterDate(startOfDay(new Date()))
                          }}
                          title="Go to Today"
                          initial={{ opacity: 0, x: slideDirection * 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -slideDirection * 40 }}
                          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {formatDateHeader(centerDate)}
                        </motion.h2>
                      </AnimatePresence>
                    </div>
                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={navButtonVariants}>
                      <Button variant="outline" size="icon" onClick={() => handleDayNavigation('next')} aria-label="Next Day">
                           <motion.div variants={rightArrowVariants}>
                            <ChevronRight />
                          </motion.div>
                      </Button>
                    </motion.div>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={centerDate.toISOString()}
                    initial={{ opacity: 0, x: slideDirection * 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -slideDirection * 30 }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
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
