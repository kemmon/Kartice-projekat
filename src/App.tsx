import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCards } from './hooks/useCards';
import { useProgress } from './hooks/useProgress';
import { useDeck, MixMode } from './hooks/useDeck';
import { CardComponent } from './components/CardComponent';
import { ActionButtons } from './components/ActionButtons';
import { AddCardModal } from './components/AddCardModal';
import './index.css';

function App() {
  const { cards, loading: cardsLoading, addCard, importCards } = useCards();
  const { progress, updateProgress } = useProgress();
  const { deck, currentCard, initialCount, createDeck, nextCard } = useDeck(cards, progress);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [mixMenuOpen, setMixMenuOpen] = useState(false);
  const [lastGuess, setLastGuess] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (!cardsLoading && cards.length > 0) {
      createDeck('all', 'all');
    }
  }, [cardsLoading, cards.length, createDeck]);

  const totalStats = useMemo(() => {
    return Object.values(progress).reduce((acc, p) => {
        acc.correct += p.correct;
        acc.incorrect += p.incorrect;
        acc.half += p.half;
        return acc;
    }, { correct: 0, incorrect: 0, half: 0 });
  }, [progress]);

  const handleChapterChange = (chapter: number | 'all') => {
    setSelectedChapter(chapter);
    createDeck(chapter, 'all');
    setIsFlipped(false);
    setLastGuess(null);
  };

  const handleMix = (mode: MixMode) => {
    createDeck(selectedChapter, mode);
    setIsFlipped(false);
    setMixMenuOpen(false);
    setLastGuess(null);
  };
  
  const handleGuess = (guess: 'correct' | 'incorrect') => {
    if(isFlipped) return;
    setLastGuess(guess);
  };

  const moveToNextCard = useCallback((action: 'correct' | 'incorrect' | 'half') => {
      setIsFlipped(false);
      setLastGuess(null);
      setTimeout(() => {
        nextCard(action);
      }, 300); 
  }, [nextCard]);

  const handleConfirmation = (action: 'confirm' | 'cancel' | 'half') => {
      if(!currentCard) return;

      if (action === 'confirm') {
          if (lastGuess) {
              updateProgress(currentCard.id, lastGuess);
              moveToNextCard(lastGuess);
          }
          return;
      }
      
      if (action === 'cancel') {
          const result = lastGuess === 'correct' ? 'incorrect' : 'correct';
          updateProgress(currentCard.id, result);
          moveToNextCard(result);
      } else if (action === 'half') {
          updateProgress(currentCard.id, 'half');
          moveToNextCard('half');
      }
  };

  const handleCardClick = () => {
    if (!isFlipped && lastGuess) {
      setIsFlipped(true);
    } else if (isFlipped && lastGuess) {
      handleConfirmation('confirm');
    }
  };

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(cards, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "kartice.json";
    link.click();
    setIsAddModalOpen(false);
  };

  const progressPercentage = initialCount > 0 ? (((initialCount - deck.length) / initialCount) * 100) : 0;
  
  if (cardsLoading) {
    return <div className="loading-screen"><h1>Učitavanje kartica...</h1></div>;
  }

  return (
    <div className="app-container">
      {isAddModalOpen && <AddCardModal onClose={() => setIsAddModalOpen(false)} onAddCard={addCard} onImportCards={importCards} onExportCards={handleExport}/>}

      <header className="app-header">
        <h1 className="app-title">Kartice</h1>
        <div className="stats-counters">
            <span>Tačnih: {totalStats.correct}</span>
            <span>Netačnih: {totalStats.incorrect}</span>
            <span>1/2: {totalStats.half}</span>
        </div>
        <div className="progress-bar-container">
            <div className="progress-bar-value" style={{width: `${progressPercentage}%`}}></div>
            <span className="progress-bar-text">{Math.round(progressPercentage)}%</span>
        </div>
      </header>
      
      <div className="controls-panel">
        <select className="chapter-select" value={selectedChapter} onChange={(e) => handleChapterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Komplet</option>
            {[...Array(14)].map((_, i) => (
                <option key={i+1} value={i+1}>Kapitel {i+1}</option>
            ))}
        </select>
        <div className="progress-text">
            Napredak: {initialCount - deck.length}/{initialCount} <br/>
            Preostalo: {deck.length}
        </div>
        <div className="mix-menu-container">
            <button className="btn-control-small" onClick={() => setMixMenuOpen(!mixMenuOpen)}>Mix</button>
            {mixMenuOpen && (
                <div className="mix-menu">
                    <button onClick={() => handleMix('remaining')}>Miješaj preostale</button>
                    <button onClick={() => handleMix('all')}>Miješaj sve</button>
                    <button onClick={() => handleMix('random_side')}>Miješaj sa obrnutim stranama</button>
                </div>
            )}
        </div>
        <button className="btn-control-small" onClick={() => setIsAddModalOpen(true)}>Plus</button>
      </div>

      <main>
        {currentCard ? (
            <CardComponent 
              card={currentCard} 
              isFlipped={isFlipped}
              progress={progress[currentCard.id]}
              onCardClick={handleCardClick}
              onIncorrectOnBack={() => handleConfirmation('cancel')}
              onHalf={() => handleConfirmation('half')}
              showLearnedFlag={isFlipped && lastGuess === 'correct'}
            />
        ) : (
            <div className="card-scene-placeholder">
                <p>Špil je završen!</p>
            </div>
        )}
      </main>

      <footer>
        {currentCard && (
            <ActionButtons
              onCorrect={() => handleGuess('correct')}
              onIncorrect={() => handleGuess('incorrect')}
              onFlip={() => setIsFlipped(!isFlipped)}
              isFlipped={isFlipped}
            />
        )}
      </footer>
    </div>
  );
}

export default App;