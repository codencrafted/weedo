"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem('weedo-name');
      localStorage.removeItem('weedo-tasks');
      router.push('/');
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center justify-center min-h-screen bg-background p-4"
    >
      <div className="w-full max-w-md">
        <motion.div variants={itemVariants} className="mb-6 self-start">
          <Link href="/" passHref>
            <Button variant="ghost" className="hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Button>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
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
        </motion.div>
      </div>
    </motion.div>
  );
}
