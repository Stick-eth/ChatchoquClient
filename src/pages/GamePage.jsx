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

  useEffect(() => {
    return () => {
      leaveRoom();
      if (onLeave) onLeave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading screen while connecting
  if (!connected) {
    return <div style={{ padding: '2rem' }}>Connexion…</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', position: 'relative' }}>
      <h1>{gameStarted ? "Devine l'auteur" : `Room #${currentRoom}`}</h1>

      <button
        onClick={() => {
          if (window.confirm('Quitter la partie ?')) {
            leaveRoom();
            if (onLeave) onLeave();
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

      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
        <ChatPanel messages={messages} />

        <div style={{ flex: 1 }}>
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
        }}
      />

      {gameStarted && gameSettings && (
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555' }}>
          {currentRoom && <span>Salon {currentRoom} – </span>}
          Paramètres : {gameSettings.roundsTotal} manches –{' '}
          {gameSettings.messagesPerRound} messages/manche –{' '}
          {gameSettings.onlyGifs ? 'uniquement GIFs' : 'textes et GIFs'} – Pav-o-meter {gameSettings.minMessageLength}
        </div>
      )}
    </div>
  );
}
