"use client";

import type { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, Reorder, useInView } from 'framer-motion';
import { Settings2, X, GripVertical } from 'lucide-react';

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
  isOpen: boolean;
  onToggleOpen: (id: string | null) => void;
  isFuture: boolean;
  isPast: boolean;
};

export default function TaskItem({
  task,
  onToggle,
  onUpdateDescription,
  isOpen,
  onToggleOpen,
  isFuture,
  isPast
}: TaskItemProps) {
  const [isShaking, setIsShaking] = useState(false);
  const dragControls = useDragControls();
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isFuture || isPast) {
      setIsShaking(true);
      return;
    }
    onToggle(task.id);
  };
  
  const shakeVariants = {
    shake: {
      rotate: [0, -1.5, 1.5, -1.5, 1.5, 0],
      x: [0, -3, 3, -3, 3, 0],
      transition: { type: "spring", stiffness: 1000, damping: 15, mass: 0.5 }
    },
    initial: { rotate: 0, x: 0 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    inView: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    <Reorder.Item
      ref={ref}
      value={task}
      id={task.id}
      dragListener={false}
      dragControls={dragControls}
      variants={itemVariants}
      initial="initial"
      animate={isInView ? "inView" : "initial"}
      exit="exit"
      layout
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className={cn(
        "bg-card rounded-lg border list-none mb-3 transition-[shadow,border-color,opacity] duration-300",
        isOpen ? "border-primary/40 shadow-lg" : "border-border shadow-sm hover:border-primary/20",
        task.completed ? 'opacity-60' : 'opacity-100',
      )}
    >
      <motion.div
        layout
        variants={shakeVariants}
        animate={isShaking ? "shake" : "initial"}
        onAnimationComplete={() => setIsShaking(false)}
        className="p-3"
      >
        <div className="flex items-center gap-1">
           <div
              onPointerDown={(e) => {
                if (!isFuture && !isPast) {
                  dragControls.start(e);
                }
              }}
              className={cn("p-2 text-muted-foreground/50 transition-colors", isFuture || isPast ? "cursor-not-allowed" : "cursor-grab hover:text-muted-foreground")}
            >
              <GripVertical className="h-5 w-5" />
            </div>
          <div onClick={handleCheckboxClick} className={cn((isFuture || isPast) ? 'cursor-not-allowed' : 'cursor-pointer p-1')}>
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              className="w-6 h-6 shrink-0 pointer-events-none"
              aria-label={`Mark task "${task.text}" as ${task.completed ? 'not completed' : 'completed'}`}
            />
          </div>
          <label
            onClick={() => onToggleOpen(isOpen ? null : task.id)}
            className={cn(
              "flex-grow text-lg transition-colors duration-300 cursor-pointer",
              task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
            )}
          >
            {task.text}
          </label>
          <motion.button
            layout
            onClick={() => onToggleOpen(isOpen ? null : task.id)}
            className="p-1.5 rounded-md hover:bg-accent"
          >
            {isOpen ? (
              <X className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ opacity: 0, height: 0, filter: "blur(4px)", marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', filter: "blur(0px)", marginTop: '1rem' }}
              exit={{ opacity: 0, height: 0, filter: "blur(4px)", marginTop: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, bounce: 0.5 }}
              className="overflow-hidden"
            >
              <div className="pl-12 pr-2 pb-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">Notes</label>
                <Textarea
                  value={task.description || ''}
                  onChange={(e) => onUpdateDescription(task.id, e.target.value)}
                  placeholder="Add some notes..."
                  className="mt-1 text-base border-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 shadow-none bg-muted/50"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  );
}
