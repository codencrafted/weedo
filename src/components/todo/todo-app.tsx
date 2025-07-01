"use client";

import React, { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import TaskList from './task-list';
import TaskForm from './task-form';
import { Confetti } from './confetti';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Settings, LineChart } from 'lucide-react';
import { isSameDay, startOfDay, parseISO, subDays, addDays, format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { WeedoLogo } from '@/components/icons';
import { useRouter } from 'next/navigation';

type TodoAppProps = {
  name: string;
  isFirstSession?: boolean;
};

const formatDateHeader = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'EEE, MMM d');
};


export default function TodoApp({ name, isFirstSession = false }: TodoAppProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [centerDate, setCenterDate] = useState(() => startOfDay(new Date()));
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
      const allTasksForDay = tasks.filter(t => isSameDay(parseISO(t.createdAt), centerDate));
      const completedTasksForDay = allTasksForDay.filter(t => t.completed).length;
      
      if (completedTasksForDay + 1 === allTasksForDay.length) {
         setShowConfetti(true);
      }
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
      description: '',
    };
    setTasks([newTask, ...tasks]);
  };
  
  const updateTaskDescription = (id: string, description: string) => {
    setTasks(currentTasks =>
        currentTasks.map(task =>
            task.id === id ? { ...task, description } : task
        )
    );
  };

  const selectedDayTasks = tasks
    .filter(task => {
      try {
        return isSameDay(parseISO(task.createdAt), centerDate);
      } catch {
        return false;
      }
    })
    .sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

  const handleDayNavigation = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
          setSlideDirection(-1);
          setCenterDate(subDays(centerDate, 1));
      } else {
          setSlideDirection(1);
          setCenterDate(addDays(centerDate, 1));
      }
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

  const isPrevDisabled = isFirstSession && isToday(centerDate);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
       {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <header className="flex justify-between items-center mb-6 py-4">
        <WeedoLogo className="w-10 h-10 text-primary" />
        <div className="flex items-center gap-2">
             <motion.div
                variants={navButtonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={() => router.push('/analytics')}
                className="cursor-pointer"
             >
                <Button variant="ghost" size="icon" aria-label="Analytics" className="hover:bg-transparent">
                    <LineChart className="h-6 w-6" />
                </Button>
            </motion.div>
             <motion.div
                variants={navButtonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={() => router.push('/settings')}
                className="cursor-pointer"
             >
                <Button variant="ghost" size="icon" aria-label="Settings" className="hover:bg-transparent">
                    <Settings className="h-6 w-6" />
                </Button>
            </motion.div>
        </div>
      </header>
      
        <main className="flex-grow mt-6">
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
                      <Button variant="outline" size="icon" onClick={() => handleDayNavigation('prev')} aria-label="Previous Day" disabled={isPrevDisabled}>
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
                    <TaskList
                      tasks={selectedDayTasks}
                      onToggleTask={toggleTask}
                      onUpdateTaskDescription={updateTaskDescription}
                      isLoading={isLoading}
                      centerDate={centerDate}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
        </main>

      <footer className="mt-auto pt-8">
        <TaskForm onAddTask={addTask} />
      </footer>
    </div>
  );
}
