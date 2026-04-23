'use client';

import PokerCard from './PokerCard';
import { getDeckValues } from '@/app/lib/decks';
import { VotingSystem } from '@/app/lib/types';

interface PokerTableProps {
  votingSystem: VotingSystem;
  selectedValue?: string;
  onVote: (value: string) => void;
  customDeck?: string[];
  disabled?: boolean;
}

export default function PokerTable({
  votingSystem,
  selectedValue,
  onVote,
  customDeck,
  disabled,
}: PokerTableProps) {
  const deck = getDeckValues(votingSystem, customDeck);

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {deck.map((value) => (
        <PokerCard
          key={value}
          value={value}
          selectedValue={selectedValue}
          onSelect={onVote}
          disabled={disabled}
        />
      ))}
    </div>
  );
}