import React, { useState } from 'react';

const fallbackPfp = '/pfp/default.svg';

export function GuessZone({ phase, guessOptions, hasGuessed, selectedGuess, onGuess }) {
  const [open, setOpen] = useState(false);
  if (phase !== 'Réflexion') return null;

  const list = (
    <div>
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
            src={`/pfp/${u}.png`}
            alt={u}
            className="guess-img"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackPfp; }}
          />
          {u}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Desktop/tablette: liste inline */}
      <div className="guess-list-desktop">
        {list}
      </div>

      {/* Mobile: bouton fixe + bottom sheet */}
      <button
        type="button"
        className="guess-toggle-btn"
        onClick={() => setOpen(o => !o)}
        disabled={hasGuessed}
        aria-expanded={open}
        aria-controls="guess-bottom-sheet"
      >
        {open ? '⬇️ Masquer les guesses' : '⬆️ Guesses'}
      </button>
      {open && (
        <div id="guess-bottom-sheet" className="guess-bottom-sheet">
          {list}
        </div>
      )}
    </div>
  );
}
