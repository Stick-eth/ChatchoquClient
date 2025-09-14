import React from 'react';
import { Confetti } from './Confetti';
export function RoundSummaryOverlay({ visible, author, scores, proposals = {}, roundPoints = {}, myPseudo }) {
  if (!visible) return null;

  const players = Object.keys(scores);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <img
          src={`/pfp/${author}.png`}
          alt={author}
          className="round-author-img"
        />
        <h2>L'auteur était {author}</h2>
        <h3>Guesses des joueurs</h3>
        <div className="guesses-grid">
          {players.map((p) => {
            const guess = proposals[p]?.guess;
            const correct = guess === author;
            const points = roundPoints[p] ?? 0;
            return (
              <div key={p} className="guess-card">
                <div className={`guess-sticker ${correct ? 'correct' : 'wrong'}`}>
                  {correct ? '✅' : '❌'} {guess || '—'}
                </div>
                <div className="guess-meta">
                  <strong>{p}{p === myPseudo ? ' (Moi)' : ''}</strong>
                  <small>{points ? `+${points} pts` : '0 pt'}</small>
                </div>
                <Confetti active={correct && p === myPseudo} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

