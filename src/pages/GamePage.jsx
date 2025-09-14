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

  const overlayVisible = phase === 'Résultat' || phase === 'Transition';

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
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <ChatBox messages={chatMessages} onSend={sendChatMessage} />
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
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <ChatPanel messages={messages} />

        <div className="sidebar">
          <Scores scores={scores} chefName={chefName} guessedPlayers={playersGuessed} />
          <ChatBox messages={chatMessages} onSend={sendChatMessage} />
        </div>
      </div>

      <GuessZone
        phase={phase}
        guessOptions={guessOptions}
        hasGuessed={hasGuessed}
        selectedGuess={myGuess}
        onGuess={submitGuess}
      />

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
    </div>
  );
}
