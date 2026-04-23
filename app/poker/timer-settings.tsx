'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/app/ui/Button';
import Modal from '@/app/ui/Modal';
import { cn } from '@lib/utils';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Timer Settings">
      <div className="space-y-6">

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Select Duration
          </label>

          <div className="grid grid-cols-2 gap-3">
            {PRESET_DURATIONS.map((preset) => (
              <motion.button
                key={preset.value}
                onClick={() => setSelectedDuration(preset.value)}
                className={cn(
                  'p-4 rounded-2xl border-2 transition-all',
                  selectedDuration === preset.value
                    ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
                    : 'border-gray-300 dark:border-gray-600'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl">{preset.icon}</div>
                <div className="text-sm font-medium">{preset.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Auto Reveal */}
        <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoReveal}
              onChange={(e) => setAutoReveal(e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium">
                Auto-reveal votes
              </p>
              <p className="text-xs opacity-70">
                Reveal automatically when timer ends
              </p>
            </div>
          </label>
        </div>

        {/* Preview */}
        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-sm">
          Timer: <strong>{selectedDuration / 60} min</strong>
          {autoReveal && ' + auto reveal'}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>

          <Button onClick={handleStart} className="flex-1">
            Start
          </Button>
        </div>

      </div>
    </Modal>
  );
}