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
    const interval = setInterval(() => {
      socket.emit('getActiveRooms');
    }, 5000);
    return () => {
      socket.off('activeRooms', handleRooms);
      clearInterval(interval);
    };
  }, []);

  const createRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    onJoin(code);
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      <button
        className="btn-identity"
        style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        onClick={() => {
          setTmpPseudo(pseudo);
          setShowModal(true);
        }}
      >
        {pseudo}
      </button>

      <h1>Lobby TerraGuessr</h1>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>Rejoindre ou créer un salon</h2>
        <div className="row-wrap" style={{ gap: '0.5rem', marginTop: '1rem' }}>
          <input
            placeholder="Code salon (6 chiffres)"
            value={roomCode}
            onChange={e => {
              const v = e.target.value;
              if (/^\d{0,6}$/.test(v)) setRoomCode(v);
            }}
          />
          <button onClick={() => roomCode && onJoin(roomCode)}>Rejoindre</button>
          <button onClick={createRoom}>Créer une salle</button>
        </div>
      </div>

      <h2>Salles disponibles</h2>
      {rooms.length === 0 ? (
        <p>Aucune salle ouverte pour le moment.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rooms.map(r => (
            <li key={r.roomCode} style={{ marginBottom: '0.5rem' }}>
              <button className="card" style={{ width: '100%', textAlign: 'center' }} onClick={() => onJoin(r.roomCode)}>
                <div style={{ fontSize: '1.25rem' }}>#{r.roomCode}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.chef}</div>
                <hr style={{ width: '33%', margin: '0.5rem auto', borderColor: 'var(--border-color)' }} />
                <div>{r.playerCount} joueur{r.playerCount > 1 ? 's' : ''}</div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Modifier le pseudo</h2>
            <input
              value={tmpPseudo}
              maxLength={16}
              onChange={e => setTmpPseudo(e.target.value.slice(0, 16))}
            />
            <div>
              <button
                onClick={() => {
                  const v = (tmpPseudo || '').trim().slice(0, 16);
                  if (v) onPseudoChange(v);
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
