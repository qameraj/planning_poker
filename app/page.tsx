'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// UI Components
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import ThemeToggle from './ui/ThemeToggle';

// Store & Types
import { useSessionStore } from './store/useSessionStore';
import { VotingSystem } from '../lib/types';

export default function HomePage() {
  const router = useRouter();
  const { createSession, joinSession } = useSessionStore();

  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [votingSystem, setVotingSystem] = useState<VotingSystem>('fibonacci');
  const [isSpectator, setIsSpectator] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSession = async () => {
    if (!sessionName.trim() || !userName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await createSession(sessionName, userName, votingSystem);
      router.push('/session');
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionId.trim() || !userName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await joinSession(sessionId, userName, isSpectator);
      router.push('/session');
    } catch (err: any) {
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">

      {/* Header */}
      <header className="border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Planning Poker
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">

        {!mode ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              hover
              onClick={() => setMode('create')}
              className="p-8 cursor-pointer text-center text-lg font-semibold"
            >
              Create Session
            </Card>

            <Card
              hover
              onClick={() => setMode('join')}
              className="p-8 cursor-pointer text-center text-lg font-semibold"
            >
              Join Session
            </Card>
          </div>
        ) : (
          <Card className="p-8 max-w-md mx-auto">

            <button
              onClick={() => setMode(null)}
              className="mb-4 text-sm font-medium text-light-text-secondary hover:text-light-text-primary"
            >
              ← Back
            </button>

            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">

              {mode === 'create' && (
                <>
                  <Input
                    label="Session Name"
                    value={sessionName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSessionName(e.target.value)
                    }
                  />

                  {/* Voting System Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    {(['fibonacci', 'tshirt', 'custom'] as VotingSystem[]).map((system) => (
                      <button
                        key={system}
                        onClick={() => setVotingSystem(system)}
                        className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                          votingSystem === system
                            ? 'bg-light-accent text-white shadow-soft'
                            : 'border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-secondary dark:hover:bg-dark-card'
                        }`}
                      >
                        {system}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {mode === 'join' && (
                <>
                  <Input
                    label="Session ID"
                    value={sessionId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSessionId(e.target.value)
                    }
                  />

                  <label className="flex items-center gap-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                    <input
                      type="checkbox"
                      checked={isSpectator}
                      onChange={(e) => setIsSpectator(e.target.checked)}
                    />
                    Spectator
                  </label>
                </>
              )}

              <Input
                label="Your Name"
                value={userName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUserName(e.target.value)
                }
              />

              <Button
                onClick={mode === 'create' ? handleCreateSession : handleJoinSession}
                disabled={loading}
                className="w-full py-3 text-base font-semibold rounded-2xl"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'create'
                  ? 'Create Session'
                  : 'Join Session'}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}