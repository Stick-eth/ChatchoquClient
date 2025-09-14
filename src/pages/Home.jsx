import React, { useState } from 'react';
import logo from '../assets/logo/transparent_logo.png';

export function Home({ onConfirm }) {
  const [value, setValue] = useState('');
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <img src={logo} alt="TerraGuessr" style={{ width: 80, height: 80, imageRendering: 'pixelated', objectFit: 'contain', marginBottom: '0.5rem' }} />
        <h1 style={{ margin: 0, color: 'var(--color-text)' }}>Bienvenue sur TerraGuessr</h1>
        <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>Choisis un pseudo pour commencer</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          <input
            placeholder="Pseudo"
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 10,
              border: '1px solid ' + 'color-mix(in oklab, var(--color-primary), white 40%)',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--color-text)'
            }}
          />
          <button onClick={() => value && onConfirm(value)}>Continuer</button>
        </div>
      </div>
    </div>
  );
}
