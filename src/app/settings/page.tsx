
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';


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


  const handleLogout = () => {
    try {
      localStorage.removeItem('weedo-name');
      localStorage.removeItem('weedo-tasks');
      router.push('/');
    } catch (error) {
      console.error("Could not access local storage", error);
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
                  <CardDescription>Manage your account settings.</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mt-4">
                 <Button
                    variant="ghost"
                    className="w-full justify-start text-base hover:bg-transparent text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
