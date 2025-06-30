
"use client";

import { motion } from 'framer-motion';
import { WeedoLogo } from '@/components/icons';

const NotificationsStack = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = (index: number) => ({
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: -index * 12,
      scale: 1 - index * 0.05,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  });

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center p-10 h-full"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="relative h-40 w-72">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={itemVariants(i)}
            style={{ zIndex: 3 - i, position: 'absolute', width: '100%', top: 0 }}
          >
            <div className="w-full bg-card/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 flex-shrink-0 bg-primary/20 rounded-full flex items-center justify-center">
                  <WeedoLogo className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm text-foreground">Weedo</p>
                    <p className="text-xs text-muted-foreground">now</p>
                  </div>
                  {i === 0 ? (
                     <>
                        <h3 className="font-bold text-base text-foreground">All Tasks Completed!</h3>
                        <p className="text-sm text-muted-foreground mt-1">Great job! Time to relax and recharge.</p>
                     </>
                  ) : i === 1 ? (
                    <div className="space-y-1 py-1">
                      <div className="h-4 bg-muted-foreground/20 rounded-full w-3/4"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded-full w-1/2"></div>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                       <div className="h-4 bg-muted-foreground/20 rounded-full w-5/6"></div>
                       <div className="h-3 bg-muted-foreground/20 rounded-full w-2/3"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.p 
        initial={{opacity: 0}}
        whileInView={{opacity: 1}}
        viewport={{ once: true }}
        transition={{delay: 0.8}}
        className="text-sm text-muted-foreground mt-6"
      >
        You've cleared your list for the day.
      </motion.p>
    </motion.div>
  );
};

export default NotificationsStack;
