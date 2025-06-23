import React, { useEffect, useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameHeader } from '../components/GameHeader';
import { ChatPanel } from '../components/ChatPanel';
import { Announcements } from '../components/Announcements';
import { Scores } from '../components/Scores';
import { GuessZone } from '../components/GuessZone';
import { RoundSummaryOverlay } from '../components/RoundSummaryOverlay';
import { GameEndOverlay } from '../components/GameEndOverlay';

export default function GamePage({ roomCode, pseudo, onLeave }) {
  const [roomParams, setRoomParams] = useState({
    rounds: 10,
    onlyGifs: false,
    messagesPerRound: 1,
    minMessageLength: 20,
  });

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
    scores,
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
  } = useGameLogic(pseudo);

  // join room automatically when not connected
  useEffect(() => {
    if (!connected && roomCode && pseudo) {
      joinRoom({ roomCode, pseudo });
    }
  }, [connected, roomCode, pseudo, joinRoom]);

  const overlayVisible = phase === 'Résultat' || phase === 'Transition';

  // Loading screen while connecting
  if (!connected) {
    return <div className="container">Connexion…</div>;
  }

  return (
    <div className="container game-page" style={{ position: 'relative' }}>
      <h1>{gameStarted ? "Devine l'auteur" : `Room #${currentRoom}`}</h1>

      <button
        onClick={() => {
          if (window.confirm('Quitter la partie ?')) {
            leaveRoom();
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
        onStart={() => startGame(roomParams)}
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <ChatPanel messages={messages} />

        <div className="sidebar">
          <Announcements announcements={announcements} />
          <Scores scores={scores} chefName={chefName} />
        </div>
      </div>

      <GuessZone
        phase={phase}
        guessOptions={guessOptions}
        hasGuessed={hasGuessed}
        onGuess={submitGuess}
      />

      <RoundSummaryOverlay
        visible={overlayVisible}
        author={lastAuthor}
        scores={scores}
        proposals={lastProposals}
        roundPoints={lastRoundPoints}
      />

      <GameEndOverlay
        visible={phase === 'Terminé'}
        ranking={finalRanking}
        isChef={isChef}
        onRestart={restartLobby}
        onQuit={() => {
          leaveRoom();
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
