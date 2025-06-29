import React, { useEffect, useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameHeader } from '../components/GameHeader';
import { ChatPanel } from '../components/ChatPanel';
import { ChatBox } from '../components/ChatBox';
import { Announcements } from '../components/Announcements';
import { Scores } from '../components/Scores';
import { GuessZone } from '../components/GuessZone';
import { RoundSummaryOverlay } from '../components/RoundSummaryOverlay';
import { GameEndOverlay } from '../components/GameEndOverlay';

export default function GamePage({ roomCode, pseudo, onLeave }) {
  const [joinAttempted, setJoinAttempted] = useState(false);
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
  } = useGameLogic(pseudo);

  // join room automatically when not connected
  useEffect(() => {
    if (!connected && roomCode && pseudo && !joinAttempted) {
      joinRoom({ roomCode, pseudo });
      setJoinAttempted(true);
    }
  }, [connected, roomCode, pseudo, joinAttempted, joinRoom]);

  const handleQuit = () => {
    if (window.confirm('Quitter la partie ?')) {
      setJoinAttempted(true);
      leaveRoom();
      if (onLeave) onLeave();
      window.location.reload();
    }
  };

  const overlayVisible = phase === 'Résultat' || phase === 'Transition';

  // Loading screen while connecting
  if (!connected) {
    return <div className="container">Connexion…</div>;
  }

  if (!gameStarted) {
    return (
      <div className="container game-page" style={{ position: 'relative' }}>
        <h1>{`Room #${currentRoom}`}</h1>

        <button
          onClick={handleQuit}
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
          <ChatBox messages={chatMessages} onSend={sendChatMessage} />
          <div className="sidebar">
            <Scores scores={scores} chefName={chefName} guessedPlayers={playersGuessed} />
          </div>
        </div>

        <Announcements announcements={announcements} />
      </div>
    );
  }

  return (
    <div className="container game-page" style={{ position: 'relative' }}>
      <h1>{gameStarted ? 'TerraGuessr' : `Room #${currentRoom}`}</h1>

      <button
        onClick={handleQuit}
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
        onQuit={handleQuit}
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
