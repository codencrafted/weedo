
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@/lib/types';


const getInitials = (name: string | null): string => {
    if (!name) return '';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length === 0) return '';
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('weedo-name');
      if (storedName) {
        setName(storedName);
        setInitials(getInitials(storedName));
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleUncompleteAll = () => {
    try {
      const storedTasks = localStorage.getItem('weedo-tasks');
      if (storedTasks) {
        const tasks: Task[] = JSON.parse(storedTasks);
        const uncompletedTasks = tasks.map(task => ({ ...task, completed: false }));
        localStorage.setItem('weedo-tasks', JSON.stringify(uncompletedTasks));
        toast({
            title: "Tasks Updated",
            description: "All tasks have been marked as incomplete.",
        });
      }
    } catch (error) {
      console.error("Could not update tasks", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update tasks.",
      })
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('weedo-name');
      localStorage.removeItem('weedo-tasks');
      localStorage.removeItem('weedo-tasks-initialized');
      toast({
        title: "App Reset",
        description: "All your data has been cleared.",
      });
      router.push('/');
    } catch (error) {
      console.error("Could not access local storage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not reset the app.",
      })
    }
  };

  const motionProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background p-4"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 self-start">
          <Link href="/" passHref>
            <Button variant="ghost" className="hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Button>
          </Link>
        </div>

        <div>
          <Card className="w-full">
            <CardHeader className="items-center text-center">
               {isLoading ? (
                <>
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 mt-4" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </>
              ) : (
                <>
                  <Avatar className="h-24 w-24 mb-4 text-3xl">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>Manage your app settings.</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mt-4">
                 
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <motion.div {...motionProps}>
                        <Button variant="outline" className="w-full justify-start text-base">
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Mark All Tasks as Incomplete
                        </Button>
                     </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark all of your tasks, across all days, as incomplete. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUncompleteAll}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.div {...motionProps}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-5 w-5" />
                        Reset App
                      </Button>
                    </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete all your tasks and reset your name. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleReset}>Reset App</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
