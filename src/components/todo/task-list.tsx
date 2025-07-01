"use client";

import React, { useState } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';
import NotificationsStack from './notifications-stack';
import { SausageDogAnimation } from './sausage-dog-animation';
import { isAfter, startOfDay, isBefore } from 'date-fns';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { Button } from '../ui/button';
import { EyeOff } from 'lucide-react';

type TaskListProps = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onUpdateTaskDescription: (id: string, description: string) => void;
  isLoading: boolean;
  centerDate: Date;
};

export default function TaskList({ tasks, onToggleTask, onUpdateTaskDescription, isLoading, centerDate }: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  
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
  const isFutureDate = isAfter(startOfDay(centerDate), startOfDay(new Date()));
  const isPastDate = isBefore(startOfDay(centerDate), startOfDay(new Date()));

  if (allTasksCompleted) {
    return (
      <AnimatePresence mode="wait">
        {!showCompleted ? (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(event, info) => {
              if (info.offset.y > 50) {
                setShowCompleted(true);
              }
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            <NotificationsStack />
          </motion.div>
        ) : (
          <motion.div
            key="completed-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
             <div className="flex justify-end p-2 pb-0">
              <Button variant="ghost" size="sm" onClick={() => setShowCompleted(false)}>
                <EyeOff className="mr-2 h-4 w-4"/>
                Hide
              </Button>
            </div>
            <LayoutGroup>
                <motion.ul className="space-y-2 p-2 md:p-4">
                    {tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                        onUpdateDescription={onUpdateTaskDescription}
                        isOpen={openItemId === task.id}
                        onToggleOpen={setOpenItemId}
                        isFuture={isFutureDate}
                        isPast={isPastDate}
                      />
                    ))}
                </motion.ul>
            </LayoutGroup>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }


  if (tasks.length === 0) {
    if (isFutureDate) {
      return <SausageDogAnimation />;
    }

    return (
      <Card className="shadow-none border-primary/20 transition-all duration-300 hover:border-primary/40">
        <CardContent className="p-10">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">{isPastDate ? "History is written." : "All clear!"}</p>
            <p className="text-sm">{isPastDate ? "No tasks were recorded for this day." : "No tasks for this day."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <LayoutGroup>
        <motion.ul className="space-y-2">
            {tasks.map((task) => (
               <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onUpdateDescription={onUpdateTaskDescription}
                  isOpen={openItemId === task.id}
                  onToggleOpen={setOpenItemId}
                  isFuture={isFutureDate}
                  isPast={isPastDate}
                />
            ))}
        </motion.ul>
    </LayoutGroup>
  );
}
