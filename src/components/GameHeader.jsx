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
  onStart,
  roomParams,
  setRoomParams,
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
        <>
          <label>
            Rounds: {roomParams.rounds}
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={roomParams.rounds}
              onChange={e =>
                setRoomParams({
                  ...roomParams,
                  rounds: parseInt(e.target.value, 10),
                })
              }
            />
          </label>
          <label>
            Messages/round: {roomParams.messagesPerRound}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={roomParams.messagesPerRound}
              onChange={e =>
                setRoomParams({
                  ...roomParams,
                  messagesPerRound: parseInt(e.target.value, 10),
                })
              }
            />
          </label>
          <label>
            Pav-o-meter: {roomParams.minMessageLength}
            <input
              type="range"
              min="3"
              max="1024"
              step="1"
              value={roomParams.minMessageLength}
              onChange={e =>
                setRoomParams({
                  ...roomParams,
                  minMessageLength: parseInt(e.target.value, 10),
                })
              }
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
              type="checkbox"
              checked={roomParams.onlyGifs}
              onChange={e =>
                setRoomParams({
                  ...roomParams,
                  onlyGifs: e.target.checked,
                })
              }
            />
            Uniquement Gifs
          </label>
          <button onClick={onStart}>Démarrer</button>
        </>
      )}
    </div>
  );
}
