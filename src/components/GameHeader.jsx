import React from 'react';

export function GameHeader({ roundNumber, phase, isChef, gameStarted, onStart }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div>Manche: {roundNumber}</div>
      <div>Phase: {phase}</div>
      {isChef && !gameStarted && (
        <button onClick={onStart}>Démarrer</button>
      )}
    </div>
  );
}
