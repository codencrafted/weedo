
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
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

  const handleLogout = () => {
    try {
      localStorage.removeItem('weedo-name');
      localStorage.removeItem('weedo-tasks');
      localStorage.removeItem('weedo-tasks-initialized');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Could not access local storage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not log out.",
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col items-center justify-center min-h-screen bg-background p-4"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 self-start">
            <Link href="/" passHref>
              <Button variant="ghost" className="hover:bg-transparent" asChild>
                <motion.div
                  className="flex items-center cursor-pointer"
                  initial="rest"
                  whileHover="hover"
                  whileTap={{scale: 0.98}}
                >
                  <motion.div
                    variants={{ hover: { x: -4 }, rest: { x: 0 } }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.div>
                  <span>Back to Tasks</span>
                </motion.div>
              </Button>
            </Link>
        </div>

        <div className="w-full">
            <div className="flex flex-col items-center text-center p-6 pt-0">
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
                  <h2 className="text-2xl font-semibold leading-none tracking-tight">{name}</h2>
                  <p className="text-sm text-muted-foreground mt-1.5">Manage your app settings.</p>
                </>
              )}
            </div>
            <div className="p-6 pt-0">
              <div className="flex flex-col gap-2 mt-4">
                 
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <motion.div {...motionProps}>
                        <Button variant="outline" className="w-full justify-start text-base hover:bg-transparent">
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Mark All Tasks as Incomplete
                        </Button>
                     </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center justify-center text-center sm:text-left sm:justify-start gap-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="sm:pl-8">
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
                        className="w-full justify-start text-base text-destructive hover:bg-transparent hover:text-destructive"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout
                      </Button>
                    </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center justify-center text-center sm:text-left sm:justify-start gap-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="sm:pl-8">
                        This will permanently delete all your data, including your name and tasks. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleLogout}>Logout</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </div>
            </div>
          </div>
      </div>
    </motion.div>
  );
}
