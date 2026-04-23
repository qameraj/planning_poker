'use client';

import PokerCard from './PokerCard';

// ✅ FIXED: Changed 'decks' to 'deck' to match your actual filename
import { getDeckValues } from '@/lib/decks';

// ✅ FIXED: Pointing to the root lib folder
import { VotingSystem } from '@/lib/types';

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