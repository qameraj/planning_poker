'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// UI Components
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

// Poker Components
import VotingCard from '../poker/VotingCard';
import ParticipantCard from './ParticipantList';
import TimerSettings from '../poker/timer-settings';

// Session Components
import SessionHeader from './SessionHeader';

// Store & Utils
import { useSessionStore } from '../store/useSessionStore';
import { getDeckValues } from '@/lib/decks';

export default function SessionPage() {
  const {
    session,
    currentUser,
    castVote,
    revealVotes,
    resetRound,
    leaveSession,
    listenToParticipants,
    listenToVotes,
  } = useSessionStore();

  const router = useRouter();

  const [storyTitle, setStoryTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  // ✅ Realtime participants
  useEffect(() => {
    if (!session?.id) return;
    const unsub = listenToParticipants(session.id);
    return () => unsub();
  }, [session?.id]);

  // ✅ Realtime votes
  useEffect(() => {
    if (!session?.currentRound?.id) return;
    const unsub = listenToVotes(session.currentRound.id);
    return () => unsub();
  }, [session?.currentRound?.id]);

  // ✅ Redirect if session missing
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
  const progress = totalVoters === 0 ? 0 : (votedCount / totalVoters) * 100;

  const handleVote = (value: string) => {
    if (currentUser.isSpectator || isRevealed) return;
    setSelectedCard(value);
    castVote(value);
  };

  const handleLeaveSession = () => {
    leaveSession();
    router.push('/');
  };

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

          <Card className="p-6">

            <h2 className="text-xl font-bold mb-2">
              {currentRound?.storyTitle || 'Story'}
            </h2>

            <p className="text-sm mb-4">
              {votedCount} / {totalVoters} voted
            </p>

            {!isRevealed && (
              <div className="h-2 bg-gray-200 rounded mb-4">
                <motion.div
                  className="h-full bg-blue-500"
                  animate={{ width: `${progress}%` }}
                />
              </div>
            )}

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
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          <Card className="p-4">
            <h3 className="mb-3 font-semibold">Participants</h3>

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
              <h3 className="mb-3 font-semibold">Spectators</h3>

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
        onStart={() => {}}
      />
    </div>
  );
}