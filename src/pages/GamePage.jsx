import React, { useEffect, useState, useRef } from 'react';
import logo from '../assets/logo/transparent_logo.png';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameHeader } from '../components/GameHeader';
import { ChatPanel } from '../components/ChatPanel';
import { ChatBox } from '../components/ChatBox';
import { Announcements } from '../components/Announcements';
import { Scores } from '../components/Scores';
import { GuessZone } from '../components/GuessZone';
import { RoundSummaryOverlay } from '../components/RoundSummaryOverlay';
import { GameEndOverlay } from '../components/GameEndOverlay';

export default function GamePage({ roomCode, roomSecret, pseudo, onLeave }) {
  const [roomParams, setRoomParams] = useState({
    rounds: 10,
    onlyGifs: false,
    messagesPerRound: 1,
    minMessageLength: 20,
  });
  const hasJoinedRef = useRef(false);

  const {
    connected,
    gameStarted,
    isChef,
    chefName,
    roundNumber,
    phase,
    timeLeft,
    guessOptions,
    hasGuessed,
    myGuess,
    scores,
    playersGuessed,
    messages,
    announcements,
    lastAuthor,
    lastProposals,
    lastRoundPoints,
    gameSettings,
    currentRoom,
    joinRoom,
    startGame,
    submitGuess,
    restartLobby,
    leaveRoom,
    finalRanking,
    chatMessages,
    sendChatMessage,
    datasetReady,
    datasetInfo,
    uploadCsv,
    uploading,
    uploadProgress,
  } = useGameLogic(pseudo);

  // join room automatically once
  useEffect(() => {
    if (!hasJoinedRef.current && roomCode && pseudo) {
      joinRoom({ roomCode, pseudo, secret: roomSecret });
      hasJoinedRef.current = true;
    }
  }, [roomCode, roomSecret, pseudo, joinRoom]);

  const handleLeave = () => {
    leaveRoom();
    hasJoinedRef.current = false;
  };

  // État du chat overlay (mobile) + badge "nouveau message"
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(false);
  const lastSeenChatLenRef = useRef(0);
  useEffect(() => {
    const len = chatMessages?.length || 0;
    // Si overlay fermé et nouveaux messages → activer le badge (1)
    if (!chatOpen && len > lastSeenChatLenRef.current) {
      setChatUnread(true);
    }
    // Mémoriser la longueur courante
    lastSeenChatLenRef.current = len;
  }, [chatMessages, chatOpen]);
  const openChat = () => { setChatOpen(true); setChatUnread(false); };
  const closeChat = () => setChatOpen(false);

  const overlayVisible = phase === 'Résultat' || phase === 'Transition';

  // Ajouter/retirer une classe globale pour surélever l'input du chat au-dessus des overlays
  useEffect(() => {
    const root = document.documentElement;
    if (overlayVisible) root.classList.add('overlay-open');
    else root.classList.remove('overlay-open');
    return () => root.classList.remove('overlay-open');
  }, [overlayVisible]);

  // Saisie par défaut: rediriger les frappes clavier vers l'input du chat si l'utilisateur tape hors champ
  useEffect(() => {
    const onKeyDown = (e) => {
      const t = e.target;
      const isFormField = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if (isFormField) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!e.key) return;
      // N'intercepter que les caractères imprimables (y compris espace)
      const isPrintable = e.key.length === 1;
      if (!isPrintable) return;
      // Trouver un input de chat visible
      const candidate = document.querySelector('.chat-input input, .chat-input-floating input');
      if (!candidate) return;
      // Vérifier visibilité
      const style = window.getComputedStyle(candidate);
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && candidate.offsetParent !== null;
      if (!visible) return;
      // Empêcher la frappe d'aller ailleurs, puis demander au ChatBox d'insérer le texte
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('chatbox-insert-text', { detail: { text: e.key } }));
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  // Loading screen while connecting
  if (!connected) {
    return <div className="container">Connexion…</div>;
  }

  if (!gameStarted) {
    return (
      <div className="container game-page" style={{ position: 'relative', paddingBottom: isChef ? '84px' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src={logo} alt="TerraGuessr" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
          <h1 style={{ margin: 0 }}>{`Room #${currentRoom}`}</h1>
        </div>

        <button
          className="btn-quit"
          onClick={() => {
            if (window.confirm('Quitter la partie ?')) {
              handleLeave();
              if (onLeave) onLeave();
              window.location.reload();
            }
          }}
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
        >
          Quitter
        </button>

        <GameHeader
          roundNumber={roundNumber}
          phase={phase}
          timeLeft={timeLeft}
          isChef={isChef}
          gameStarted={gameStarted}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          onUploadCsv={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            uploadCsv(text);
          }}
          datasetReady={datasetReady}
          datasetInfo={datasetInfo}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />

        <div className="row-wrap lobby-layout" style={{ gap: '1rem', marginTop: '1rem' }}>
          <ChatBox messages={chatMessages} onSend={sendChatMessage} floatingInput />
          <div className="sidebar">
            {/* En lobby: afficher Annonces au lieu de Scores */}
            <Announcements announcements={announcements} />
          </div>
        </div>

        {isChef && (
          <div className="cta-start-bar">
            <div className="cta-content">
              <div>
                {!datasetReady ? (
                  <span className="cta-hint">Importez un CSV pour pouvoir démarrer</span>
                ) : (
                  <span className="cta-ok">✓ Dataset prêt</span>
                )}
              </div>
              <button
                className="cta-start-button"
                onClick={() => datasetReady ? startGame(roomParams) : alert('Veuillez importer un CSV avant de démarrer.')}
                disabled={!datasetReady}
              >
                🚀 Démarrer la partie
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container game-page" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <img src={logo} alt="TerraGuessr" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
        <h1 style={{ margin: 0 }}>{gameStarted ? 'TerraGuessr' : `Room #${currentRoom}`}</h1>
      </div>
      {roomSecret && (
        <div style={{ position: 'absolute', top: '3.5rem', right: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Accès via lien protégé
        </div>
      )}

      <button
        className="btn-quit"
        onClick={() => {
          if (window.confirm('Quitter la partie ?')) {
            handleLeave();
            if (onLeave) onLeave();
            window.location.reload();
          }
        }}
        style={{ position: 'absolute', top: '1rem', right: '1rem' }}
      >
        Quitter
      </button>

      <GameHeader
        roundNumber={roundNumber}
        phase={phase}
        timeLeft={timeLeft}
        isChef={isChef}
        gameStarted={gameStarted}
        roomParams={roomParams}
        setRoomParams={setRoomParams}
        onUploadCsv={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          uploadCsv(text);
        }}
        datasetReady={datasetReady}
        datasetInfo={datasetInfo}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

      <div className="row-wrap game-layout" style={{ gap: '1rem', marginTop: '1rem' }}>
        <div className="game-main">
          <ChatPanel messages={messages} />
          <div className="guess-zone">
            <GuessZone
              phase={phase}
              guessOptions={guessOptions}
              hasGuessed={hasGuessed}
              selectedGuess={myGuess}
              onGuess={submitGuess}
            />
          </div>
        </div>

        <div className="sidebar">
          <Scores scores={scores} chefName={chefName} guessedPlayers={playersGuessed} />
          {/* Cacher le chat de la sidebar lorsque l'overlay est ouvert (mobile) */}
          <div style={{ display: chatOpen ? 'none' : undefined }}>
            <ChatBox messages={chatMessages} onSend={sendChatMessage} />
          </div>
        </div>
      </div>


      <RoundSummaryOverlay
        visible={overlayVisible}
        author={lastAuthor}
        scores={scores}
        proposals={lastProposals}
        roundPoints={lastRoundPoints}
        myPseudo={pseudo}
      />

      <GameEndOverlay
        visible={phase === 'Terminé'}
        ranking={finalRanking}
        isChef={isChef}
        onRestart={restartLobby}
        onQuit={() => {
          handleLeave();
          if (onLeave) onLeave();
          window.location.reload();
        }}
      />

      {gameStarted && gameSettings && (
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {currentRoom && <span>Salon {currentRoom} – </span>}
          Paramètres : {gameSettings.roundsTotal} manches –{' '}
          {gameSettings.messagesPerRound} messages/manche –{' '}
          {gameSettings.onlyGifs ? 'uniquement GIFs' : 'textes et GIFs'} – Pav-o-meter {gameSettings.minMessageLength}
        </div>
      )}

      {/* Bouton flottant de chat (mobile). Visible via CSS @media */}
      <button
        type="button"
        className="chat-fab"
        aria-label="Ouvrir le chat"
        onClick={openChat}
      >
        💬
        {chatUnread && <span className="badge">1</span>}
      </button>

      {/* Overlay de chat (mobile) */}
      {chatOpen && (
        <div className="chat-overlay" role="dialog" aria-modal="true" onClick={closeChat}>
          <div className="chat-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Chat</h3>
              <button onClick={closeChat} aria-label="Fermer le chat">Fermer</button>
            </div>
            <ChatBox messages={chatMessages} onSend={sendChatMessage} floatingInput showHeader={false} />
          </div>
        </div>
      )}
    </div>
  );
}
