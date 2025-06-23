import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

export function JoinRoom({ roomCode, setRoomCode, pseudo, setPseudo, onJoin }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.emit('getActiveRooms');
    function handleRooms({ rooms }) {
      setRooms(rooms);
    }
    socket.on('activeRooms', handleRooms);
    return () => {
      socket.off('activeRooms', handleRooms);
    };
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Rejoindre la partie</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Pseudo"
          value={pseudo}
          onChange={e => setPseudo(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Code salon (6 chiffres)"
          value={roomCode}
          onChange={e => {
            const value = e.target.value;
            if (/^\d{0,6}$/.test(value)) {
              setRoomCode(value);
            }
          }}
        />
        <button onClick={() => onJoin({ roomCode, pseudo })}>
          Rejoindre
        </button>
      </div>
      <h2>Salles disponibles</h2>
      <ul className="room-list">
        {rooms.map(r => (
          <li
            key={r.roomCode}
            className="room-item"
            onClick={() => onJoin({ roomCode: r.roomCode, pseudo })}
          >
            <div style={{ fontSize: '1.25rem' }}>Room #{r.roomCode}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{r.chef}</div>
            <hr style={{ width: '33%', margin: '0.5rem auto' }} />
            <div>{r.playerCount} joueur{r.playerCount > 1 ? 's' : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
