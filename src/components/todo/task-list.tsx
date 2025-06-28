"use client";

import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { isToday, isTomorrow, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

type TaskListProps = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  isLoading: boolean;
};

export default function TaskList({ tasks, onToggleTask, isLoading }: TaskListProps) {

  const categorizedTasks = useMemo(() => {
    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const yesterday: Task[] = [];
    
    const now = new Date();
    tasks.forEach(task => {
      try {
        const date = parseISO(task.createdAt);
        if (isToday(date)) {
          today.push(task);
        } else if (isTomorrow(date)) {
          tomorrow.push(task);
        } else if (date < now) {
          yesterday.push(task);
        }
      } catch (error) {
        // Fallback for invalid date
        today.push(task);
      }
    });

    // Sort yesterday's tasks from newest to oldest
    yesterday.sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());

    return { today, tomorrow, yesterday };
  }, [tasks]);
  
  if (isLoading) {
    return (
      <div className="flex justify-around">
          <div className="w-1/3 px-4 space-y-3" />
          <div className="w-1/3 px-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="w-1/3 px-4 space-y-3" />
      </div>
    );
  }

  return (
    <div className="flex justify-around items-start">
      <div className="w-1/3 px-4 space-y-3">
        {categorizedTasks.yesterday.map(task => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
      <div className="w-1/3 px-4 space-y-3">
        {categorizedTasks.today.map(task => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
      <div className="w-1/3 px-4 space-y-3">
        {categorizedTasks.tomorrow.map(task => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
    </div>
  );
}
