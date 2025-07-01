"use client";

import React, { useState } from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';
import { SausageDogAnimation } from './sausage-dog-animation';
import { isAfter, startOfDay, isBefore } from 'date-fns';
import { Reorder } from 'framer-motion';
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

  const completedTasks = tasks.filter(t => t.completed);
  const incompleteTasks = tasks.filter(t => !t.completed);

  const allIncompleteTasksDone = incompleteTasks.length === 0 && tasks.length > 0;
  const isFutureDate = isAfter(startOfDay(centerDate), startOfDay(new Date()));
  const isPastDate = isBefore(startOfDay(centerDate), startOfDay(new Date()));


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
    <>
      <Reorder.Group as="div" axis="y" values={incompleteTasks} onReorder={onReorder} className="p-2 md:p-4">
          {incompleteTasks.map((task) => (
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
      
      {completedTasks.length > 0 && (
        <CompletedTaskList tasks={completedTasks} />
      )}

      {allIncompleteTasksDone && !isFutureDate && !isPastDate && (
         <div className="text-center p-4">
            <p className="text-lg font-semibold text-foreground">All tasks for today are complete!</p>
            <p className="text-muted-foreground">Great job!</p>
         </div>
      )}
    </>
  );
}
