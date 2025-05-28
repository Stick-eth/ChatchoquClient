import { useState, useEffect } from 'react';
import { socket } from '../socket';

export function useGameLogic(pseudo) {
  // états de connexion et de partie
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isChef, setIsChef] = useState(false);
  // état du jeu
  const [roundNumber, setRoundNumber] = useState(0);
  const [phase, setPhase] = useState('');
  const [guessOptions, setGuessOptions] = useState([]);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [scores, setScores] = useState({});
  // affichage
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // handlers
    socket.on('roomData', ({ participants, chef, gameStarted }) => {
      setConnected(true);
      setGameStarted(gameStarted);
      setIsChef(pseudo === chef);
      setScores(Object.fromEntries(participants.map(p => [p, 0])));
      setAnnouncements([
        `Participants: ${participants.join(', ')}`,
        `Chef: ${chef}`,
      ]);
    });
    socket.on('gameStarted', () => setGameStarted(true));
    socket.on('roundStarted', ({ roundNumber, scores, guessOptions }) => {
      setMessages([]);
      setAnnouncements([]);
      setRoundNumber(roundNumber);
      setPhase('Réflexion');
      setScores(scores);
      setGuessOptions(guessOptions);
      setHasGuessed(false);
    });
    socket.on('messageRevealed', ({ messagePart }) => {
      setMessages(msgs => [
        ...msgs,
        { content: messagePart, timestamp: new Date(), type: 'chat' },
      ]);
    });
    socket.on('roundEnded', ({ correctAuthor, proposals, scores }) => {
      setPhase('Résultat');
      setScores(scores);
      const roundAnnouncements = [
        `L'auteur était ${correctAuthor}`,
        ...Object.entries(proposals)
          .filter(([, { guess }]) => guess === correctAuthor)
          .map(([player]) => `${player} a marqué 1 point !`),
      ];
      setAnnouncements(roundAnnouncements);
    });
    socket.on('transitionStarted', ({ ranking, nextRoundIn }) => {
      setPhase(`Transition (${nextRoundIn}s)`);
      ranking; // on peut utiliser le classement pour afficher des infos
    });
    socket.on('gameEnded', ({ finalRanking }) => {
      setPhase('Terminé');
      setAnnouncements([
        'Partie terminée ! Classement final :',
        ...finalRanking.map(r => `${r.pseudo} (${r.score})`),
      ]);
    });
    socket.on('errorMessage', msg => {
      setAnnouncements(a => [...a, `Erreur : ${msg}`]);
    });

    return () => socket.off();
  }, [pseudo]);

  return {
    connected, gameStarted, isChef,
    roundNumber, phase, guessOptions, hasGuessed, scores,
    messages, announcements,
    // exposer les émetteurs
    joinRoom: ({ roomCode, pseudo }) => socket.emit('joinRoom', { roomCode, pseudo }),
    startGame: () => socket.emit('startGame'),
    submitGuess: guess => {
      socket.emit('submitGuess', { guess });
      setHasGuessed(true);
    },
  };
}
