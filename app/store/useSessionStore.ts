'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, Participant, Vote, Round, VotingSystem } from '@/lib/types';

interface SessionState {
  session: Session | null;
  currentUser: Participant | null;
  error: string | null;
  loading: boolean;

  // Auth
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

  // Voting
  startRound: (storyTitle: string) => Promise<void>;
  castVote: (value: string) => Promise<void>;
  revealVotes: () => Promise<void>;
  resetRound: () => Promise<void>;

  // Real-time listeners
  listenToParticipants: (sessionId: string) => () => void;
  listenToVotes: (roundId: string) => () => void;
  listenToRound: (roundId: string) => () => void;

  // Utilities
  getVoteStats: () => { avg: number; min: number; max: number } | null;
  setError: (error: string | null) => void;
  leaveSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  currentUser: null,
  error: null,
  loading: false,

  setError: (error) => set({ error }),

  // ========== CREATE SESSION ==========
  createSession: async (name, userName, votingSystem, customDeck) => {
    try {
      set({ loading: true, error: null });

      // Create session
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

      if (sessionError || !sessionData) {
        throw new Error(sessionError?.message || 'Failed to create session');
      }

      // Add creator as participant
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

      if (participantError || !participantData) {
        throw new Error(participantError?.message || 'Failed to create participant');
      }

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
        error: null,
        loading: false,
      });
    } catch (err: any) {
      const message = err.message || 'Failed to create session';
      console.error('Create session error:', err);
      set({ error: message, loading: false });
      throw err;
    }
  },

  // ========== JOIN SESSION ==========
  joinSession: async (sessionId, userName, isSpectator) => {
    try {
      set({ loading: true, error: null });

      // Validate input
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required');
      }
      if (!userName?.trim()) {
        throw new Error('User name is required');
      }

      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          throw new Error(`Session not found: ${sessionId}`);
        }
        throw new Error(`Failed to fetch session: ${sessionError.message}`);
      }

      if (!sessionData) {
        throw new Error('Session does not exist');
      }

      // Add participant
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

      if (participantError || !participantData) {
        throw new Error(participantError?.message || 'Failed to join session');
      }

      // Get all participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', sessionId);

      if (participantsError) {
        throw new Error(participantsError.message);
      }

      const participants: Participant[] =
        participantsData?.map((p) => ({
          id: p.id,
          name: p.name,
          isSpectator: p.is_spectator,
          isOnline: p.is_online,
        })) || [];

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
          participants,
          rounds: [],
          creatorId: sessionData.creator_id || participants[0]?.id,
        },
        currentUser: user,
        error: null,
        loading: false,
      });
    } catch (err: any) {
      const message = err.message || 'Failed to join session';
      console.error('Join session error:', err);
      set({ error: message, loading: false });
      throw err;
    }
  },

  // ========== START ROUND ==========
  startRound: async (storyTitle) => {
    try {
      const { session } = get();
      if (!session) {
        throw new Error('No active session');
      }

      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .insert([
          {
            session_id: session.id,
            story_title: storyTitle,
            is_revealed: false,
          },
        ])
        .select()
        .single();

      if (roundError || !roundData) {
        throw new Error(roundError?.message || 'Failed to create round');
      }

      const newRound: Round = {
        id: roundData.id,
        storyTitle: roundData.story_title,
        votes: [],
        isRevealed: false,
        startedAt: new Date(roundData.started_at || roundData.created_at).getTime(),
      };

      set((state) => ({
        session: state.session
          ? {
              ...state.session,
              currentRound: newRound,
              rounds: [...state.session.rounds, newRound],
            }
          : null,
      }));
    } catch (err: any) {
      const message = err.message || 'Failed to start round';
      console.error('Start round error:', err);
      set({ error: message });
      throw err;
    }
  },

  // ========== CAST VOTE ==========
  castVote: async (value) => {
    try {
      const { session, currentUser } = get();
      if (!session?.currentRound || !currentUser) {
        throw new Error('No active round or user');
      }

      const { error } = await supabase.from('votes').upsert(
        {
          round_id: session.currentRound.id,
          participant_id: currentUser.id,
          value,
        },
        { onConflict: 'round_id,participant_id' }
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      const message = err.message || 'Failed to cast vote';
      console.error('Cast vote error:', err);
      set({ error: message });
      throw err;
    }
  },

  // ========== REVEAL VOTES ==========
  revealVotes: async () => {
    try {
      const { session } = get();
      if (!session?.currentRound) {
        throw new Error('No active round');
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from('rounds')
        .update({ is_revealed: true, revealed_at: now })
        .eq('id', session.currentRound.id);

      if (error) {
        throw new Error(error.message);
      }

      set((state) => {
        if (!state.session?.currentRound) return state;
        return {
          session: {
            ...state.session,
            currentRound: {
              ...state.session.currentRound,
              isRevealed: true,
            },
          },
        };
      });
    } catch (err: any) {
      const message = err.message || 'Failed to reveal votes';
      console.error('Reveal votes error:', err);
      set({ error: message });
      throw err;
    }
  },

  // ========== RESET ROUND ==========
  resetRound: async () => {
    try {
      const { session } = get();
      if (!session?.currentRound) {
        throw new Error('No active round');
      }

      // Delete all votes
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('round_id', session.currentRound.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Reset reveal flag
      const { error: updateError } = await supabase
        .from('rounds')
        .update({ is_revealed: false, revealed_at: null })
        .eq('id', session.currentRound.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      set((state) => {
        if (!state.session?.currentRound) return state;
        return {
          session: {
            ...state.session,
            currentRound: {
              ...state.session.currentRound,
              votes: [],
              isRevealed: false,
            },
          },
        };
      });
    } catch (err: any) {
      const message = err.message || 'Failed to reset round';
      console.error('Reset round error:', err);
      set({ error: message });
      throw err;
    }
  },

  // ========== GET VOTE STATS ==========
  getVoteStats: () => {
    const { session } = get();
    if (!session?.currentRound?.votes) return null;

    const numericVotes = session.currentRound.votes
      .map((v) => parseFloat(v.value || ''))
      .filter((v) => !isNaN(v));

    if (numericVotes.length === 0) return null;

    const sum = numericVotes.reduce((a, b) => a + b, 0);
    const avg = sum / numericVotes.length;
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);

    return {
      avg: parseFloat(avg.toFixed(2)),
      min,
      max,
    };
  },

  // ========== LISTEN TO PARTICIPANTS ==========
  listenToParticipants: (sessionId) => {
    const channel = supabase
      .channel(`participants-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          const { data } = await supabase
            .from('participants')
            .select('*')
            .eq('session_id', sessionId);

          if (!data) return;

          const participants = data.map((p) => ({
            id: p.id,
            name: p.name,
            isSpectator: p.is_spectator,
            isOnline: p.is_online,
          }));

          set((state) => ({
            session: state.session
              ? { ...state.session, participants }
              : null,
          }));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // ========== LISTEN TO VOTES ==========
  listenToVotes: (roundId) => {
    const channel = supabase
      .channel(`votes-${roundId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `round_id=eq.${roundId}`,
        },
        async () => {
          const { data } = await supabase
            .from('votes')
            .select('*')
            .eq('round_id', roundId);

          if (!data) return;

          const votes: Vote[] = data.map((v) => ({
            participantId: v.participant_id,
            value: v.value,
            timestamp: new Date(v.created_at).getTime(),
          }));

          set((state) => {
            if (!state.session?.currentRound) return state;

            return {
              session: {
                ...state.session,
                currentRound: {
                  ...state.session.currentRound,
                  votes,
                },
              },
            };
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // ========== LISTEN TO ROUND (REVEAL) ==========
  listenToRound: (roundId) => {
    const channel = supabase
      .channel(`round-${roundId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rounds',
          filter: `id=eq.${roundId}`,
        },
        (payload) => {
          set((state) => {
            if (!state.session?.currentRound) return state;

            return {
              session: {
                ...state.session,
                currentRound: {
                  ...state.session.currentRound,
                  isRevealed: payload.new.is_revealed,
                },
              },
            };
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // ========== LEAVE SESSION ==========
  leaveSession: () => {
    set({ session: null, currentUser: null, error: null });
  },
}));