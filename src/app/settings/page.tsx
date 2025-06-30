"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, LogOut, AlertTriangle, Pencil, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@/lib/types';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverForm,
  PopoverInput,
  PopoverFooter,
  PopoverCloseButton,
  PopoverSubmitButton,
  PopoverHeader,
  PopoverBody,
  usePopover,
} from "@/components/ui/popover-animated";


const getInitials = (name: string | null): string => {
    if (!name) return '';
    const names = name.trim().split(' ').filter(n => n);
    if (names.length === 0) return '';
    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const ConfirmationContent = ({ title, description, onConfirm, confirmText, confirmVariant = "default" } : {
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmVariant?: "default" | "destructive";
}) => {
    const { closePopover } = usePopover();

    const handleConfirm = () => {
        onConfirm();
        closePopover();
    };

    return (
        <div className="flex flex-col h-full bg-card text-card-foreground">
            <PopoverHeader>
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive shrink-0"/>
                    <span className="text-base font-semibold">{title}</span>
                </div>
            </PopoverHeader>
            <PopoverBody>
                <p>{description}</p>
            </PopoverBody>
            <PopoverFooter className="bg-transparent border-0 justify-end gap-2 p-3">
                <PopoverCloseButton asChild>
                    <Button variant="ghost" type="button">Cancel</Button>
                </PopoverCloseButton>
                <Button variant={confirmVariant} onClick={handleConfirm}>{confirmText}</Button>
            </PopoverFooter>
        </div>
    )
}

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

  const handleNameSave = (newName: string) => {
    if (newName.trim()) {
      try {
        const trimmedName = newName.trim();
        localStorage.setItem('weedo-name', trimmedName);
        setName(trimmedName);
        setInitials(getInitials(trimmedName));
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
              <Button variant="ghost" asChild>
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
                  <div className="flex flex-col items-center w-full">
                     <PopoverRoot initialValue={name ?? ""}>
                        <div className="flex items-center gap-1">
                          <h2 className="text-2xl font-semibold leading-none tracking-tight">{name}</h2>
                          <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Edit name">
                                  <Pencil className="w-4 h-4" />
                              </Button>
                          </PopoverTrigger>
                        </div>
                        <PopoverContent className="w-80 h-auto">
                          <PopoverForm onSubmit={handleNameSave}>
                            <div className="flex flex-col h-full bg-card text-card-foreground">
                                <PopoverHeader>Edit your name</PopoverHeader>
                                <PopoverBody>
                                    <PopoverInput placeholder="Enter your new name" />
                                </PopoverBody>
                                <PopoverFooter className="bg-transparent border-0 justify-end gap-2 p-3">
                                  <PopoverCloseButton asChild>
                                    <Button variant="ghost" type="button">Cancel</Button>
                                  </PopoverCloseButton>
                                  <PopoverSubmitButton>
                                    <Check className="h-4 w-4 mr-2" /> Save
                                  </PopoverSubmitButton>
                                </PopoverFooter>
                              </div>
                          </PopoverForm>
                        </PopoverContent>
                      </PopoverRoot>
                    <p className="text-sm text-muted-foreground mt-1.5">Manage your app settings.</p>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 pt-0">
              <div className="flex flex-col gap-2 mt-4">
                 <PopoverRoot>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start text-left text-base p-3 h-auto">
                          <RefreshCw className="mr-3 h-5 w-5" />
                          <div>
                              <p>Mark All Incomplete</p>
                              <p className="text-xs text-muted-foreground font-normal">Reset the completion status of all tasks.</p>
                          </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 h-auto">
                      <ConfirmationContent
                        title="Are you sure?"
                        description="This will mark all of your tasks, across all days, as incomplete. This action cannot be undone."
                        onConfirm={handleUncompleteAll}
                        confirmText="Continue"
                      />
                    </PopoverContent>
                 </PopoverRoot>
                 
                 <PopoverRoot>
                    <PopoverTrigger asChild>
                       <Button variant="ghost" className="w-full justify-start text-left text-base text-destructive p-3 h-auto">
                          <LogOut className="mr-3 h-5 w-5" />
                          <div>
                             <p>Logout</p>
                             <p className="text-xs text-muted-foreground font-normal">This will clear your name and task data.</p>
                         </div>
                     </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 h-auto">
                       <ConfirmationContent
                        title="Are you sure you want to log out?"
                        description="This will permanently delete all your data, including your name and tasks. This action cannot be undone."
                        onConfirm={handleLogout}
                        confirmText="Logout"
                        confirmVariant="destructive"
                      />
                    </PopoverContent>
                 </PopoverRoot>
              </div>
            </div>
          </div>
      </div>
    </motion.div>
  );
}