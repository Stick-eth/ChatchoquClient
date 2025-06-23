import React, { useState } from 'react';

export function Home({ onConfirm }) {
  const [value, setValue] = useState('');
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenue</h1>
      <input
        placeholder="Pseudo"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button
        style={{ marginLeft: '0.5rem' }}
        onClick={() => value && onConfirm(value)}
      >
        Continuer
      </button>
    </div>
  );
}
