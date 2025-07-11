"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Task } from '@/lib/types';
import TaskList from './task-list';
import TaskForm from './task-form';
import CompletedTaskList from './completed-task-list';
import { Confetti } from './confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Settings, LineChart } from 'lucide-react';
import { isSameDay, startOfDay, parseISO, subDays, addDays, format, isToday, isYesterday, isTomorrow, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { WeedoLogo } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { useToast } from "@/hooks/use-toast";

type TodoAppProps = {
  userId: string;
};

const formatDateHeader = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'EEE, MMM d');
};

export default function TodoApp({ userId }: TodoAppProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [centerDate, setCenterDate] = useState<Date | null>(null);
  const [slideDirection, setSlideDirection] = useState(0);

  const scrollRef = useRef<HTMLElement>(null);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  useEffect(() => {
    // Set date only on the client to avoid hydration mismatch
    setCenterDate(startOfDay(new Date()));
  }, []);

  // This effect handles the daily task initialization
  useEffect(() => {
    if (!userId || !centerDate) return;

    const initializeDailyTasks = async () => {
        const dateStr = format(centerDate, 'yyyy-MM-dd');
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) return;

        const data = userDoc.data();
        const initializedDays = data.initializedDays || [];
        const dailyTasks: string[] = data.dailyTasks || [];

        // Only initialize for today or future dates, and only if not already initialized.
        const isPast = isBefore(startOfDay(centerDate), startOfDay(new Date()));
        if (dailyTasks.length > 0 && !initializedDays.includes(dateStr) && !isPast) {
            
            const newTasksForDay = dailyTasks.map((taskText: string) => ({
                id: crypto.randomUUID(),
                text: taskText,
                completed: false,
                createdAt: centerDate.toISOString(),
                description: '',
            }));

            const allTasks = [...(data.tasks || []), ...newTasksForDay];
            const newInitializedDays = [...initializedDays, dateStr];
            
            await updateDoc(userDocRef, {
                tasks: allTasks,
                initializedDays: newInitializedDays,
            });
        }
    };

    initializeDailyTasks().catch(err => {
        console.error("Failed to initialize daily tasks:", err);
        toast({ variant: 'destructive', title: 'Initialization Error', description: 'Could not set up daily tasks.' });
    });
  }, [userId, centerDate, toast]);

  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, 'users', userId);
    
    getDoc(userDocRef).then(docSnap => {
        if (!docSnap.exists()) {
            console.error("User document does not exist. Redirecting.");
            localStorage.removeItem('weedo-user-id');
            router.push('/');
        }
    }).catch(error => {
        console.error("Error checking user document:", error);
    });

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        const dbTasks = data.tasks || [];
        setTasks(dbTasks);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Firestore snapshot error:", error);
        toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not connect to the database.' });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId, router, toast]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    );
  };

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setTopGradientOpacity(Math.min(scrollTop / 50, 1));
        const bottomDistance = scrollHeight - (scrollTop + clientHeight);
        setBottomGradientOpacity(
          scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
        );
      }
    };
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [isLoading, centerDate, tasks]);

  const updateTasksInDb = async (newTasks: Task[]) => {
    if (!userId) return;
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { tasks: newTasks });
  };

  const toggleTask = (id: string, withEffects = true) => {
    const taskToToggle = tasks.find(t => t.id === id);
    if (!taskToToggle) return;

    const isCompleting = !taskToToggle.completed;

    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateTasksInDb(updatedTasks);
  
    if (isCompleting && withEffects) {
      setShowConfetti(true);
    }
  };

  const addTask = (text: string) => {
    if (!centerDate) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: centerDate.toISOString(),
      description: '',
    };
    const newTasks = [newTask, ...tasks];
    updateTasksInDb(newTasks);
  };
  
  const updateTaskDescription = (id: string, description: string) => {
    const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, description } : task
    );
    updateTasksInDb(updatedTasks);
  };

  const tasksForDay = tasks
    .filter(task => {
      try {
        return isSameDay(parseISO(task.createdAt), centerDate ?? new Date());
      } catch {
        return false;
      }
    });
  
  const incompleteTasks = tasksForDay.filter(task => !task.completed);
  const completedTasks = tasksForDay.filter(task => task.completed);

  const handleDayNavigation = (direction: 'prev' | 'next') => {
      if (!centerDate) return;
      if (direction === 'prev') {
          setSlideDirection(-1);
          setCenterDate(subDays(centerDate, 1));
      } else {
          setSlideDirection(1);
          setCenterDate(addDays(centerDate, 1));
      }
  };

  const handleReorder = (reorderedIncompleteTasks: Task[]) => {
    if (!centerDate) return;
    const tasksFromOtherDays = tasks.filter(task => {
      try {
        return !isSameDay(parseISO(task.createdAt), centerDate);
      } catch {
        return false;
      }
    });
    const newTasks = [...reorderedIncompleteTasks, ...completedTasks, ...tasksFromOtherDays];
    setTasks(newTasks); // Optimistic update
    updateTasksInDb(newTasks);
  };
  
  const navButtonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  if (!centerDate || isLoading) {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
            <header className="flex justify-between items-center mb-6 py-4">
                <Skeleton className="w-10 h-10 rounded-md" />
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            </header>
            <main className="flex-grow mt-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <Skeleton className="w-10 h-10 rounded-md" />
                        <Skeleton className="h-8 w-48 rounded-md" />
                        <Skeleton className="w-10 h-10 rounded-md" />
                    </div>
                    <div className="space-y-4 pt-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
            </main>
            <footer className="mt-auto pt-8 z-20"><Skeleton className="h-16 w-full" /></footer>
        </div>
    );
  }

  const leftArrowVariants = { rest: { x: 0 }, hover: { x: -2 } };
  const rightArrowVariants = { rest: { x: 0 }, hover: { x: 2 } };
  const isPastDate = isBefore(startOfDay(centerDate), startOfDay(new Date()));
  const isFutureDate = !isToday(centerDate) && !isPastDate;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
       {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <header className="flex justify-between items-center mb-6 py-4">
        <WeedoLogo className="w-10 h-10 text-primary" />
        <div className="flex items-center gap-2">
             <motion.div variants={navButtonVariants} initial="rest" whileHover="hover" whileTap="tap" onClick={() => router.push('/analytics')} className="cursor-pointer">
                <Button variant="ghost" size="icon" aria-label="Analytics" className="hover:bg-transparent"><LineChart className="h-6 w-6" /></Button>
            </motion.div>
             <motion.div variants={navButtonVariants} initial="rest" whileHover="hover" whileTap="tap" onClick={() => router.push('/settings')} className="cursor-pointer">
                <Button variant="ghost" size="icon" aria-label="Settings" className="hover:bg-transparent"><Settings className="h-6 w-6" /></Button>
            </motion.div>
        </div>
      </header>
      
        <main ref={scrollRef} onScroll={handleScroll} className="flex-grow mt-6 overflow-y-auto custom-scrollbar relative">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={navButtonVariants}>
                      <Button variant="outline" size="icon" onClick={() => handleDayNavigation('prev')} aria-label="Previous Day">
                          <motion.div variants={leftArrowVariants}><ChevronLeft /></motion.div>
                      </Button>
                    </motion.div>
                    <div className="relative h-10 w-64 flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.h2
                          key={centerDate.toISOString()}
                          className="text-2xl font-bold text-center cursor-pointer hover:underline"
                          onClick={() => { setSlideDirection(0); setCenterDate(startOfDay(new Date())) }}
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
                           <motion.div variants={rightArrowVariants}><ChevronRight /></motion.div>
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
                      tasks={incompleteTasks}
                      onToggleTask={toggleTask}
                      onUpdateTaskDescription={updateTaskDescription}
                      isLoading={isLoading}
                      centerDate={centerDate}
                      onReorder={handleReorder}
                    />

                    {tasksForDay.length === 0 && !isFutureDate && (
                      <Card className="shadow-none border-primary/20 transition-all duration-300 hover:border-primary/40">
                        <CardContent className="p-10">
                          <div className="text-center text-muted-foreground">
                            <p className="text-lg">{isPastDate ? "History is written." : "All clear!"}</p>
                            <p className="text-sm">{isPastDate ? "No tasks were recorded for this day." : "Add a task to get started."}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {incompleteTasks.length === 0 && completedTasks.length > 0 && !isFutureDate && (
                      <div className="text-center p-4">
                        <p className="text-lg font-semibold text-foreground">All tasks for today are complete!</p>
                        <p className="text-muted-foreground">Great job!</p>
                      </div>
                    )}
                    
                    <CompletedTaskList
                      tasks={completedTasks}
                      onToggleTask={toggleTask}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
               <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none transition-opacity duration-300 ease-in-out" style={{ opacity: topGradientOpacity }} />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none transition-opacity duration-300 ease-in-out z-10" style={{ opacity: bottomGradientOpacity }} />
        </main>

      <footer className="mt-auto pt-8 z-20">
        <TaskForm onAddTask={addTask} />
      </footer>
    </div>
  );
}
