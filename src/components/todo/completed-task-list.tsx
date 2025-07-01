"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/types";
import { EyeOff } from "lucide-react";

export default function CompletedTaskList({ tasks }: { tasks: Task[] }) {
  const [show, setShow] = useState(false);

  const containerVariants = {
    list: { height: 'auto' },
    stack: { height: 120 }
  };

  const itemVariants = {
    list: (i: number) => ({
      y: 0,
      scale: 1,
      zIndex: tasks.length - i,
      position: 'relative',
      opacity: 0.6,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }),
    stack: (i: number) => ({
      y: i * 12,
      scale: 1 - i * 0.04,
      zIndex: tasks.length - i,
      position: 'absolute',
      opacity: i < 4 ? 0.6 : 0,
      transition: { type: "spring", stiffness: 400, damping: 40 }
    })
  };

  const transition = { type: "spring", stiffness: 300, damping: 30 };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative w-full cursor-pointer p-2 md:p-4"
        variants={containerVariants}
        animate={show ? "list" : "stack"}
        transition={transition}
        onClick={() => !show && setShow(true)}
      >
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            custom={index}
            variants={itemVariants}
            animate={show ? 'list' : 'stack'}
            transition={transition}
            className="w-full top-0 left-0 right-0 mx-auto"
          >
            <div className="bg-card rounded-lg border list-none mb-3 shadow-sm">
              <div className="p-3">
                <div className="flex items-center gap-3">
                  <div className='p-1'>
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      className="w-6 h-6 shrink-0 pointer-events-none"
                    />
                  </div>
                  <label className="flex-grow text-lg text-muted-foreground line-through">
                    {task.text}
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {show && (
        <motion.div 
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            className="flex justify-end p-2 pb-0 w-full"
        >
          <Button variant="ghost" size="sm" onClick={() => setShow(false)}>
            <EyeOff className="mr-2 h-4 w-4" />
            Hide
          </Button>
        </motion.div>
      )}
    </div>
  );
}
