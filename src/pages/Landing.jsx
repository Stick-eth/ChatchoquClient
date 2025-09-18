import React, { useState } from 'react';
import logo from '../assets/logo/transparent_logo.png';

export function Landing({ onSetPseudo, onNavigate }) {
  const [pseudo, setPseudo] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = (pseudo || '').trim().length > 0 && (pseudo || '').trim().length <= 16;
  const trimmed = (pseudo || '').trim().slice(0, 16);

  const createRoom = () => {
    if (!isValid) { setTouched(true); return; }
    onSetPseudo && onSetPseudo(trimmed);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (onNavigate) onNavigate('#/room/' + code);
    else window.location.hash = '#/room/' + code;
  };

  const goServers = () => {
    if (!isValid) { setTouched(true); return; }
    onSetPseudo && onSetPseudo(trimmed);
    if (onNavigate) onNavigate('#/servers');
    else window.location.hash = '#/servers';
  };

  const error = touched && !isValid ? 'Le pseudo est obligatoire (max 16 caractères).' : '';

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

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0 auto 1rem', maxWidth: 420 }}>
          <input
            placeholder="Entrez un pseudo"
            value={pseudo}
            maxLength={16}
            onChange={e => setPseudo(e.target.value.slice(0, 16))}
            onBlur={() => setTouched(true)}
            onKeyDown={e => { if (e.key === 'Enter') goServers(); }}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.06)', color: 'var(--color-text)' }}
          />
        </div>
        {error && (
          <div style={{ color: 'var(--color-danger, #ff6b6b)', fontSize: 14, marginTop: -8, marginBottom: 8 }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={createRoom} disabled={!isValid} title={!isValid ? 'Entrez un pseudo pour continuer' : undefined}>
            Créer une salle
          </button>
          <button onClick={goServers} disabled={!isValid} title={!isValid ? 'Entrez un pseudo pour continuer' : undefined}>
            Voir les salons
          </button>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1416593032240955484"
            target="_blank"
            rel="noreferrer"
          >
            <button type="button">Inviter le bot Discord</button>
          </a>
        </div>
      </div>
    </div>
  );
}
