import React from 'react';

export function GuessZone({ phase, guessOptions, hasGuessed, onGuess }) {
  if (phase !== 'Réflexion') return null;
  return (
    <div style={{ marginTop: '1rem' }}>
      {guessOptions.map(u => (
        <button
          key={u}
          disabled={hasGuessed}
          onClick={() => onGuess(u)}
          className="guess-button"
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
