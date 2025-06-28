"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WeedoLogo } from '@/components/icons';
import { ArrowRight } from 'lucide-react';

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
      <Card className="w-full max-w-md shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <WeedoLogo className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Welcome to Weedo!</CardTitle>
            <CardDescription>Your simple and beautiful to-do list.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">What should we call you?</label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="text-base"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!name.trim()}>
              Get Started <ArrowRight className="ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
