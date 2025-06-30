
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
import AnimatedList from './animated-list';

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
      <Card className="shadow-none">
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
    <Card className="shadow-none border-primary/20 transition-all duration-300 hover:border-primary/40">
      <CardContent className="p-0">
         <AnimatedList>
            {tasks.map((task, index) => (
              <div key={task.id}>
                <TaskItem task={task} onToggle={onToggleTask} />
                {index < tasks.length - 1 && <Separator />}
              </div>
            ))}
        </AnimatedList>
      </CardContent>
    </Card>
  );
}
