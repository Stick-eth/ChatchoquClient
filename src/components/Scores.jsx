import React from 'react';

export function Scores({ scores, chefName, guessedPlayers = [] }) {
  return (
    <div className="card" style={{ position: 'relative' }}>
      <span className="container-emoji-badge">🏆</span>
      <h3>Scores</h3>
      <ul>
        {Object.entries(scores).map(([p, s]) => (
          <li key={p}>
            {p === chefName ? '👑' : ''}
            {guessedPlayers.includes(p) ? '⚪ ' : ''}
            {p}: {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
