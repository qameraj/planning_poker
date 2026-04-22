import { FibonacciValue, TShirtValue, VotingSystem } from './types';

export const FIBONACCI_DECK: FibonacciValue[] = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

export const TSHIRT_DECK: TShirtValue[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'];

export const getDeckValues = (votingSystem: VotingSystem, customDeck?: string[]): string[] => {
  switch (votingSystem) {
    case 'fibonacci':
      return FIBONACCI_DECK;
    case 'tshirt':
      return TSHIRT_DECK;
    case 'custom':
      return customDeck || [];
    default:
      return FIBONACCI_DECK;
  }
};

export const getCardColor = (value: string): string => {
  // Special cards
  if (value === '?') return 'bg-gray-500';
  if (value === '☕') return 'bg-amber-600';
  
  // Fibonacci values
  const numValue = parseInt(value);
  if (!isNaN(numValue)) {
    if (numValue <= 2) return 'bg-green-500';
    if (numValue <= 5) return 'bg-blue-500';
    if (numValue <= 13) return 'bg-yellow-500';
    return 'bg-red-500';
  }
  
  // T-shirt sizes
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sizeIndex = sizeOrder.indexOf(value);
  if (sizeIndex >= 0) {
    if (sizeIndex <= 1) return 'bg-green-500';
    if (sizeIndex <= 3) return 'bg-blue-500';
    return 'bg-yellow-500';
  }
  
  return 'bg-light-accent dark:bg-dark-accent';
};