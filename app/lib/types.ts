export type VotingSystem = 'fibonacci' | 'tshirt' | 'custom';

export type FibonacciValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '?' | '☕';
export type TShirtValue = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '?';

export interface Participant {
  id: string;
  name: string;
  isSpectator: boolean;
  isOnline: boolean;
}

export interface Vote {
  participantId: string;
  value: string;
  timestamp: number;
}

export interface Round {
  id: string;
  storyTitle: string;
  votes: Vote[];
  isRevealed: boolean;
  startedAt: number;
  revealedAt?: number;
}

export interface Session {
  id: string;
  name: string;
  votingSystem: VotingSystem;
  customDeck?: string[];
  createdAt: number;
  currentRound?: Round;
  rounds: Round[];
  participants: Participant[];
  creatorId: string;
}