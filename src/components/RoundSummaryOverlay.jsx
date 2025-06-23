import React from 'react';
import { Confetti } from './Confetti';
export function RoundSummaryOverlay({ visible, author, scores, proposals = {} }) {
  if (!visible) return null;

  const ranking = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>L'auteur était {author}</h2>
        <h3>Classement</h3>
        <ol style={{ textAlign: 'left' }}>
          {ranking.map(([p, s]) => {
            const guess = proposals[p]?.guess;
            const correct = guess === author;
            return (
              <li
                key={p}
                style={{ position: 'relative', padding: '0.5rem 0' }}
              >
                <span>
                  {p}: {s}
                </span>
                <Confetti active={correct} />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

