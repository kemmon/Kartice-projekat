interface ActionButtonsProps {
  onIncorrect: () => void;
  onCorrect: () => void;
  onFlip: () => void;
  isFlipped: boolean;
}

export const ActionButtons = ({ onIncorrect, onCorrect, onFlip, isFlipped }: ActionButtonsProps) => {
  return (
    <div className="action-buttons-container">
      <button className="btn btn-incorrect" onClick={onIncorrect} disabled={isFlipped}>
        Ne znam
      </button>
      <button className="btn btn-flip" onClick={onFlip}>
        Okreni
      </button>
      <button className="btn btn-correct" onClick={onCorrect} disabled={isFlipped}>
        Znam
      </button>
    </div>
  );
};