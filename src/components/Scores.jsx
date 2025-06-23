import React from 'react';

export function Scores({ scores, chefName }) {
  return (
    <div className="card">
      <h3>Scores</h3>
      <ul>
        {Object.entries(scores).map(([p, s]) => (
          <li key={p}>
            {p === chefName ? '👑' : ''}{p}: {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
