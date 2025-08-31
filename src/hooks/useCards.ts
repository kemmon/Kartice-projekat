// src/hooks/useCards.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import { Card } from '../lib/types';
import { LOCAL_STORAGE_KEYS } from '../lib/constants';

const META_KEY  = 'cards_meta';
const META_URL  = '/seed-meta.json';
const SEED_URL  = '/seed.json';

export const useCards = () => {
  // Tvoj ključ je 'debs.cards.v1' — uzmi ga iz constants ili fallback-uj na taj string
  const STORAGE_CARDS_KEY =
    (LOCAL_STORAGE_KEYS as any)?.CARDS ?? 'debs.cards.v1';

  const [cards, setCards] = useLocalStorage<Card[]>(STORAGE_CARDS_KEY, []);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let cancelled = false;

    // 1) Brzi put: prikaži odmah šta već ima u localStorage-u
    try {
      const localNow: Card[] = JSON.parse(localStorage.getItem(STORAGE_CARDS_KEY) || '[]');
      if (localNow.length > 0) {
        setCards(localNow);
        setLoading(false); // UI se odmah otvara
      }
    } catch {
      // ignoriši
    }

    // 2) U pozadini provjeri meta i po potrebi osvježi seed.json
    (async () => {
      try {
        const metaRes = await fetch(META_URL, { cache: 'no-store' });
        if (!metaRes.ok) {
          // nema meta fajla? ništa strašno – probajmo samo seed.json ako lokalno ništa nema
          const localLen = JSON.parse(localStorage.getItem(STORAGE_CARDS_KEY) || '[]').length;
          if (localLen === 0) {
            const res = await fetch(SEED_URL, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(data));
                if (!cancelled) setCards(data);
              }
            }
          }
          return;
        }

        const remoteMeta = (await metaRes.json()) as { version: number; count?: number; updatedAt?: string };
        const storedMeta = JSON.parse(localStorage.getItem(META_KEY) || 'null') as { version: number } | null;
        const localCards: Card[] = JSON.parse(localStorage.getItem(STORAGE_CARDS_KEY) || '[]');

        const needsRefresh =
          !storedMeta ||
          storedMeta.version !== remoteMeta.version ||
          localCards.length === 0;

        if (needsRefresh) {
          const res = await fetch(`${SEED_URL}?v=${remoteMeta.version}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(data));
              localStorage.setItem(META_KEY, JSON.stringify(remoteMeta));
              if (!cancelled) setCards(data);
            }
          }
        }
      } catch (e) {
        console.error('[useCards] greška pri osvježavanju podataka:', e);
      } finally {
        if (!cancelled) setLoading(false); // garantovano spusti loader
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helperi koje koristiš u App.tsx
  const addCard = useCallback((cardData: Omit<Card, 'id'>) => {
    const newCard: Card = { ...cardData, id: uuidv4() };
    setCards(prev => [...prev, newCard]);
  }, [setCards]);

  const importCards = useCallback((newCards: Card[]) => {
    setCards(prev => [...prev, ...newCards]);
  }, [setCards]);

  return { cards, loading, addCard, importCards };
};