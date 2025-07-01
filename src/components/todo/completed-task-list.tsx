"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/types";

export default function CompletedTaskList({ tasks, onToggleTask }: { tasks: Task[]; onToggleTask: (id: string, withEffects?: boolean) => void }) {
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3, ease: "easeOut" } }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-card rounded-lg border list-none mb-3 shadow-sm opacity-60 cursor-grab"
          onTap={() => onToggleTask(task.id, true)}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragStart={() => onToggleTask(task.id, false)}
        >
          <div className="p-3 pointer-events-none">
            <div className="flex items-center gap-3">
              <div className='p-1'>
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  className="w-6 h-6 shrink-0"
                />
              </div>
              <label className="flex-grow text-lg text-muted-foreground line-through">
                {task.text}
              </label>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
