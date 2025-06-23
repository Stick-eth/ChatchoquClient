// src/App.jsx
import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { JoinRoom } from './components/JoinRoom';
import { GameHeader } from './components/GameHeader';
import { ChatPanel } from './components/ChatPanel';
import { Announcements } from './components/Announcements';
import { Scores } from './components/Scores';
import { GuessZone } from './components/GuessZone';
import { RoundSummaryOverlay } from './components/RoundSummaryOverlay';
import { GameEndOverlay } from './components/GameEndOverlay';

export default function App() {
  const [roomCode, setRoomCode] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [roomParams, setRoomParams] = useState({
    rounds: 10,
    onlyGifs: false,
    messagesPerRound: 1,
    pav: 100,
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
    gameSettings,
    currentRoom,
    joinRoom,
    startGame,
    submitGuess,
    restartLobby,
    leaveRoom,
    finalRanking,
  } = useGameLogic(pseudo);

  const overlayVisible = phase === 'Résultat' || phase === 'Transition';

  // Écran de connexion tant que non connecté
  if (!connected) {
    return (
      <JoinRoom
        roomCode={roomCode}
        setRoomCode={setRoomCode}
        pseudo={pseudo}
        setPseudo={setPseudo}
        onJoin={({ roomCode, pseudo }) => joinRoom({ roomCode, pseudo })}
      />
    );
  }

  // Vue principale de la partie
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', position: 'relative' }}>
      <h1>
        {gameStarted ? "Devine l'auteur" : `Room #${currentRoom}`}
      </h1>

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
      />

      <GameEndOverlay
        visible={phase === 'Terminé'}
        ranking={finalRanking}
        isChef={isChef}
        onRestart={restartLobby}
        onQuit={leaveRoom}
      />

      {gameStarted && gameSettings && (
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#555' }}>
          {currentRoom && <span>Salon {currentRoom} – </span>}
          Paramètres : {gameSettings.roundsTotal} manches –{' '}
          {gameSettings.messagesPerRound} messages/manche –{' '}
          {gameSettings.onlyGifs ? 'uniquement GIFs' : 'textes et GIFs'} – Pav-o-meter {gameSettings.pav}
        </div>
      )}
    </div>
  );
}
