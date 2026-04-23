'use client';

import { motion } from 'framer-motion';

// ✅ FIXED IMPORTS
import { cn } from '@/app/lib/utils';
import { getCardColor } from '@/app/lib/decks';

interface VotingCardProps {
  value: string;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VotingCard({
  value,
  isSelected = false,
  isRevealed = false,
  onClick,
  disabled = false,
  size = 'md',
}: VotingCardProps) {
  const sizes = {
    sm: 'w-12 h-16 text-lg',
    md: 'w-16 h-24 text-2xl',
    lg: 'w-20 h-28 text-3xl',
  };

  const cardColor = getCardColor(value);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative rounded-xl font-bold text-white shadow-soft transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent',
        sizes[size],
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'cursor-pointer',
        isSelected && 'ring-2 ring-light-accent dark:ring-dark-accent ring-offset-2'
      )}
      whileHover={!disabled ? { scale: 1.05, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className={cn('absolute inset-0 rounded-xl', cardColor)} />

      <div className="relative z-10 flex items-center justify-center h-full">
        {value}
      </div>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-light-accent dark:bg-dark-accent rounded-full flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}