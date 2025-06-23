import React from 'react';

export function GameEndOverlay({ visible, ranking, isChef, onRestart, onQuit }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Partie terminée</h2>
        <h3>Classement final</h3>
        <ol style={{ textAlign: 'left' }}>
          {ranking.map(r => (
            <li key={r.pseudo}>{r.pseudo}: {r.score}</li>
          ))}
        </ol>
        <div style={{ marginTop: '1rem' }}>
          {isChef && <button onClick={onRestart}>Relancer</button>}
          <button onClick={onQuit}>Quitter</button>
        </div>
      </div>
    </div>
  );
}
