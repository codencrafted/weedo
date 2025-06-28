
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from '@/lib/types';
import { subDays, format, startOfDay, parseISO, isToday } from 'date-fns';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type ChartData = {
  date: string;
  fullDate: string;
  completed: number;
};

const chartConfig = {
  completed: {
    label: 'Tasks',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('weedo-tasks');
      const storedName = localStorage.getItem('weedo-name');
      if(storedName) setName(storedName);

      const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
      
      const completedTasks = tasks.filter(t => t.completed);
      setTotalCompleted(completedTasks.length);

      const today = startOfDay(new Date());
      const dateRange = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();
      
      const data: ChartData[] = dateRange.map(date => {
        const completedOnDay = completedTasks.filter(task => {
            try {
                const taskDate = startOfDay(parseISO(task.createdAt));
                return taskDate.getTime() === date.getTime();
            } catch {
                return false;
            }
        }).length;
        
        return {
          date: isToday(date) ? 'Today' : format(date, 'EEE'),
          fullDate: format(date, 'MMM d, yyyy'),
          completed: completedOnDay,
        };
      });
      
      setChartData(data);
    } catch (error) {
      console.error("Could not process task data", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      <div className="w-full max-w-2xl">
        <motion.div variants={itemVariants} className="mb-6 self-start">
          <Link href="/" passHref>
            <Button variant="ghost" className="hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tasks
            </Button>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Productivity Report</CardTitle>
              <CardDescription>
                {name ? `${name}, here's your progress ` : "Here's your progress "}
                over the last 7 days. You've completed a total of {totalCompleted} tasks!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] w-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="h-[250px]">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent 
                            labelFormatter={(_, payload) => `${payload[0]?.payload.fullDate}`}
                            formatter={(value) => [`${value} tasks`, '']}
                            indicator="dot"
                        />}
                      />
                      <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

