'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, User, List } from 'lucide-react';

type ImportViewProps = {
  name: string;
  tasks: Task[];
};

export default function ImportView({ name, tasks }: ImportViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleImport = () => {
    try {
      localStorage.setItem('weedo-name', name);
      localStorage.setItem('weedo-tasks', JSON.stringify(tasks));
      localStorage.setItem('weedo-tasks-initialized', 'true');
      toast({
        title: 'Import Successful!',
        description: `Tasks for "${name}" have been added to your device.`,
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to import data:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'Could not save the imported data to your device.',
      });
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Import Tasks</CardTitle>
        <CardDescription>
          You're about to import the following data. This will overwrite any existing tasks on this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-lg">
            <User className="mr-3 h-5 w-5 text-muted-foreground"/>
            <span className="font-semibold">{name}</span>
        </div>
        <div className="flex items-center text-lg">
            <List className="mr-3 h-5 w-5 text-muted-foreground"/>
            <span>{tasks.length} task(s)</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleImport}>
          <Check className="mr-2 h-4 w-4" /> Import and Overwrite
        </Button>
      </CardFooter>
    </Card>
  );
}
