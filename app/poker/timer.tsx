'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/app/lib/utils';

export interface TimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
  autoReveal?: boolean;
  className?: string;
}

export default function Timer({
  duration,
  isActive,
  onComplete,
  onTick,
  autoReveal = false,
  className,
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  const percentage = (timeRemaining / duration) * 100;
  const isLowTime = timeRemaining <= 10 && timeRemaining > 0;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  useEffect(() => {
    setTimeRemaining(duration);
    setIsPaused(false);
  }, [duration]);

  useEffect(() => {
    if (!isActive || isPaused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;

        if (onTick) onTick(next);

        if (next <= 0) {
          if (onComplete) onComplete();
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, timeRemaining, onComplete, onTick]);

  const handlePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setTimeRemaining(duration);
    setIsPaused(false);
  }, [duration]);

  // Circle SVG properties
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative', className)}>
      
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-light-border dark:text-dark-border"
          />

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-colors duration-300',
              isLowTime
                ? 'text-red-500'
                : 'text-light-accent dark:text-dark-accent'
            )}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            animate={isLowTime ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
          >
            <div
              className={cn(
                'text-3xl font-bold tabular-nums',
                isLowTime
                  ? 'text-red-500'
                  : 'text-light-text-primary dark:text-dark-text-primary'
              )}
            >
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>

            {isPaused && (
              <div className="text-xs opacity-70 mt-1">
                Paused
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {isActive && (
        <div className="flex items-center justify-center gap-2 mt-4">
          
          <button onClick={handlePause} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700">
            {isPaused ? '▶' : '⏸'}
          </button>

          <button onClick={handleReset} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700">
            🔄
          </button>

        </div>
      )}

      <AnimatePresence>
        {isLowTime && isActive && !isPaused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">
              ⚠️ Hurry up!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {timeRemaining === 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-3xl">⏰</div>
              <div className="text-sm">Time's Up</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}