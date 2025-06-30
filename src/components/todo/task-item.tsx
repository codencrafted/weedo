"use client";

import type { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
};

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  const handleToggle = () => {
    onToggle(task.id);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 transition-opacity duration-400",
        task.completed ? 'opacity-60' : 'opacity-100'
      )}
    >
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          "flex-grow text-lg transition-colors duration-300 cursor-pointer pr-4",
          task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
        )}
      >
        {task.text}
      </label>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={handleToggle}
        className="w-6 h-6 shrink-0"
        aria-label={`Mark task "${task.text}" as ${task.completed ? 'not completed' : 'completed'}`}
      />
    </div>
  );
}
