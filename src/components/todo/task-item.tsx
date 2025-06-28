"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Confetti } from './confetti';

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [isDone, setIsDone] = useState(task.completed);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleToggle = () => {
    const newIsDone = !isDone;
    setIsDone(newIsDone);
    onToggle(task.id);
    if (newIsDone) {
      setShowConfetti(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="relative"
      >
        <Card className={cn(
          "transition-all duration-300",
          isDone ? 'bg-muted/60' : 'bg-card'
        )}>
          <CardContent className="p-4 flex items-center gap-4">
            <Checkbox
              id={`task-${task.id}`}
              checked={isDone}
              onCheckedChange={handleToggle}
              className="w-6 h-6 rounded-md"
              aria-label={`Mark task "${task.text}" as ${isDone ? 'not completed' : 'completed'}`}
            />
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                "flex-grow text-base transition-colors duration-300 cursor-pointer",
                isDone ? 'text-muted-foreground line-through' : 'text-foreground'
              )}
            >
              {task.text}
            </label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
              aria-label={`Delete task "${task.text}"`}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
        {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      </motion.div>
    </AnimatePresence>
  );
}
