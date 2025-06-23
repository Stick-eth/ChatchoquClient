import React from 'react';

export function RoundSummaryOverlay({ visible, author, scores }) {
  if (!visible) return null;

  const ranking = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>L'auteur était {author}</h2>
        <h3>Classement</h3>
        <ol style={{ textAlign: 'left' }}>
          {ranking.map(([p, s]) => (
            <li key={p}>{p}: {s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

