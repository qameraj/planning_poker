import { create } from 'zustand';
import { supabase } from '@/app/lib/supabaseClient';

// Types
import { Session, Participant, Vote, Round, VotingSystem } from '@/app/lib/types';

interface SessionState {
  session: Session | null;
  currentUser: Participant | null;

  // ✅ Updated to async
  createSession: (
    name: string,
    userName: string,
    votingSystem: VotingSystem,
    customDeck?: string[]
  ) => Promise<void>;

  joinSession: (sessionId: string, userName: string, isSpectator: boolean) => void;
  startRound: (storyTitle: string) => void;
  castVote: (value: string) => void;
  revealVotes: () => void;
  resetRound: () => void;
  leaveSession: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  currentUser: null,

  // ✅ REAL SUPABASE IMPLEMENTATION
  createSession: async (name, userName, votingSystem, customDeck) => {
    try {
      // 1. Insert session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          {
            name,
            voting_system: votingSystem,
            custom_deck: customDeck || [],
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Insert participant
      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .insert([
          {
            session_id: sessionData.id,
            name: userName,
            is_spectator: false,
          },
        ])
        .select()
        .single();

      if (participantError) throw participantError;

      // 3. Update local state
      set({
        session: {
          id: sessionData.id,
          name: sessionData.name,
          votingSystem: sessionData.voting_system,
          customDeck: sessionData.custom_deck,
          createdAt: new Date(sessionData.created_at).getTime(),
          participants: [participantData],
          rounds: [],
          creatorId: participantData.id,
        },
        currentUser: participantData,
      });

    } catch (err: any) {
      console.error('CREATE SESSION ERROR:', err.message);
      throw err;
    }
  },

  // ⏳ KEEP MOCK FOR NOW (next step we fix this)
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
}));