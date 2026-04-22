'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import Card from '@/app/ui/Card';
import Button from '@/app/ui/Button';
import Input from '@/app/ui/Input';

// Poker Components
import VotingCard from '@/app/poker/VotingCard';
import ParticipantCard from '@/app/poker/ParticipantCard';
import Timer from '@/app/poker/Timer';
import TimerSettings from '@/app/poker/TimerSettings';

// Session Components
import SessionHeader from '@/app/session/SessionHeader';

// Store & Utils
import { useSessionStore } from '@/app/store/useSessionStore';
import { getDeckValues } from '@/app/lib/decks';

export default function SessionPage() {
  const router = useRouter();
  const { session, currentUser, startRound, castVote, revealVotes, resetRound, leaveSession } = useSessionStore();
  
  const [storyTitle, setStoryTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  useEffect(() => {
    if (!session || !currentUser) {
      router.push('/');
    }
  }, [session, currentUser, router]);

  if (!session || !currentUser) {
    return null;
  }

  const deckValues = getDeckValues(session.votingSystem, session.customDeck);
  const currentRound = session.currentRound;
  const currentUserVote = currentRound?.votes.find(v => v.participantId === currentUser.id);
  const isRevealed = currentRound?.isRevealed || false;
  
  const activeParticipants = session.participants.filter(p => !p.isSpectator);
  const spectators = session.participants.filter(p => p.isSpectator);
  const votedCount = currentRound?.votes.length || 0;
  const totalVoters = activeParticipants.length;

  const handleStartRound = (timerDuration?: number, timerAutoReveal?: boolean) => {
    if (!storyTitle.trim()) return;
    startRound(storyTitle, timerDuration, timerAutoReveal);
    setStoryTitle('');
    setSelectedCard(null);
  };

  const handleStartRoundWithTimer = () => {
    if (!storyTitle.trim()) return;
    setShowTimerSettings(true);
  };

  const handleStartRoundWithoutTimer = () => {
    handleStartRound();
  };

  const handleTimerComplete = () => {
    if (currentRound?.timerAutoReveal) {
      revealVotes();
    }
  };

  const handleVote = (value: string) => {
    if (currentUser.isSpectator || isRevealed) return;
    setSelectedCard(value);
    castVote(value);
  };

  const handleReveal = () => {
    revealVotes();
  };

  const handleReset = () => {
    resetRound();
    setSelectedCard(null);
  };

  const handleLeaveSession = () => {
    leaveSession();
    router.push('/');
  };

  // Calculate statistics for revealed votes
  const getVoteStats = () => {
    if (!currentRound || !isRevealed) return null;
    
    const numericVotes = currentRound.votes
      .map(v => parseFloat(v.value))
      .filter(v => !isNaN(v));
    
    if (numericVotes.length === 0) return null;
    
    const average = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
    const sorted = [...numericVotes].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    return { average: average.toFixed(1), median };
  };

  const stats = getVoteStats();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      
      {/* Header */}
      <SessionHeader
        sessionName={session.name}
        sessionId={session.id}
        userName={currentUser.name}
        isSpectator={currentUser.isSpectator}
        onLeave={handleLeaveSession}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Voting Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Story Input or Current Story */}
            {!currentRound ? (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                  Start a New Round
                </h2>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter story title (e.g., 'User authentication')"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleStartRoundWithoutTimer()}
                    className="w-full"
                  />
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleStartRoundWithoutTimer} 
                      disabled={!storyTitle.trim()}
                      className="flex-1"
                    >
                      Start Round
                    </Button>
                    <Button 
                      onClick={handleStartRoundWithTimer} 
                      disabled={!storyTitle.trim()}
                      variant="secondary"
                      className="flex-1"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      With Timer
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                      {currentRound.storyTitle}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      <span>
                        Votes: {votedCount} / {totalVoters}
                      </span>
                      {isRevealed && stats && (
                        <>
                          <span>•</span>
                          <span>Average: {stats.average}</span>
                          <span>•</span>
                          <span>Median: {stats.median}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Timer Display */}
                  {currentRound.timerDuration && (
                    <div className="ml-4">
                      <Timer
                        duration={currentRound.timerDuration}
                        isActive={currentRound.timerActive || false}
                        onComplete={handleTimerComplete}
                        autoReveal={currentRound.timerAutoReveal}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2 ml-4">
                    {!isRevealed && votedCount > 0 && (
                      <Button variant="primary" onClick={handleReveal}>
                        Reveal Votes
                      </Button>
                    )}
                    {isRevealed && (
                      <Button variant="secondary" onClick={handleReset}>
                        New Round
                      </Button>
                    )}
                  </div>
                </div>

                {/* Voting Progress */}
                {!isRevealed && (
                  <div className="mb-6">
                    <div className="h-2 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(votedCount / totalVoters) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-light-accent dark:bg-dark-accent"
                      />
                    </div>
                  </div>
                )}

                {/* Voting Cards */}
                {!currentUser.isSpectator && (
                  <div>
                    <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-3">
                      {isRevealed ? 'Round Complete' : 'Select Your Estimate'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {deckValues.map((value) => (
                        <VotingCard
                          key={value}
                          value={value}
                          isSelected={selectedCard === value}
                          isRevealed={isRevealed}
                          onClick={() => handleVote(value)}
                          disabled={isRevealed}
                          size="md"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reveal Animation */}
                <AnimatePresence>
                  {isRevealed && stats && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="mt-6 p-6 bg-light-accent/10 dark:bg-dark-accent/10 rounded-2xl border-2 border-light-accent dark:border-dark-accent"
                    >
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                          Voting Results
                        </h3>
                        <div className="flex justify-center gap-8">
                          <div>
                            <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
                              {stats.average}
                            </p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                              Average
                            </p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-light-accent dark:text-dark-accent">
                              {stats.median}
                            </p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                              Median
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )}
          </div>

          {/* Participants Sidebar */}
          <div className="space-y-6">
            {/* Active Voters */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                Participants ({activeParticipants.length})
              </h3>
              <div className="space-y-2">
                {activeParticipants.map((participant) => {
                  const vote = currentRound?.votes.find(v => v.participantId === participant.id);
                  return (
                    <ParticipantCard
                      key={participant.id}
                      participant={participant}
                      vote={vote}
                      isRevealed={isRevealed}
                    />
                  );
                })}
              </div>
            </Card>

            {/* Spectators */}
            {spectators.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                  Spectators ({spectators.length})
                </h3>
                <div className="space-y-2">
                  {spectators.map((spectator) => (
                    <ParticipantCard
                      key={spectator.id}
                      participant={spectator}
                      isRevealed={isRevealed}
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Timer Settings Modal */}
      <TimerSettings
        isOpen={showTimerSettings}
        onClose={() => setShowTimerSettings(false)}
        onStart={(duration, autoReveal) => {
          handleStartRound(duration, autoReveal);
          setShowTimerSettings(false);
        }}
      />
    </div>
  );
}