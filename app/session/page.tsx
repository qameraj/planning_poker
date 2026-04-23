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
import { getDeckValues } from '@/lib/decks';

export default function SessionPage() {
  const router = useRouter();

  const {
    session,
    currentUser,
    startRound,
    castVote,
    revealVotes,
    resetRound,
    leaveSession,
  } = useSessionStore();

  const [storyTitle, setStoryTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  useEffect(() => {
    if (!session || !currentUser) {
      router.push('/');
    }
  }, [session, currentUser, router]);

  if (!session || !currentUser) return null;

  const deckValues = getDeckValues(session.votingSystem, session.customDeck);
  const currentRound = session.currentRound;

  const isRevealed = currentRound?.isRevealed || false;

  const activeParticipants = session.participants.filter(p => !p.isSpectator);
  const spectators = session.participants.filter(p => p.isSpectator);

  const votedCount = currentRound?.votes.length || 0;
  const totalVoters = activeParticipants.length;

  // ✅ SAFE PROGRESS (no divide by zero)
  const progress = totalVoters === 0 ? 0 : (votedCount / totalVoters) * 100;

  const handleStartRound = (timerDuration?: number, timerAutoReveal?: boolean) => {
    if (!storyTitle.trim()) return;
    startRound(storyTitle, timerDuration, timerAutoReveal);
    setStoryTitle('');
    setSelectedCard(null);
  };

  const handleVote = (value: string) => {
    if (currentUser.isSpectator || isRevealed) return;
    setSelectedCard(value);
    castVote(value);
  };

  const handleLeaveSession = () => {
    leaveSession();
    router.push('/');
  };

  const stats = (() => {
    if (!currentRound || !isRevealed) return null;

    const nums = currentRound.votes
      .map(v => parseFloat(v.value))
      .filter(v => !isNaN(v));

    if (!nums.length) return null;

    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sorted = [...nums].sort((a, b) => a - b);

    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    return { average: avg.toFixed(1), median };
  })();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">

      <SessionHeader
        sessionName={session.name}
        sessionId={session.id}
        userName={currentUser.name}
        isSpectator={currentUser.isSpectator}
        onLeave={handleLeaveSession}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {!currentRound ? (
            <Card className="p-6">
              <Input
                placeholder="Story title"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
              />

              <div className="flex gap-2 mt-3">
                <Button onClick={() => handleStartRound()} disabled={!storyTitle}>
                  Start
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setShowTimerSettings(true)}
                  disabled={!storyTitle}
                >
                  With Timer
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6">

              <h2 className="text-xl font-bold mb-2">
                {currentRound.storyTitle}
              </h2>

              <p className="text-sm mb-4">
                {votedCount} / {totalVoters} voted
              </p>

              {/* Progress */}
              {!isRevealed && (
                <div className="h-2 bg-gray-200 rounded mb-4">
                  <motion.div
                    className="h-full bg-blue-500"
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Cards */}
              {!currentUser.isSpectator && (
                <div className="flex flex-wrap gap-2">
                  {deckValues.map(v => (
                    <VotingCard
                      key={v}
                      value={v}
                      isSelected={selectedCard === v}
                      isRevealed={isRevealed}
                      onClick={() => handleVote(v)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {!isRevealed && votedCount > 0 && (
                  <Button onClick={revealVotes}>Reveal</Button>
                )}
                {isRevealed && (
                  <Button onClick={resetRound}>New Round</Button>
                )}
              </div>

              {/* Results */}
              {isRevealed && stats && (
                <div className="mt-6 text-center">
                  <p>Average: {stats.average}</p>
                  <p>Median: {stats.median}</p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          <Card className="p-4">
            <h3 className="mb-3">Participants</h3>

            {activeParticipants.map(p => {
              const vote = currentRound?.votes.find(v => v.participantId === p.id);
              return (
                <ParticipantCard
                  key={p.id}
                  participant={p}
                  vote={vote}
                  isRevealed={isRevealed}
                />
              );
            })}
          </Card>

          {spectators.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3">Spectators</h3>

              {spectators.map(p => (
                <ParticipantCard
                  key={p.id}
                  participant={p}
                  isRevealed={isRevealed}
                />
              ))}
            </Card>
          )}
        </div>
      </main>

      <TimerSettings
        isOpen={showTimerSettings}
        onClose={() => setShowTimerSettings(false)}
        onStart={(d, auto) => {
          handleStartRound(d, auto);
          setShowTimerSettings(false);
        }}
      />
    </div>
  );
}