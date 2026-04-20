'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/app/ui/Card';           // Added 'app/' and capitalized 'Card'
import Button from '@/app/ui/Button';       // Capitalized 'Button'
import Input from '@/app/ui/Input';         // Capitalized 'Input'
import ThemeToggle from '@/app/ui/ThemeToggle'; // Capitalized and removed hyphen
import { useSessionStore } from '@/store/session-store';
import { VotingSystem } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { createSession, joinSession } = useSessionStore();
  
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [votingSystem, setVotingSystem] = useState<VotingSystem>('fibonacci');
  const [isSpectator, setIsSpectator] = useState(false);

  const handleCreateSession = () => {
    if (!sessionName.trim() || !userName.trim()) return;
    createSession(sessionName, userName, votingSystem);
    router.push('/session');
  };

  const handleJoinSession = () => {
    if (!sessionId.trim() || !userName.trim()) return;
    joinSession(sessionId, userName, isSpectator);
    router.push('/session');
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-light-accent dark:bg-dark-accent rounded-xl flex items-center justify-center shadow-soft"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  Planning Poker
                </h1>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Agile estimation made simple
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Welcome to Planning Poker
          </h2>
          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
            Collaborate with your team to estimate work with ease
          </p>
        </motion.div>

        {!mode ? (
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                hover 
                onClick={() => setMode('create')}
                className="p-8 h-full cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-light-accent/10 dark:bg-dark-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-light-accent dark:text-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Create Session
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Start a new planning poker session for your team
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                hover 
                onClick={() => setMode('join')}
                className="p-8 h-full cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-light-accent/10 dark:bg-dark-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-light-accent dark:text-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                    Join Session
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Join an existing session with a session ID
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 max-w-md mx-auto">
              <button
                onClick={() => setMode(null)}
                className="mb-6 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
              >
                ← Back
              </button>

              <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
                {mode === 'create' ? 'Create New Session' : 'Join Session'}
              </h3>

              <div className="space-y-4">
                {mode === 'create' && (
                  <>
                    <Input
                      label="Session Name"
                      placeholder="Sprint 23 Planning"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                        Voting System
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['fibonacci', 'tshirt', 'custom'] as VotingSystem[]).map((system) => (
                          <button
                            key={system}
                            onClick={() => setVotingSystem(system)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              votingSystem === system
                                ? 'bg-light-accent dark:bg-dark-accent text-white shadow-soft'
                                : 'bg-light-card dark:bg-dark-card text-light-text-secondary dark:text-dark-text-secondary border border-light-border dark:border-dark-border hover:border-light-accent dark:hover:border-dark-accent'
                            }`}
                          >
                            {system === 'fibonacci' ? 'Fibonacci' : system === 'tshirt' ? 'T-Shirt' : 'Custom'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {mode === 'join' && (
                  <>
                    <Input
                      label="Session ID"
                      placeholder="Enter session ID"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                    />
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="spectator"
                        checked={isSpectator}
                        onChange={(e) => setIsSpectator(e.target.checked)}
                        className="w-4 h-4 rounded border-light-border dark:border-dark-border text-light-accent dark:text-dark-accent focus:ring-light-accent dark:focus:ring-dark-accent"
                      />
                      <label htmlFor="spectator" className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        Join as spectator (watch only)
                      </label>
                    </div>
                  </>
                )}

                <Input
                  label="Your Name"
                  placeholder="John Doe"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={mode === 'create' ? handleCreateSession : handleJoinSession}
                  disabled={
                    mode === 'create'
                      ? !sessionName.trim() || !userName.trim()
                      : !sessionId.trim() || !userName.trim()
                  }
                >
                  {mode === 'create' ? 'Create Session' : 'Join Session'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}