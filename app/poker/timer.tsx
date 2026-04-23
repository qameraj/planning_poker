'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
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
        
        if (onTick) {
          onTick(next);
        }

        if (next <= 0) {
          if (onComplete) {
            onComplete();
          }
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
      {/* Circular Progress */}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-light-border dark:text-dark-border"
          />
          {/* Progress circle */}
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
            animate={{
              strokeDashoffset,
            }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>

        {/* Time Display */}
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
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Paused
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      {isActive && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={handlePause}
            className="p-2 rounded-xl hover:bg-light-bg-secondary dark:hover:bg-dark-card transition-colors"
            aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? (
              <svg className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl hover:bg-light-bg-secondary dark:hover:bg-dark-card transition-colors"
            aria-label="Reset timer"
          >
            <svg className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      {/* Low Time Alert */}
      <AnimatePresence>
        {isLowTime && isActive && !isPaused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-soft">
              ⚠️ Hurry up!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Animation */}
      <AnimatePresence>
        {timeRemaining === 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full h-full flex items-center justify-center bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-sm rounded-full">
              <div className="text-center">
                <div className="text-4xl mb-2">⏰</div>
                <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  Time's Up!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}