'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

// ✅ FIXED PATH
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    const Component = hover ? motion.div : 'div';

    return (
      <Component
        ref={ref}
        className={cn(
          'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-soft',
          hover && 'cursor-pointer transition-all duration-200',
          className
        )}
        {...(hover && {
          whileHover: {
            scale: 1.02,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          },
          whileTap: { scale: 0.98 },
        })}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export default Card;