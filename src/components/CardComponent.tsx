import { Card, Progress } from '../lib/types';

const LearnedFlagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="learned-flag">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
);

interface CardComponentProps {
  card: Card & { showGermanFirst?: boolean };
  isFlipped: boolean;
  progress: Progress | undefined;
  onCardClick: () => void;
  onIncorrectOnBack: () => void;
  onHalf: () => void;
  showLearnedFlag: boolean;
}

export const CardComponent = ({ card, isFlipped, progress, onCardClick, onIncorrectOnBack, onHalf, showLearnedFlag }: CardComponentProps) => {
  const showGermanFirst = card.showGermanFirst !== false; // Default to true

  const FrontFace = showGermanFirst ? (
    <>
      <h2>{card.de.word}</h2>
      <p className="explanation">{card.bs.explanation_translation}</p>
      <p className="example">"{card.de.example}"</p>
    </>
  ) : (
    <>
      <h2>{card.bs.word}</h2>
      <p className="explanation">{card.de.explanation}</p>
      <p className="example">"{card.bs.example_translation}"</p>
    </>
  );

  const BackFace = showGermanFirst ? (
    <>
      <h2>{card.bs.word}</h2>
      {card.de.synonym && <p className="synonym">Sinonim: {card.de.synonym}</p>}
      <p className="explanation">{card.de.explanation}</p>
      <p className="example">"{card.bs.example_translation}"</p>
    </>
  ) : (
    <>
      <h2>{card.de.word}</h2>
      <p className="explanation">{card.bs.explanation_translation}</p>
      <p className="example">"{card.de.example}"</p>
    </>
  );


  return (
    <div className="card-scene" onClick={onCardClick}>
      <div className={`card ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="card-face card-face-front">
          <div className="card-header">
            <span>Pokušaji: {progress?.seen || 0}</span>
            <span>Kapitel {card.kapitel}</span>
          </div>
          <div className="card-content">{FrontFace}</div>
          <div className="card-footer-buttons" onClick={(e) => e.stopPropagation()}>
              <button className="btn-card-action" onClick={onIncorrectOnBack}>x</button>
              <button className="btn-card-action" onClick={onHalf}>1/2</button>
          </div>
        </div>
        <div className="card-face card-face-back">
          <div className="card-header">
            <span>Pokušaji: {progress?.seen || 0}</span>
            {showLearnedFlag && <LearnedFlagIcon />}
            <span>Kapitel {card.kapitel}</span>
          </div>
          <div className="card-content">{BackFace}</div>
          <div className="card-footer-buttons" onClick={(e) => e.stopPropagation()}>
              <button className="btn-card-action" onClick={onIncorrectOnBack}>x</button>
              <button className="btn-card-action" onClick={onHalf}>1/2</button>
          </div>
        </div>
      </div>
    </div>
  );
};