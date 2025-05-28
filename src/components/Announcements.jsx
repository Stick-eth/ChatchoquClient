import React from 'react';

export function Announcements({ announcements }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <h3>Annonces</h3>
      <ul>
        {announcements.map((a, i) => <li key={i}>{a}</li>)}
      </ul>
    </div>
  );
}
