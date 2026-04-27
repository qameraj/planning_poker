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

  startRound: (storyTitle: string) => Promise<void>;
  castVote: (value: string) => Promise<void>;
  revealVotes: () => Promise<void>;

  listenToParticipants: (sessionId: string) => () => void;
  listenToVotes: (roundId: string) => () => void;
  listenToRound: (roundId: string) => () => void;

  leaveSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  currentUser: null,

  // ✅ CREATE SESSION
  createSession: async (name, userName, votingSystem, customDeck) => {
    const { data: sessionData, error } = await supabase
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

    if (error) throw error;

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
      },
      currentUser: user,
    });
  },

  // ✅ START ROUND (DB)
  startRound: async (storyTitle) => {
    const { session } = get();
    if (!session) return;

    const { data: roundData } = await supabase
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

    set({
      session: {
        ...session,
        currentRound: {
          id: roundData.id,
          storyTitle: roundData.story_title,
          votes: [],
          isRevealed: false,
          startedAt: new Date(roundData.created_at).getTime(),
        },
      },
    });
  },

  // ✅ CAST VOTE (UPSERT)
  castVote: async (value) => {
    const { session, currentUser } = get();
    if (!session?.currentRound || !currentUser) return;

    await supabase.from('votes').upsert(
      {
        round_id: session.currentRound.id,
        participant_id: currentUser.id,
        value,
      },
      { onConflict: 'round_id,participant_id' }
    );
  },

  // ✅ REVEAL VOTES (REALTIME)
  revealVotes: async () => {
    const { session } = get();
    if (!session?.currentRound) return;

    await supabase
      .from('rounds')
      .update({ is_revealed: true })
      .eq('id', session.currentRound.id);
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

  // ✅ REALTIME REVEAL SYNC
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
          const updated = payload.new;

          set((state) => {
            if (!state.session?.currentRound) return state;

            return {
              session: {
                ...state.session,
                currentRound: {
                  ...state.session.currentRound,
                  isRevealed: updated.is_revealed,
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