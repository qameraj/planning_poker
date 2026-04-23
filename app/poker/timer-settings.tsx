'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { cn } from '../lib/utils';

export interface TimerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (duration: number, autoReveal: boolean) => void;
}

const PRESET_DURATIONS = [
  { label: '1 min', value: 60, icon: '⚡' },
  { label: '2 min', value: 120, icon: '🏃' },
  { label: '3 min', value: 180, icon: '⏱️' },
  { label: '5 min', value: 300, icon: '☕' },
];

export default function TimerSettings({ isOpen, onClose, onStart }: TimerSettingsProps) {
  const [selectedDuration, setSelectedDuration] = useState(180);
  const [autoReveal, setAutoReveal] = useState(true);

  const handleStart = () => {
    onStart(selectedDuration, autoReveal);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Timer Settings" size="md">
      <div className="space-y-6">
        {/* Duration Presets */}
        <div>
          <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
            Select Duration
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_DURATIONS.map((preset) => (
              <motion.button
                key={preset.value}
                onClick={() => setSelectedDuration(preset.value)}
                className={cn(
                  'p-4 rounded-2xl border-2 transition-all duration-200',
                  selectedDuration === preset.value
                    ? 'border-light-accent dark:border-dark-accent bg-light-accent/10 dark:bg-dark-accent/10'
                    : 'border-light-border dark:border-dark-border hover:border-light-accent/50 dark:hover:border-dark-accent/50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                  {preset.label}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Auto Reveal Option */}
        <div className="p-4 bg-light-bg-secondary dark:bg-dark-bg rounded-2xl">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="auto-reveal"
              checked={autoReveal}
              onChange={(e) => setAutoReveal(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-light-border dark:border-dark-border text-light-accent dark:text-dark-accent focus:ring-light-accent dark:focus:ring-dark-accent"
            />
            <div className="flex-1">
              <label
                htmlFor="auto-reveal"
                className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary cursor-pointer"
              >
                Auto-reveal votes when timer expires
              </label>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Votes will be automatically revealed when the countdown reaches zero
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-light-accent/10 dark:bg-dark-accent/10 rounded-2xl border border-light-accent/20 dark:border-dark-accent/20">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5 text-light-accent dark:text-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-light-text-primary dark:text-dark-text-primary">
              Timer will run for <strong>{Math.floor(selectedDuration / 60)} minute{selectedDuration >= 120 ? 's' : ''}</strong>
              {autoReveal && ' and auto-reveal votes'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStart} className="flex-1">
            Start Timer
          </Button>
        </div>
      </div>
    </Modal>
  );
}