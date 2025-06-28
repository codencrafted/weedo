"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import type { Task } from '@/lib/types';
import { addDays, startOfDay } from 'date-fns';

type InitialTasksProps = {
  name: string;
  onTasksSet: (tasks: Task[]) => void;
};

export default function InitialTasks({ name, onTasksSet }: InitialTasksProps) {
  const [tasksInput, setTasksInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskLines = tasksInput.split('\n').filter(line => line.trim() !== '');

    if (taskLines.length === 0) {
      onTasksSet([]);
      return;
    }

    const today = startOfDay(new Date());
    const dates = [
      today,
      addDays(today, 1),
      addDays(today, 2),
    ];

    const allNewTasks: Task[] = [];
    dates.forEach(date => {
      const dailyTasks: Task[] = taskLines.map(text => ({
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: date.toISOString(),
      }));
      allNewTasks.push(...dailyTasks);
    });
    
    onTasksSet(allNewTasks);
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Welcome, {name}!</CardTitle>
              <CardDescription>
                Let's get your week started. List a few tasks you want to accomplish.
                <br />
                They'll be added for today, tomorrow, and the day after. You can add more later!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="- Buy milk&#10;- Finish report&#10;- Call mom"
                value={tasksInput}
                onChange={(e) => setTasksInput(e.target.value)}
                className="h-40 text-base"
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={!tasksInput.trim()}>
                Let's Go! <ArrowRight className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </motion.div>
  );
}
