"use client";

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
};

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  const [isDone, setIsDone] = useState(task.completed);

  const handleToggle = () => {
    const newIsDone = !isDone;
    setIsDone(newIsDone);
    onToggle(task.id);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          "flex-grow text-lg transition-colors duration-300 cursor-pointer pr-4",
          isDone ? 'text-muted-foreground line-through' : 'text-foreground'
        )}
      >
        {task.text}
      </label>
      <Checkbox
        id={`task-${task.id}`}
        checked={isDone}
        onCheckedChange={handleToggle}
        className="w-6 h-6 shrink-0"
        aria-label={`Mark task "${task.text}" as ${isDone ? 'not completed' : 'completed'}`}
      />
    </div>
  );
}
