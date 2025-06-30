
"use client";

import React from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import WaterBreakAnimation from './coffee-animation';
import { SausageDogAnimation } from './sausage-dog-animation';
import { isAfter, startOfDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from '../ui/scroll-area';

type TaskListProps = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  isLoading: boolean;
  centerDate: Date;
};

export default function TaskList({ tasks, onToggleTask, isLoading, centerDate }: TaskListProps) {
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.completed);

  if (allTasksCompleted) {
    return <WaterBreakAnimation />;
  }

  if (tasks.length === 0) {
    const isFutureDate = isAfter(startOfDay(centerDate), startOfDay(new Date()));

    if (isFutureDate) {
      return <SausageDogAnimation />;
    }

    return (
      <Card>
        <CardContent className="p-10">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">All clear!</p>
            <p className="text-sm">No tasks for this day.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[45vh] w-full">
            <motion.div layout className="flex flex-col p-2 md:p-4">
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.5 } }}
                    exit={{ opacity: 0, height: 0, y: -20, transition: { type: 'spring', bounce: 0, duration: 0.3 } }}
                  >
                    <TaskItem task={task} onToggle={onToggleTask} />
                    {index < tasks.length - 1 && <Separator />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
