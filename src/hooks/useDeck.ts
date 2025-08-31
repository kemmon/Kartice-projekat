import { useState, useCallback, useMemo } from 'react';
import { Card, ProgressMap } from '../lib/types';

export type MixMode = 'remaining' | 'random_side' | 'all';

const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface DeckCard extends Card {
    showGermanFirst: boolean;
}

export const useDeck = (allCards: Card[], progress: ProgressMap) => {
    const [deck, setDeck] = useState<DeckCard[]>([]);
    const [initialCount, setInitialCount] = useState(0);

    const createDeck = useCallback((chapter: number | 'all', mixMode: MixMode = 'all') => {
        let filteredCards = chapter === 'all'
            ? allCards
            : allCards.filter(c => c.kapitel === chapter);

        if (mixMode === 'remaining') {
            filteredCards = filteredCards.filter(c => !progress[c.id]?.learned);
        }
        
        const deckCards: DeckCard[] = filteredCards.map(card => ({
            ...card,
            showGermanFirst: mixMode === 'random_side' ? Math.random() > 0.5 : true
        }));

        const shuffled = shuffle(deckCards);
        setDeck(shuffled);
        setInitialCount(shuffled.length);
    }, [allCards, progress]);

    const currentCard = useMemo(() => (deck.length > 0 ? deck[0] : null), [deck]);

    const nextCard = (action: 'correct' | 'incorrect' | 'half') => {
        if (!currentCard) return;
        
        const remainingDeck = deck.slice(1);
        
        if (action === 'correct') {
            setDeck(remainingDeck);
        } else if (action === 'incorrect') {
            setDeck(shuffle([...remainingDeck, currentCard]));
        } else { // half
            const reinsertIndex = Math.min(remainingDeck.length, Math.floor(Math.random() * 3) + 3);
            const newDeck = [...remainingDeck];
            newDeck.splice(reinsertIndex, 0, currentCard);
            setDeck(newDeck);
        }
    };
    
    const sessionProgress = useMemo(() => initialCount > 0 ? initialCount - deck.length : 0, [initialCount, deck.length]);

    return {
        deck,
        currentCard,
        initialCount,
        createDeck,
        nextCard,
        sessionProgress,
    };
};