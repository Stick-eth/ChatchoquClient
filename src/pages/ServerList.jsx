import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

export function ServerList({ pseudo, onJoin, onPseudoChange }) {
  const [rooms, setRooms] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tmpPseudo, setTmpPseudo] = useState(pseudo);

  useEffect(() => {
    socket.emit('getActiveRooms');
    function handleRooms({ rooms }) {
      setRooms(rooms);
    }
    socket.on('activeRooms', handleRooms);
    return () => socket.off('activeRooms', handleRooms);
  }, []);

  const createRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    onJoin(code);
  };

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      <button
        style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        onClick={() => {
          setTmpPseudo(pseudo);
          setShowModal(true);
        }}
      >
        {pseudo}
      </button>

      <h1>Choix du salon</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Code salon (6 chiffres)"
          value={roomCode}
          onChange={e => {
            const v = e.target.value;
            if (/^\d{0,6}$/.test(v)) setRoomCode(v);
          }}
        />
        <button onClick={() => roomCode && onJoin(roomCode)}>Rejoindre</button>
        <button style={{ marginLeft: '0.5rem' }} onClick={createRoom}>
          Créer une salle
        </button>
      </div>

      <h2>Salles disponibles</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rooms.map(r => (
          <li key={r.roomCode} style={{ marginBottom: '0.5rem' }}>
            <button
              style={{
                width: '100%',
                padding: '0.75rem',
                textAlign: 'center',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#f8f8f8',
              }}
              onClick={() => onJoin(r.roomCode)}
            >
              <div style={{ fontSize: '1.25rem' }}>#{r.roomCode}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>{r.chef}</div>
              <hr style={{ width: '33%', margin: '0.5rem auto' }} />
              <div>{r.playerCount} joueur{r.playerCount > 1 ? 's' : ''}</div>
            </button>
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Modifier le pseudo</h2>
            <input value={tmpPseudo} onChange={e => setTmpPseudo(e.target.value)} />
            <div>
              <button
                onClick={() => {
                  onPseudoChange(tmpPseudo);
                  setShowModal(false);
                }}
              >
                Confirmer
              </button>
              <button onClick={() => setShowModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
