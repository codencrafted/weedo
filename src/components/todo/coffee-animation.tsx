
"use client";

import React from 'react';
import { motion } from 'framer-motion';

const CoffeeAnimation = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-10 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
        <div className="text-lg font-semibold text-foreground mb-4">You did it! Time for a break.</div>
        <div className="container">
            <div className="coffee-header">
                <div className="coffee-header__buttons coffee-header__button-one"></div>
                <div className="coffee-header__buttons coffee-header__button-two"></div>
                <div className="coffee-header__display"></div>
                <div className="coffee-header__details"></div>
            </div>
            <div className="coffee-medium">
                <div className="coffe-medium__exit"></div>
                <div className="coffee-medium__arm"></div>
                <div className="coffee-medium__liquid"></div>
                <div className="coffee-medium__smoke coffee-medium__smoke-one"></div>
                <div className="coffee-medium__smoke coffee-medium__smoke-two"></div>
                <div className="coffee-medium__smoke coffee-medium__smoke-three"></div>
                <div className="coffee-medium__smoke coffee-medium__smoke-for"></div>
                <div className="coffee-medium__cup"></div>
            </div>
            <div className="coffee-footer"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">All tasks complete. Enjoy your coffee!</p>
    </motion.div>
  );
};

export default CoffeeAnimation;
