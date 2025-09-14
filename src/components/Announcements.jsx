import React from 'react';

export function Announcements({ announcements }) {
  return (
    <div className="card" style={{ marginBottom: '1rem', position: 'relative' }}>
      <span className="container-emoji-badge">📢</span>
      <h3>Annonces</h3>
      <ul>
        {announcements.map((a, i) => <li key={i}>{a}</li>)}
      </ul>
    </div>
  );
}
