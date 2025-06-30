"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

type TaskFormProps = {
  onAddTask: (text: string) => void;
};

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const isInputEmpty = !text.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInputEmpty) {
      onAddTask(text.trim());
      setText('');
    }
  };

  const plusIconVariants = {
    inactive: { rotate: 0, scale: 1 },
    active: { rotate: 90, scale: 1.2 },
  };

  return (
    <motion.div
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Add a new task..."
              className="flex-grow text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
              aria-label="New task"
            />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button type="submit" disabled={isInputEmpty} size="icon">
                <motion.div
                  variants={plusIconVariants}
                  animate={isInputEmpty ? 'inactive' : 'active'}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Plus />
                </motion.div>
                <span className="sr-only">Add Task</span>
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
