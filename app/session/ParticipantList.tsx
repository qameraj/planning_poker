'use client';

import { motion } from 'framer-motion';

// ✅ FIXED: Using relative paths to find the 'ui' folder inside 'app'
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';

// ✅ FIXED: Removed '/app' because 'lib' is now in the root
import { Participant, Vote } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ParticipantCardProps {
  participant: Participant;
  vote?: Vote;
  isRevealed: boolean;
}

export default function ParticipantCard({
  participant,
  vote,
  isRevealed,
}: ParticipantCardProps) {
  const hasVoted = !!vote;

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <Avatar name={participant.name} size="md" />

        <div className="flex-1 min-w-0">
          <p className="font-medium text-light-text-primary dark:text-dark-text-primary truncate">
            {participant.name}
          </p>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
              )}
            />

            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              {participant.isSpectator
                ? 'Spectator'
                : hasVoted
                ? 'Voted'
                : 'Waiting'}
            </span>
          </div>
        </div>

        {!participant.isSpectator && (
          <div className="flex-shrink-0">
            {isRevealed && vote ? (
              <motion.div
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-10 h-14 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-bold flex items-center justify-center text-lg shadow-soft"
              >
                {vote.value}
              </motion.div>
            ) : hasVoted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-14 rounded-lg bg-gradient-to-br from-light-accent to-light-accent/80 dark:from-dark-accent dark:to-dark-accent/80 shadow-soft flex items-center justify-center"
              >
                <svg
                  className="w-6 h-6 text-white"
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
            ) : (
              <div className="w-10 h-14 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}