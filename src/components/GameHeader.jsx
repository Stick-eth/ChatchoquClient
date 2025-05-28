import React from 'react';

// helper pour formater 65 → "01:05"
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

export function GameHeader({
  roundNumber,
  phase,
  timeLeft,
  isChef,
  gameStarted,
  onStart
}) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div>Manche: {roundNumber}</div>
      <div>
        Phase: {phase}
        {timeLeft > 0 && (
          <span style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>
            {formatTime(timeLeft)}
          </span>
        )}
      </div>
      {isChef && !gameStarted && (
        <button onClick={onStart}>Démarrer</button>
      )}
    </div>
  );
}
