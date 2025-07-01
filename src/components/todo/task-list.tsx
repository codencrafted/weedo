"use client";

import React, { useState } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { Skeleton } from '../ui/skeleton';
import { SausageDogAnimation } from './sausage-dog-animation';
import { isAfter, startOfDay } from 'date-fns';
import { Reorder } from 'framer-motion';

type TaskListProps = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onUpdateTaskDescription: (id: string, description: string) => void;
  isLoading: boolean;
  centerDate: Date;
  onReorder: (tasks: Task[]) => void;
};

export default function TaskList({ tasks, onToggleTask, onUpdateTaskDescription, isLoading, centerDate, onReorder }: TaskListProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const isFutureDate = isAfter(startOfDay(centerDate), startOfDay(new Date()));

  if (tasks.length === 0) {
    if (isFutureDate) {
      return <SausageDogAnimation />;
    }
    return null;
  }

  return (
    <Reorder.Group as="div" axis="y" values={tasks} onReorder={onReorder} className="p-2 md:p-4">
        {tasks.map((task) => (
           <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onUpdateDescription={onUpdateTaskDescription}
              isOpen={openItemId === task.id}
              onToggleOpen={setOpenItemId}
              isFuture={isFutureDate}
              isPast={!isFutureDate && !isToday(centerDate)}
            />
        ))}
    </Reorder.Group>
  );
}
function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}
