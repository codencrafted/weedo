"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WeedoLogo } from '@/components/icons';
import { ArrowRight } from 'lucide-react';
import SplitText from './split-text';

type NamePromptProps = {
  onNameSet: (name: string) => void;
};

export default function NamePrompt({ onNameSet }: NamePromptProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <WeedoLogo className="w-16 h-16 text-primary" />
            </div>
            <SplitText text="Welcome to Weedo!" className="text-3xl font-bold justify-center" />
            <p className="text-sm text-muted-foreground">Your simple and beautiful to-do list.</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">What should we call you?</label>
            <Input
              id="name"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
             
              className="text-base"
            />
          </div>

          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Get Started <ArrowRight className="ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}
