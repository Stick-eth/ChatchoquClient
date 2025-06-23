// src/hooks/useGameLogic.js
import { useState, useEffect } from 'react';
import { socket } from '../socket';

export function useGameLogic(pseudo) {
  // états connexion & rôle
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isChef, setIsChef] = useState(false);

  // état de la manche
  const [roundNumber, setRoundNumber] = useState(0);
  const [phase, setPhase] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);       // ← compte-à-rebours
  const [guessOptions, setGuessOptions] = useState([]);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [scores, setScores] = useState({});

  // affichage
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // **nouveau** : on stocke l’auteur de la manche qui vient de se terminer
  const [lastAuthor, setLastAuthor] = useState(null);

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
      setScores(Object.fromEntries(participants.map(p => [p, 0])));
      setAnnouncements([
        `Participants : ${participants.join(', ')}`,
        `Chef : ${chef}`
      ]);
    }

    // 2. Partie démarrée
    function handleGameStarted() {
      setGameStarted(true);
    }

    // 3. Nouvelle manche : phase "Réflexion"
    function handleRoundStarted({ roundNumber: rn, scores: sc, guessOptions: go, phaseDuration }) {
      setRoundNumber(rn);
      setPhase('Réflexion');
      setTimeLeft(phaseDuration);
      setScores(sc);
      setGuessOptions(go);
      setHasGuessed(false);
      setMessages([]);
      setAnnouncements([]);
      setLastAuthor(null);  // on réinitialise l’auteur précédent
    }

    // 4. Message révélé
    function handleMessageRevealed({ messagePart }) {
      setMessages(msgs => [
        ...msgs,
        { content: messagePart, timestamp: new Date(), type: 'chat' }
      ]);
    }

    // 5. Fin de manche : phase "Résultat"
    function handleRoundEnded({ correctAuthor, proposals, scores: sc, resultDuration }) {
      setPhase('Résultat');
      setTimeLeft(resultDuration);
      setScores(sc);
      setLastAuthor(correctAuthor);  // on conserve l’auteur
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
      setAnnouncements([
        'Partie terminée ! Classement final :',
        ...finalRanking.map(r => `${r.pseudo} (${r.score})`)
      ]);
    }

    // 8. Erreur serveur
    function handleErrorMessage(msg) {
      setAnnouncements(a => [...a, `Erreur : ${msg}`]);
    }

    // Enregistrement des handlers
    socket.on('roomData', handleRoomData);
    socket.on('gameStarted', handleGameStarted);
    socket.on('roundStarted', handleRoundStarted);
    socket.on('messageRevealed', handleMessageRevealed);
    socket.on('roundEnded', handleRoundEnded);
    socket.on('transitionStarted', handleTransitionStarted);
    socket.on('gameEnded', handleGameEnded);
    socket.on('errorMessage', handleErrorMessage);

    // Cleanup
    return () => {
      socket.off('roomData', handleRoomData);
      socket.off('gameStarted', handleGameStarted);
      socket.off('roundStarted', handleRoundStarted);
      socket.off('messageRevealed', handleMessageRevealed);
      socket.off('roundEnded', handleRoundEnded);
      socket.off('transitionStarted', handleTransitionStarted);
      socket.off('gameEnded', handleGameEnded);
      socket.off('errorMessage', handleErrorMessage);
    };
  }, [pseudo, roundNumber, lastAuthor]);

  // ─── ÉMETTEURS VERS LE SERVEUR ────────────────────────────────────────────
  function joinRoom({ roomCode, pseudo: p }) {
    socket.emit('joinRoom', { roomCode, pseudo: p });
  }

  function startGame() {
    socket.emit('startGame');
  }

  function submitGuess(guess) {
    socket.emit('submitGuess', { guess });
    setHasGuessed(true);
  }

  // ─── VALEURS EXPOSEES AU COMPOSANT ────────────────────────────────────────
  return {
    connected,
    gameStarted,
    isChef,
    roundNumber,
    phase,
    timeLeft,
    guessOptions,
    hasGuessed,
    scores,
    messages,
    announcements,
    lastAuthor,
    joinRoom,
    startGame,
    submitGuess,
  };
}
