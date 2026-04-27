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

  joinSession: (
    sessionId: string,
    userName: string,
    isSpectator: boolean
  ) => Promise<void>;

  startRound: (storyTitle: string, timerDuration?: number, timerAutoReveal?: boolean) => void;
  castVote: (value: string) => void;
  revealVotes: () => void;
  resetRound: () => void;
  leaveSession: () => void;
  startTimer: () => void;
  stopTimer: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  currentUser: null,

  // ✅ CREATE SESSION (REAL DB)
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

  // ✅ JOIN SESSION (REAL DB)
  joinSession: async (sessionId, userName, isSpectator) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Session not found');
      }

      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .insert([
          {
            session_id: sessionId,
            name: userName,
            is_spectator: isSpectator,
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

      const { data: participantsData } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', sessionId);

      const participants: Participant[] =
        participantsData?.map((p) => ({
          id: p.id,
          name: p.name,
          isSpectator: p.is_spectator,
          isOnline: p.is_online,
        })) || [];

      set({
        session: {
          id: sessionData.id,
          name: sessionData.name,
          votingSystem: sessionData.voting_system,
          customDeck: sessionData.custom_deck || undefined,
          createdAt: new Date(sessionData.created_at).getTime(),
          participants,
          rounds: [],
          creatorId: participants[0]?.id,
        },
        currentUser: user,
      });

    } catch (err: any) {
      console.error('JOIN SESSION ERROR:', err.message);
      alert(err.message);
    }
  },

  // 🔁 KEEP EXISTING LOGIC (NO CHANGE)
  startRound: (storyTitle, timerDuration, timerAutoReveal) => {
    const { session } = get();
    if (!session) return;

    const round: Round = {
      id: generateId(),
      storyTitle,
      votes: [],
      isRevealed: false,
      startedAt: Date.now(),
      timerDuration,
      timerAutoReveal,
      timerActive: !!timerDuration,
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

    const updatedVotes = [...session.currentRound.votes];

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

  revealVotes: () => {
    const { session } = get();
    if (!session || !session.currentRound) return;

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

  startTimer: () => {
    const { session } = get();
    if (!session || !session.currentRound) return;

    set({
      session: {
        ...session,
        currentRound: {
          ...session.currentRound,
          timerActive: true,
        },
      },
    });
  },

  stopTimer: () => {
    const { session } = get();
    if (!session || !session.currentRound) return;

    set({
      session: {
        ...session,
        currentRound: {
          ...session.currentRound,
          timerActive: false,
        },
      },
    });
  },
}));