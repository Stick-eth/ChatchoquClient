import React from 'react';

export function GuessZone({ phase, guessOptions, hasGuessed, selectedGuess, onGuess }) {
  if (phase !== 'Réflexion') return null;
  return (
    <div style={{ marginTop: '1rem' }}>
      {guessOptions.map(u => (
        <button
          key={u}
          disabled={hasGuessed}
          onClick={() => onGuess(u)}
          className={`guess-button${
            hasGuessed && selectedGuess === u ? ' guess-selected' : ''
          }`}
        >
          <img
            src={`src/assets/pfp/${u}.png`}
            alt={u}
            className="guess-img"
          />
          {u}
        </button>
      ))}
    </div>
  );
}
