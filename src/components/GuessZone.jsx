import React from 'react';

const fallbackPfp = 'src/assets/react.svg';

export function GuessZone({ phase, guessOptions, hasGuessed, selectedGuess, onGuess }) {
  if (phase !== 'Réflexion') return null;
  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Choisissez l'auteur (liste dynamique selon les messages importés)
      </div>
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
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackPfp; }}
          />
          {u}
        </button>
      ))}
    </div>
  );
}
