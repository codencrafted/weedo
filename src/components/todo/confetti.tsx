"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const confettiColors = ['#FFB37E', '#FFFFFF', '#FFD1B3', '#FFA07A'];
const numConfetti = 50;

type ConfettiParticle = {
    id: string;
    x: string;
    y: string;
    rotate: number;
    scale: number;
    duration: number;
    width: string;
    height: string;
    backgroundColor: string;
};

type ConfettiProps = {
  onComplete: () => void;
};

export const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    const timer = setTimeout(onComplete, 2000); // Animation duration + buffer
    
    // Generate particles on the client side to avoid hydration mismatch
    setParticles(Array.from({ length: numConfetti }).map(() => ({
        id: crypto.randomUUID(),
        x: `${Math.random() * 200 - 100}vw`,
        y: `${Math.random() * 100 - 50}vh`,
        rotate: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 1.5 + 0.5,
        width: `${Math.floor(Math.random() * 8) + 6}px`,
        height: `${Math.floor(Math.random() * 10) + 8}px`,
        backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    })));

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: '50%',
              y: '50%',
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: particle.x,
              y: particle.y,
              rotate: particle.rotate,
              opacity: 0,
              scale: particle.scale,
            }}
            transition={{
              duration: particle.duration,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: particle.width,
              height: particle.height,
              backgroundColor: particle.backgroundColor,
              borderRadius: '50%',
            }}
            className="origin-center"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
