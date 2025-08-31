import { useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import { Card } from '../lib/types';
import { LOCAL_STORAGE_KEYS } from '../lib/constants';

export const useCards = () => {
  const [cards, setCards] = useLocalStorage<Card[]>(LOCAL_STORAGE_KEYS.CARDS, []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeCards = async () => {
      // Provjeravamo localStorage samo jednom
      if (cards.length === 0) {
        try {
          const response = await fetch('/seed.json');
          if (!response.ok) {
            throw new Error(`HTTP greška! status: ${response.status}`);
          }
          const seedCards = await response.json();
          debugger;
          setCards(seedCards);
        } catch (error) {
          console.error("Neuspješno učitavanje ili parsiranje seed.json", error);
        }
      }
      setLoading(false);
    };
    initializeCards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ovaj hook se treba izvršiti samo jednom na početku

  const addCard = useCallback((cardData: Omit<Card, 'id'>) => {
    const newCard: Card = { ...cardData, id: uuidv4() };
    setCards(prev => [...prev, newCard]);
  }, [setCards]);

  const importCards = useCallback((newCards: Card[]) => {
    setCards(prevCards => {
        const existingIds = new Set(prevCards.map(c => c.id));
        const uniqueNewCards = newCards.filter(card => 
            card.id && !existingIds.has(card.id)
        );
        return [...prevCards, ...uniqueNewCards];
    });
  }, [setCards]);

  // Hook vraća samo podatke i funkcije, bez JSX-a
  return { cards, loading, addCard, importCards };
};