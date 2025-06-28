
"use client";

import React from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import CoffeeAnimation from './coffee-animation';

type TaskListProps = {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  isLoading: boolean;
};

export default function TaskList({ tasks, onToggleTask, isLoading }: TaskListProps) {
  
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
    return <CoffeeAnimation />;
  }

  if (tasks.length === 0) {
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
      <CardContent className="p-2 md:p-4">
        <div className="flex flex-col">
            {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
                <TaskItem task={task} onToggle={onToggleTask} />
                {index < tasks.length - 1 && <Separator />}
            </React.Fragment>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
