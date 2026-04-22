'use client';

import VotingCard from './VotingCard';

interface PokerCardProps {
  value: string;
  selectedValue?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function PokerCard({
  value,
  selectedValue,
  onSelect,
  disabled,
}: PokerCardProps) {
  return (
    <VotingCard
      value={value}
      isSelected={selectedValue === value}
      onClick={() => onSelect(value)}
      disabled={disabled}
    />
  );
}