import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ProgressMap } from '../lib/types';
import { LOCAL_STORAGE_KEYS } from '../lib/constants';

export const useProgress = () => {
  const [progress, setProgress] = useLocalStorage<ProgressMap>(LOCAL_STORAGE_KEYS.PROGRESS, {});

  const updateProgress = useCallback((cardId: string, result: 'correct' | 'incorrect' | 'half') => {
    setProgress(prev => {
      const current = prev[cardId] || { seen: 0, correct: 0, incorrect: 0, half: 0, learned: false, lastSeen: 0 };
      const updated = {
        ...current,
        seen: current.seen + 1,
        [result]: current[result] + 1,
        lastSeen: Date.now(),
        learned: result === 'correct' ? true : current.learned,
      };
      return { ...prev, [cardId]: updated };
    });
  }, [setProgress]);

  return { progress, updateProgress };
};