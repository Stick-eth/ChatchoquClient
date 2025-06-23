import React, { useState } from 'react';

export function Home({ onConfirm }) {
  const [value, setValue] = useState('');
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h1>Bienvenue</h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input
            placeholder="Pseudo"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <button onClick={() => value && onConfirm(value)}>Continuer</button>
        </div>
      </div>
    </div>
  );
}
