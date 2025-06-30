
"use client";

import React, { useRef, useState, useEffect, ReactNode, UIEvent } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

const AnimatedItemWrapper: React.FC<{ children: ReactNode; index: number }> = ({
  children,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{
        duration: 0.4,
        delay: inView ? index * 0.05 : 0,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  showGradients?: boolean;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = "",
  showGradients = true,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);
  const childrenArray = React.Children.toArray(children);

  const { scrollY } = useScroll({ container: listRef });
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const listEl = listRef.current;
    const contentEl = contentRef.current;
    if (!listEl || !contentEl) return;

    const updateMaxScroll = () => {
      const newMaxScroll = contentEl.offsetHeight - listEl.offsetHeight;
      setMaxScroll(newMaxScroll > 0 ? newMaxScroll : 0);
    };

    updateMaxScroll();

    const resizeObserver = new ResizeObserver(updateMaxScroll);
    resizeObserver.observe(contentEl);
    resizeObserver.observe(listEl);

    return () => resizeObserver.disconnect();
  }, [children]);

  const overscrollY = useTransform(
    scrollY,
    [-100, 0, maxScroll, maxScroll + 100],
    [50, 0, 0, -50]
  );

  const springY = useSpring(overscrollY, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.5,
  });

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } =
      e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    );
  };

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      const { scrollHeight, clientHeight } = listElement;
      if (scrollHeight <= clientHeight) {
        setBottomGradientOpacity(0);
      } else {
        setBottomGradientOpacity(1);
      }
    }
  }, [children]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className="max-h-[45vh] overflow-y-auto hide-scrollbar p-2 md:p-4"
        onScroll={handleScroll}
      >
        <motion.div ref={contentRef} style={{ y: springY }}>
          {childrenArray.map((child, index) => (
            <AnimatedItemWrapper key={index} index={index}>
              {child}
            </AnimatedItemWrapper>
          ))}
        </motion.div>
      </div>
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-card to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-card to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
};

export default AnimatedList;
