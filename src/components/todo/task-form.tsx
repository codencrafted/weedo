"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type TaskFormProps = {
  onAddTask: (text: string) => void;
};

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTask(text.trim());
      setText('');
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            aria-label="New task"
          />
          <Button type="submit" disabled={!text.trim()} size="icon">
            <Plus />
            <span className="sr-only">Add Task</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
