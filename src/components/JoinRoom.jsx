import React from 'react';

export function JoinRoom({ roomCode, setRoomCode, pseudo, setPseudo, onJoin }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Rejoindre la partie</h1>
      <input
        placeholder="Code salon"
        value={roomCode}
        onChange={e => setRoomCode(e.target.value)}
      />
      <input
        placeholder="Pseudo"
        value={pseudo}
        onChange={e => setPseudo(e.target.value)}
      />
      <button onClick={() => onJoin({ roomCode, pseudo })}>
        Rejoindre
      </button>
    </div>
  );
}
