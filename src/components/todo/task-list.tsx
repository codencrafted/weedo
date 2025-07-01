"use client";

import React, { useState } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';
import { SausageDogAnimation } from './sausage-dog-animation';
import { isAfter, startOfDay, isBefore } from 'date-fns';
import { motion, Reorder } from 'framer-motion';
import CompletedTaskList from './completed-task-list';

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
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const allTasksCompleted = tasks.length > 0 && tasks.every(task => task.completed);
  const isFutureDate = isAfter(startOfDay(centerDate), startOfDay(new Date()));
  const isPastDate = isBefore(startOfDay(centerDate), startOfDay(new Date()));

  if (allTasksCompleted) {
    return <CompletedTaskList tasks={tasks} />;
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
              isPast={isPastDate}
            />
        ))}
    </Reorder.Group>
  );
}
