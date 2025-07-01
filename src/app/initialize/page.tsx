"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Plus, X, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function InitializePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [dailyTasks, setDailyTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('weedo-user-id');
    if (id) {
      setUserId(id);
      const userDocRef = doc(db, 'users', id);
      
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDailyTasks(data.dailyTasks || []);
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching daily tasks:", error);
        setIsLoading(false);
        toast({ variant: "destructive", title: "Error loading data" });
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
      router.push('/');
    }
  }, [router, toast]);
  
  const handleAddTask = async () => {
    if (!newTask.trim() || !userId) return;
    const updatedTasks = [...dailyTasks, newTask.trim()];
    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, { dailyTasks: updatedTasks });
      setNewTask('');
      toast({ title: "Daily task added!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Could not add task" });
    }
  };

  const handleRemoveTask = async (indexToRemove: number) => {
    if (!userId) return;
    const updatedTasks = dailyTasks.filter((_, index) => index !== indexToRemove);
     const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, { dailyTasks: updatedTasks });
      toast({ title: "Daily task removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Could not remove task" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleAddTask();
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
      <div className="w-full max-w-2xl">
        <div className="mb-6 self-start">
          <Link href="/settings" passHref>
            <Button variant="ghost" className="hover:bg-transparent" asChild>
              <motion.div className="flex items-center cursor-pointer" initial="rest" whileHover="hover" whileTap={{scale: 0.98}}>
                <motion.div variants={{ hover: { x: -4 }, rest: { x: 0 } }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                </motion.div>
                <span>Back to Settings</span>
              </motion.div>
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Tasks</CardTitle>
            <CardDescription>Set up tasks that will automatically appear every day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-6">
              <Input 
                placeholder="e.g., Drink a glass of water"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={handleAddTask} disabled={!newTask.trim()}><Plus className="h-4 w-4 mr-2" /> Add</Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Your Daily Tasks</h3>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : dailyTasks.length > 0 ? (
                 <motion.ul layout className="space-y-2">
                  <AnimatePresence>
                    {dailyTasks.map((task, index) => (
                      <motion.li
                        key={task + index} // Use a more stable key if tasks can be identical
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-foreground">{task}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTask(index)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                 </motion.ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <ListTodo className="mx-auto h-8 w-8 mb-2"/>
                  <p>No daily tasks yet.</p>
                  <p className="text-xs">Add one above to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
