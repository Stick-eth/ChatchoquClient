import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { JoinRoom } from './components/JoinRoom';
import { GameHeader } from './components/GameHeader';
import { ChatPanel } from './components/ChatPanel';
import { Announcements } from './components/Announcements';
import { Scores } from './components/Scores';
import { GuessZone } from './components/GuessZone';

export default function App() {
  const [roomCode, setRoomCode] = useState('');
  const [pseudo, setPseudo] = useState('');
  const {
    connected, gameStarted, isChef,
    roundNumber, phase, guessOptions, hasGuessed, scores,
    messages, announcements,
    joinRoom, startGame, submitGuess,
  } = useGameLogic(pseudo);

  if (!connected) {
    return (
      <JoinRoom
        roomCode={roomCode}
        setRoomCode={setRoomCode}
        pseudo={pseudo}
        setPseudo={setPseudo}
        onJoin={joinRoom}
      />
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Devine l'auteur</h1>
      <GameHeader
        roundNumber={roundNumber}
        phase={phase}
        isChef={isChef}
        gameStarted={gameStarted}
        onStart={startGame}
      />
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
        <ChatPanel messages={messages} />
        <div style={{ flex: 1 }}>
          <Announcements announcements={announcements} />
          <Scores scores={scores} />
        </div>
      </div>
      <GuessZone
        phase={phase}
        guessOptions={guessOptions}
        hasGuessed={hasGuessed}
        onGuess={submitGuess}
      />
    </div>
  );
}
