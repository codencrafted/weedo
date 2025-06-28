"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const confettiColors = ['#FFB37E', '#FFFFFF', '#FFD1B3', '#FFA07A'];
const numConfetti = 50;

type ConfettiProps = {
  onComplete: () => void;
};

export const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000); // Animation duration + buffer
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {Array.from({ length: numConfetti }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: '50%',
              y: '50%',
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: `${Math.random() * 200 - 100}vw`,
              y: `${Math.random() * 100 - 50}vh`,
              rotate: Math.random() * 360,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            transition={{
              duration: Math.random() * 1.5 + 0.5,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${Math.floor(Math.random() * 8) + 6}px`,
              height: `${Math.floor(Math.random() * 10) + 8}px`,
              backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
              borderRadius: '50%',
            }}
            className="origin-center"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
