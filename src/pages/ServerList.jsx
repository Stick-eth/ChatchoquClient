import React, { useState } from 'react';
// Removed rooms listing API usage
// import { socket } from '../socket';
import logo from '../assets/logo/transparent_logo.png';
import { FiUser } from 'react-icons/fi';

export function ServerList({ pseudo, onJoin, onPseudoChange }) {
  // const [rooms, setRooms] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tmpPseudo, setTmpPseudo] = useState(pseudo);

  // Remove public rooms listing: no polling, no API calls
  // useEffect(() => { /* removed */ }, []);

  const createRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    onJoin(code);
  };

  const cmd = 'tgr start @joueur1 @joueur2 #channel1 #channel3';

  return (
    <div className="container" style={{ position: 'relative', padding: '0 6rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header with brand on the left and identity button aligned on the right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src={logo} alt="TerraGuessr" style={{ width: 64, height: 64, imageRendering: 'pixelated' }} />
          <h1 style={{ margin: 0 }}>TerraGuessr</h1>
        </div>
        <button
          className="btn-identity"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          onClick={() => {
            setTmpPseudo(pseudo);
            setShowModal(true);
          }}
        >
          <FiUser aria-hidden="true" />
          {pseudo}
        </button>
      </div>

      <div className="card" style={{ margin: '1rem 0' }}>
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

      <div className="card" style={{ margin: '1rem 0' }}>
        <h2>Lancer une partie avec le bot Discord</h2>
        <ol style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
          <li>Invitez le bot sur votre serveur Discord.</li>
          <li>Dans le bon salon, exécutez la commande ci‑dessous.</li>
        </ol>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1416593032240955484"
            target="_blank"
            rel="noreferrer"
          >
            <button type="button">Inviter le bot Discord</button>
          </a>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
          <input
            value={cmd}
            readOnly
            title="Copiez puis collez cette commande dans Discord"
            style={{ flex: 1, cursor: 'text' }}
          />
        </div>
        {/* Example paragraph removed as requested */}
      </div>

      {/* Rooms listing removed from the UI */}

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
