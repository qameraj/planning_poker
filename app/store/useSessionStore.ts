'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, Participant, Vote, Round, VotingSystem } from '@/lib/types';

interface SessionState {
  session: Session | null;
  currentUser: Participant | null;

  createSession: (
    name: string,
    userName: string,
    votingSystem: VotingSystem,
    customDeck?: string[]
  ) => Promise<void>;

  joinSession: (sessionId: string, userName: string, isSpectator: boolean) => void;
  startRound: (storyTitle: string) => void;
  castVote: (value: string) => void;
  revealVotes: () => Promise<void>;
  resetRound: () => void;
  leaveSession: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  currentUser: null,

  // ✅ SUPABASE CREATE SESSION
  createSession: async (name, userName, votingSystem, customDeck) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          {
            name,
            voting_system: votingSystem,
            custom_deck: customDeck || null,
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .insert([
          {
            session_id: sessionData.id,
            name: userName,
            is_spectator: false,
            is_online: true,
          },
        ])
        .select()
        .single();

      if (participantError) throw participantError;

      const user: Participant = {
        id: participantData.id,
        name: participantData.name,
        isSpectator: participantData.is_spectator,
        isOnline: participantData.is_online,
      };

      set({
        session: {
          id: sessionData.id,
          name: sessionData.name,
          votingSystem: sessionData.voting_system,
          customDeck: sessionData.custom_deck || undefined,
          createdAt: new Date(sessionData.created_at).getTime(),
          participants: [user],
          rounds: [],
          creatorId: user.id,
        },
        currentUser: user,
      });

    } catch (err: any) {
      console.error('CREATE SESSION ERROR:', err.message);
      alert(err.message);
    }
  },

  // ⏳ MOCK JOIN (we fix later)
  joinSession: (sessionId, userName, isSpectator) => {
    const userId = generateId();

    const user: Participant = {
      id: userId,
      name: userName,
      isSpectator,
      isOnline: true,
    };

    set({
      session: {
        id: sessionId,
        name: 'Temp Session',
        votingSystem: 'fibonacci',
        createdAt: Date.now(),
        participants: [user],
        rounds: [],
        creatorId: userId,
      },
      currentUser: user,
    });
  },

  startRound: (storyTitle) => {
    const { session } = get();
    if (!session) return;

    const round: Round = {
      id: generateId(),
      storyTitle,
      votes: [],
      isRevealed: false,
      startedAt: Date.now(),
    };

    set({
      session: {
        ...session,
        currentRound: round,
      },
    });
  },

  castVote: (value) => {
    const { session, currentUser } = get();
    if (!session || !currentUser || !session.currentRound) return;

    const existingVoteIndex = session.currentRound.votes.findIndex(
      (v) => v.participantId === currentUser.id
    );

    let updatedVotes = [...session.currentRound.votes];

    const newVote: Vote = {
      participantId: currentUser.id,
      value,
      timestamp: Date.now(),
    };

    if (existingVoteIndex >= 0) {
      updatedVotes[existingVoteIndex] = newVote;
    } else {
      updatedVotes.push(newVote);
    }

    set({
      session: {
        ...session,
        currentRound: {
          ...session.currentRound,
          votes: updatedVotes,
        },
      },
    });
  },

  revealVotes: async () => {
    const { session } = get();
    if (!session?.currentRound) return;
  
    try {
      const { error } = await supabase
        .from('rounds')
        .update({ is_revealed: true })
        .eq('id', session.currentRound.id);
  
      if (error) throw error;
  
      // ✅ Update local state AFTER DB success
      set({
        session: {
          ...session,
          currentRound: {
            ...session.currentRound,
            isRevealed: true,
            revealedAt: Date.now(),
          },
        },
      });
  
    } catch (err: any) {
      console.error('REVEAL VOTES ERROR:', err.message);
    }
  },
  resetRound: () => {
    const { session } = get();
    if (!session || !session.currentRound) return;

    const completedRound = { ...session.currentRound };

    set({
      session: {
        ...session,
        currentRound: undefined,
        rounds: [completedRound, ...session.rounds],
      },
    });
  },

  leaveSession: () => {
    set({ session: null, currentUser: null });
  },
}));