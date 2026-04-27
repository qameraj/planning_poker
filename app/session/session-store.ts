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

  castVote: (value: string) => Promise<void>;

  listenToParticipants: (sessionId: string) => () => void;
  listenToVotes: (roundId: string) => () => void;

  leaveSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  currentUser: null,

  // ✅ CREATE SESSION
  createSession: async (name, userName, votingSystem, customDeck) => {
    const { data: sessionData } = await supabase
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

    const { data: participantData } = await supabase
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
        currentRound: {
          id: crypto.randomUUID(),
          storyTitle: 'Story',
          votes: [],
          isRevealed: false,
          startedAt: Date.now(),
        },
      },
      currentUser: user,
    });
  },

  // ✅ JOIN SESSION
  joinSession: async (sessionId, userName, isSpectator) => {
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: participantData } = await supabase
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
        creatorId: participants[0]?.id,
        currentRound: {
          id: crypto.randomUUID(),
          storyTitle: 'Story',
          votes: [],
          isRevealed: false,
          startedAt: Date.now(),
        },
      },
      currentUser: user,
    });
  },

  // ✅ REALTIME VOTE (UPSERT)
  castVote: async (value) => {
    const { session, currentUser } = get();
    if (!session || !currentUser || !session.currentRound) return;

    await supabase.from('votes').upsert(
      {
        round_id: session.currentRound.id,
        participant_id: currentUser.id,
        value,
      },
      { onConflict: 'round_id,participant_id' }
    );
  },

  // ✅ REALTIME PARTICIPANTS
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

  // ✅ REALTIME VOTES
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
            if (!state.session || !state.session.currentRound) return state;

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

  leaveSession: () => {
    set({ session: null, currentUser: null });
  },
}));