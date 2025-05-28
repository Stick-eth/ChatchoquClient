import React from 'react';

export function Scores({ scores }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h3>Scores</h3>
      <ul>
        {Object.entries(scores).map(([p, s]) => <li key={p}>{p}: {s}</li>)}
      </ul>
    </div>
  );
}
