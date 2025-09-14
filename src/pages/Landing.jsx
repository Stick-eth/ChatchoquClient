import React from 'react';
import logo from '../assets/logo/transparent_logo.png';

export function Landing() {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: 680, width: '100%', textAlign: 'center' }}>
        <img
          src={logo}
          alt="TerraGuessr"
          className="brand-logo"
          style={{ width: 128, height: 128, objectFit: 'contain', imageRendering: 'pixelated', margin: '0 auto 0.75rem' }}
        />
        <h1 style={{ marginTop: 0 }}>TerraGuessr</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Devine l'auteur des messages, affronte tes amis, et grimpe au classement.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <a href="#/start"><button>Démarrer</button></a>
          <a href="#/servers"><button>Voir les salons</button></a>
        </div>
      </div>
    </div>
  );
}
