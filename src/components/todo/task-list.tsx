"use client";

import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { isToday, isTomorrow, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { FileText } from 'lucide-react';

type TaskListProps = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  isLoading: boolean;
};

export default function TaskList({ tasks, onToggleTask, onDeleteTask, isLoading }: TaskListProps) {

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
  
  const renderTaskSection = (title: string, taskList: Task[]) => {
    if (taskList.length === 0) return null;
    return (
      <section className="mb-8" aria-labelledby={title.toLowerCase()}>
        <h2 id={title.toLowerCase()} className="text-lg font-semibold text-muted-foreground mb-3">{title}</h2>
        <div className="space-y-3">
          {taskList.map(task => (
            <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
          ))}
        </div>
      </section>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const allTasksEmpty = Object.values(categorizedTasks).every(list => list.length === 0);

  if (allTasksEmpty) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">All clear!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You have no tasks. Add one above to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      {renderTaskSection('Today', categorizedTasks.today)}
      {renderTaskSection('Tomorrow', categorizedTasks.tomorrow)}
      {renderTaskSection('Yesterday', categorizedTasks.yesterday)}
    </div>
  );
}
