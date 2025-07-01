"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/types";

export default function CompletedTaskList({ tasks, onToggleTask }: { tasks: Task[]; onToggleTask: (id: string) => void }) {
  if (tasks.length === 0) return null;

  return (
    <div className="p-2 md:p-4 pt-0">
      {tasks.length > 0 && (
        <div className="p-2 md:px-4 md:pb-2">
            <h3 className="text-base font-semibold text-muted-foreground">Completed</h3>
        </div>
      )}
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="bg-card rounded-lg border list-none mb-3 shadow-sm opacity-60 cursor-pointer"
          onClick={() => onToggleTask(task.id)}
        >
          <div className="p-3">
            <div className="flex items-center gap-3">
              <div className='p-1'>
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  className="w-6 h-6 shrink-0 pointer-events-none"
                />
              </div>
              <label className="flex-grow text-lg text-muted-foreground line-through cursor-pointer">
                {task.text}
              </label>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
