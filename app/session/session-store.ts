import { create } from 'zustand';
import { Session, Participant, Vote, Round, VotingSystem } from '@/lib/types';

interface SessionState {
  session: Session | null;
  currentUser: Participant | null;
  
  // Actions
  createSession: (name: string, userName: string, votingSystem: VotingSystem, customDeck?: string[]) => void;
  joinSession: (sessionId: string, userName: string, isSpectator: boolean) => void;
  startRound: (storyTitle: string, timerDuration?: number, timerAutoReveal?: boolean) => void;
  castVote: (value: string) => void;
  revealVotes: () => void;
  resetRound: () => void;
  leaveSession: () => void;
  startTimer: () => void;
  stopTimer: () => void;
}

// Mock data generator
const generateId = () => Math.random().toString(36).substring(2, 11);

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  currentUser: null,

  createSession: (name, userName, votingSystem, customDeck) => {
    const userId = generateId();
    const sessionId = generateId();
    
    const user: Participant = {
      id: userId,
      name: userName,
      isSpectator: false,
      isOnline: true,
    };

    const session: Session = {
      id: sessionId,
      name,
      votingSystem,
      customDeck,
      createdAt: Date.now(),
      participants: [user],
      rounds: [],
      creatorId: userId,
    };

    set({ session, currentUser: user });
  },

  joinSession: (sessionId, userName, isSpectator) => {
    const userId = generateId();
    
    const user: Participant = {
      id: userId,
      name: userName,
      isSpectator,
      isOnline: true,
    };

    // Mock: Create a new session with some existing participants
    const mockParticipants: Participant[] = [
      { id: generateId(), name: 'Alice Johnson', isSpectator: false, isOnline: true },
      { id: generateId(), name: 'Bob Smith', isSpectator: false, isOnline: true },
      { id: generateId(), name: 'Carol Davis', isSpectator: true, isOnline: true },
    ];

    const session: Session = {
      id: sessionId,
      name: 'Sprint Planning Session',
      votingSystem: 'fibonacci',
      createdAt: Date.now(),
      participants: [...mockParticipants, user],
      rounds: [],
      creatorId: mockParticipants[0].id,
    };

    set({ session, currentUser: user });
  },

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
      timerActive: timerDuration ? true : false,
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

    if (existingVoteIndex >= 0) {
      updatedVotes[existingVoteIndex] = {
        participantId: currentUser.id,
        value,
        timestamp: Date.now(),
      };
    } else {
      updatedVotes.push({
        participantId: currentUser.id,
        value,
        timestamp: Date.now(),
      });
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