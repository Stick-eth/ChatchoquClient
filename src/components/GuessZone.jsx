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
        >
          {u}
        </button>
      ))}
    </div>
  );
}
