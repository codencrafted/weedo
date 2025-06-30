
"use client";

import type { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'framer-motion';

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  isFuture: boolean;
  isPast: boolean;
};

export default function TaskItem({ task, onToggle, isFuture, isPast }: TaskItemProps) {
  const [isShaking, setIsShaking] = useState(false);

  const handleToggle = () => {
    if (isFuture || isPast) {
      setIsShaking(true);
      return;
    }
    onToggle(task.id);
  };
  
  const shakeVariants = {
    shake: {
      rotate: [0, -1.5, 1.5, -1.5, 1.5, 0],
      x: [0, -3, 3, -3, 3, 0],
      transition: {
        type: "spring",
        stiffness: 1000,
        damping: 15,
        mass: 0.5,
      }
    },
    initial: {
      rotate: 0,
      x: 0,
    }
  };

  return (
    <motion.div
      variants={shakeVariants}
      animate={isShaking ? "shake" : "initial"}
      onAnimationComplete={() => setIsShaking(false)}
      onClick={handleToggle}
      className={cn(
        "flex items-center justify-between py-2 transition-opacity duration-400",
        task.completed ? 'opacity-60' : 'opacity-100',
        isFuture && !task.completed ? 'opacity-50' : '',
        (isFuture || isPast) ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
    >
      <label
        className={cn(
          "flex-grow text-lg transition-colors duration-300 pr-4",
          task.completed ? 'text-muted-foreground line-through' : 'text-foreground',
          (isFuture || isPast) ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        {task.text}
      </label>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        className="w-6 h-6 shrink-0 pointer-events-none" // The parent div handles clicks
        aria-label={`Mark task "${task.text}" as ${task.completed ? 'not completed' : 'completed'}`}
      />
    </motion.div>
  );
}
