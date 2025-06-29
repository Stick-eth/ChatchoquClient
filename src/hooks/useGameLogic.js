// src/hooks/useGameLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../socket';

export function useGameLogic(pseudo) {
  // états connexion & rôle
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isChef, setIsChef] = useState(false);
  const [chefName, setChefName] = useState('');

  // état de la manche
  const [roundNumber, setRoundNumber] = useState(0);
  const [phase, setPhase] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);       // ← compte-à-rebours
  const [guessOptions, setGuessOptions] = useState([]);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [myGuess, setMyGuess] = useState(null);
  const [scores, setScores] = useState({});
  const scoresRef = useRef({});
  const [playersGuessed, setPlayersGuessed] = useState([]);

  // affichage
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  // **nouveau** : on stocke l’auteur de la manche qui vient de se terminer
  const [lastAuthor, setLastAuthor] = useState(null);
  // on conserve aussi les propositions de la manche
  const [lastProposals, setLastProposals] = useState({});
  // points gagnés lors de la dernière manche
  const [lastRoundPoints, setLastRoundPoints] = useState({});
  // paramètres envoyés par le serveur lors du démarrage
  const [gameSettings, setGameSettings] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('');
  const [finalRanking, setFinalRanking] = useState([]);

  // store latest scores for callbacks
  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  // ─── TIMER : décrémente `timeLeft` chaque seconde ─────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [timeLeft]);

  // ─── SOCKET EVENTS ────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Nouvelle salle / participants
    function handleRoomData({ participants, chef, gameStarted: gs }) {
      setConnected(true);
      setGameStarted(gs);
      setIsChef(pseudo === chef);
      setChefName(chef);
      setScores(Object.fromEntries(participants.map(p => [p, 0])));
      setFinalRanking([]);
      setAnnouncements([
        `Participants : ${participants
          .map(p => (p === chef ? `👑${p}` : p))
          .join(', ')}`
      ]);
    }

    function handleUserJoined({ pseudo: newPseudo, chef }) {
      setScores(prevScores => {
        const newScores = { ...prevScores, [newPseudo]: 0 };
        setAnnouncements([
          `Participants : ${Object.keys(newScores)
            .map(p => (p === chef ? `👑${p}` : p))
            .join(', ')}`
        ]);
        return newScores;
      });
      setIsChef(pseudo === chef);
      setChefName(chef);
    }

    function handlePlayerLeft({ pseudo: leftPseudo }) {
      setScores(prevScores => {
        const { [leftPseudo]: _removed, ...newScores } = prevScores;
        setAnnouncements([
          `Participants : ${Object.keys(newScores)
            .map(p => (p === chefName ? `👑${p}` : p))
            .join(', ')}`
        ]);
        return newScores;
      });
    }

    function handleChefChanged({ chef }) {
      setChefName(chef);
      setIsChef(pseudo === chef);
      setAnnouncements([
        `Participants : ${Object.keys(scoresRef.current)
          .map(p => (p === chef ? `👑${p}` : p))
          .join(', ')}`
      ]);
    }

    // 2. Partie démarrée
    function handleGameStarted({ roundsTotal, messagesPerRound, onlyGifs, minMessageLength }) {
      setGameStarted(true);
      setGameSettings({ roundsTotal, messagesPerRound, onlyGifs, minMessageLength });
      setFinalRanking([]);
    }

    // 3. Nouvelle manche : phase "Réflexion"
    function handleRoundStarted({ roundNumber: rn, scores: sc, guessOptions: go, phaseDuration }) {
      setRoundNumber(rn);
      setPhase('Réflexion');
      setTimeLeft(phaseDuration);
      setScores(sc);
      setGuessOptions(go);
      setHasGuessed(false);
      setMyGuess(null);
      setPlayersGuessed([]);
      setMessages([]);
      setAnnouncements([]);
      setLastAuthor(null);  // on réinitialise l’auteur précédent
      setLastProposals({});
      setLastRoundPoints({});
    }

    // 4. Message révélé
    function handleMessageRevealed({ messagePart }) {
      setMessages(msgs => [
        ...msgs,
        { content: messagePart, timestamp: new Date(), type: 'chat' }
      ]);
    }

    function handlePlayerGuessed({ pseudo: guessedPseudo }) {
      setPlayersGuessed(pg =>
        pg.includes(guessedPseudo) ? pg : [...pg, guessedPseudo]
      );
    }

    // 5. Fin de manche : phase "Résultat"
    function handleRoundEnded({ correctAuthor, proposals, scores: sc, resultDuration, roundPoints }) {
      setPhase('Résultat');
      setTimeLeft(resultDuration);
      setScores(sc);
      setLastAuthor(correctAuthor);  // on conserve l’auteur
      setLastProposals(proposals);
      setLastRoundPoints(roundPoints || {});
      const roundAnnouncements = [
        `L'auteur était ${correctAuthor}`,
        ...Object.entries(proposals)
          .filter(([, { guess }]) => guess === correctAuthor)
          .map(([player]) => `${player} a deviné correctement !`)
      ];
      setAnnouncements(roundAnnouncements);
    }

    // 6. Transition entre manches
    function handleTransitionStarted({ nextRoundIn, correctAuthor }) {
      setPhase('Transition');
      setTimeLeft(nextRoundIn);
      setAnnouncements([
       `Manche ${roundNumber}, l'auteur était ${correctAuthor}.`,]);
    }

    // 7. Fin de partie
    function handleGameEnded({ finalRanking }) {
      setPhase('Terminé');
      setTimeLeft(0);
      setPlayersGuessed([]);
      setFinalRanking(finalRanking);
      setAnnouncements([
        'Partie terminée ! Classement final :',
        ...finalRanking.map(r => `${r.pseudo} (${r.score})`)
      ]);
    }

    // 8. Lobby redémarré
    function handleLobbyRestarted({ participants, chef }) {
      setGameStarted(false);
      setPhase('');
      setRoundNumber(0);
      setScores(Object.fromEntries(participants.map(p => [p, 0])));
      setGuessOptions([]);
      setMessages([]);
      setPlayersGuessed([]);
      setAnnouncements([
        `Participants : ${participants.join(', ')}`,
        `Chef : ${chef}`,
      ]);
      setIsChef(pseudo === chef);
      setGameSettings(null);
      setLastAuthor(null);
      setLastProposals({});
      setLastRoundPoints({});
      setFinalRanking([]);
    }

    // 8. Erreur serveur
    function handleErrorMessage(msg) {
      setAnnouncements(a => [...a, `Erreur : ${msg}`]);
    }

    function handleChatMessage({ pseudo: author, message }) {
      setChatMessages(msgs => [
        ...msgs,
        { pseudo: author, message, timestamp: new Date() },
      ]);
    }

    // Enregistrement des handlers
    socket.on('roomData', handleRoomData);
    socket.on('userJoined', handleUserJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('chefChanged', handleChefChanged);
    socket.on('gameStarted', handleGameStarted);
    socket.on('roundStarted', handleRoundStarted);
    socket.on('messageRevealed', handleMessageRevealed);
    socket.on('playerGuessed', handlePlayerGuessed);
    socket.on('roundEnded', handleRoundEnded);
    socket.on('transitionStarted', handleTransitionStarted);
    socket.on('gameEnded', handleGameEnded);
    socket.on('lobbyRestarted', handleLobbyRestarted);
    socket.on('errorMessage', handleErrorMessage);
    socket.on('chatMessage', handleChatMessage);

    // Cleanup
    return () => {
      socket.off('roomData', handleRoomData);
      socket.off('userJoined', handleUserJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('chefChanged', handleChefChanged);
      socket.off('gameStarted', handleGameStarted);
      socket.off('roundStarted', handleRoundStarted);
      socket.off('messageRevealed', handleMessageRevealed);
      socket.off('playerGuessed', handlePlayerGuessed);
      socket.off('roundEnded', handleRoundEnded);
      socket.off('transitionStarted', handleTransitionStarted);
      socket.off('gameEnded', handleGameEnded);
      socket.off('lobbyRestarted', handleLobbyRestarted);
      socket.off('errorMessage', handleErrorMessage);
      socket.off('chatMessage', handleChatMessage);
    };
  }, [pseudo, roundNumber, lastAuthor, chefName]);

  // ─── ÉMETTEURS VERS LE SERVEUR ────────────────────────────────────────────
  const joinRoom = useCallback(({ roomCode, pseudo: p }) => {
    setCurrentRoom(roomCode);
    socket.emit('joinRoom', { roomCode, pseudo: p });
  }, []);

  const startGame = useCallback((params = {}) => {
    socket.emit('startGame', params);
  }, []);

  const submitGuess = useCallback(guess => {
    socket.emit('submitGuess', { guess });
    setHasGuessed(true);
    setMyGuess(guess);
    setPlayersGuessed(pg => (pg.includes(pseudo) ? pg : [...pg, pseudo]));
  }, [pseudo]);

  const restartLobby = useCallback(() => {
    socket.emit('restartLobby');
  }, []);

  const sendChatMessage = useCallback(message => {
    socket.emit('sendChatMessage', { message });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit('leaveRoom');
    // reset local state
    setConnected(false);
    setGameStarted(false);
    setIsChef(false);
    setRoundNumber(0);
    setPhase('');
    setTimeLeft(0);
    setGuessOptions([]);
    setHasGuessed(false);
    setMyGuess(null);
    setPlayersGuessed([]);
    setScores({});
    setMessages([]);
    setChatMessages([]);
    setAnnouncements([]);
    setLastAuthor(null);
    setLastProposals({});
    setLastRoundPoints({});
    setGameSettings(null);
    setCurrentRoom('');
    setFinalRanking([]);
  }, []);

  // ─── VALEURS EXPOSEES AU COMPOSANT ────────────────────────────────────────
  return {
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
    sendChatMessage,
    finalRanking,
    chatMessages,
  };
}
