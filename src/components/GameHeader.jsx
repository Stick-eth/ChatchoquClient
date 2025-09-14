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
  roomParams,
  setRoomParams,
  onUploadCsv,
  datasetReady,
}) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {gameStarted && <div>Manche: {roundNumber}</div>}
      <div>
        Phase: {phase}
        {timeLeft > 0 && (
          <span style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>
            {formatTime(timeLeft)}
          </span>
        )}
      </div>
      {isChef && !gameStarted && (
        <div style={{ flexBasis: '100%', width: '100%' }}>
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', padding: '0.75rem', position: 'relative' }}>
          <span className="container-emoji-badge">⚙️</span>
          <h3 style={{ marginTop: 0 }}>Paramètres</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="csvFileInput"
              type="file"
              accept=".csv,text/csv"
              onChange={onUploadCsv}
            />
            <span style={{ fontSize: '0.9rem' }}>
              {datasetReady ? (
                <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Import OK</span>
              ) : (
                'Importer dump.csv avant de démarrer'
              )}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>Rounds: {roomParams.rounds}</div>
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
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>Messages/round: {roomParams.messagesPerRound}</div>
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
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>Pav-o-meter: {roomParams.minMessageLength}</div>
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
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
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
              <span style={{
                marginLeft: '0.35rem',
                padding: '0.1rem 0.35rem',
                background: 'rgba(86, 99, 247, 0.14)',
                color: 'var(--color-primary)',
                border: '2px solid rgba(86, 99, 247, 0.25)',
                fontSize: '0.75rem'
              }}>Bêta</span>
            </label>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Configurez les paramètres puis utilisez le bouton en bas pour démarrer
            </div>
          </div>

          </div>
        </div>
      )}
    </div>
  );
}
