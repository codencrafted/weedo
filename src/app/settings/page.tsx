"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RefreshCw, LogOut, AlertTriangle, Pencil, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const [openDialog, setOpenDialog] = useState<null | 'uncomplete' | 'logout'>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('weedo-name');
      if (storedName) {
        setName(storedName);
        setNewName(storedName);
        setInitials(getInitials(storedName));
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleNameSave = () => {
    if (newName.trim()) {
      try {
        const trimmedName = newName.trim();
        localStorage.setItem('weedo-name', trimmedName);
        setName(trimmedName);
        setInitials(getInitials(trimmedName));
        setIsEditingName(false);
        toast({
          title: "Name Updated",
          description: "Your name has been successfully changed.",
        });
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save your name.",
        })
      }
    }
  };

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
    } finally {
      setOpenDialog(null);
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
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  };
  
  const ConfirmationCard = ({ title, description, onConfirm, onCancel, confirmText = "Continue", confirmVariant = "default" } : {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    confirmVariant?: "default" | "destructive";
  }) => (
     <motion.div
      layout
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <Card className={cn("mt-2", confirmVariant === "destructive" ? "bg-destructive/10 border-destructive/30" : "bg-muted/50 border-border")}>
        <CardHeader>
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0"/>
                <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="text-foreground/80">{description}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardFooter className="justify-end gap-2 pb-4 pr-4 pt-0">
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

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
                  <div className="flex items-center gap-1">
                    <h2 className="text-2xl font-semibold leading-none tracking-tight">{name}</h2>
                    <Popover open={isEditingName} onOpenChange={setIsEditingName}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Edit Name</h4>
                            <p className="text-sm text-muted-foreground">
                              Update your name below.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleNameSave();
                                  e.preventDefault();
                                }
                                if (e.key === 'Escape') setIsEditingName(false);
                              }}
                              autoFocus
                              className="h-9"
                            />
                            <Button size="icon" className="h-9 w-9" onClick={handleNameSave} aria-label="Save name"><Check className="h-4 w-4"/></Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">Manage your app settings.</p>
                </>
              )}
            </div>
            <div className="p-6 pt-0">
              <div className="flex flex-col gap-2 mt-4">
                 
                <motion.div {...motionProps} className="rounded-lg">
                    <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto" onClick={() => setOpenDialog(openDialog === 'uncomplete' ? null : 'uncomplete')}>
                        <RefreshCw className="mr-3 h-5 w-5" />
                        <div>
                            <p>Mark All Incomplete</p>
                            <p className="text-xs text-muted-foreground font-normal">Reset the completion status of all tasks.</p>
                        </div>
                    </Button>
                </motion.div>
                <AnimatePresence>
                  {openDialog === 'uncomplete' && (
                    <ConfirmationCard
                      title="Are you sure?"
                      description="This will mark all of your tasks, across all days, as incomplete. This action cannot be undone."
                      onConfirm={handleUncompleteAll}
                      onCancel={() => setOpenDialog(null)}
                    />
                  )}
                </AnimatePresence>

                <motion.div {...motionProps} className="rounded-lg">
                    <Button variant="ghost" className="w-full justify-start text-left text-base text-destructive hover:text-destructive p-3 h-auto" onClick={() => setOpenDialog(openDialog === 'logout' ? null : 'logout')}>
                        <LogOut className="mr-3 h-5 w-5" />
                        <div>
                           <p>Logout</p>
                           <p className="text-xs text-muted-foreground font-normal">This will clear your name and task data.</p>
                       </div>
                   </Button>
                </motion.div>
                <AnimatePresence>
                  {openDialog === 'logout' && (
                    <ConfirmationCard
                      title="Are you sure you want to log out?"
                      description="This will permanently delete all your data, including your name and tasks. This action cannot be undone."
                      onConfirm={handleLogout}
                      onCancel={() => setOpenDialog(null)}
                      confirmText="Logout"
                      confirmVariant="destructive"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
      </div>
    </motion.div>
  );
}
