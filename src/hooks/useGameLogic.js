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
  const [datasetReady, setDatasetReady] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  // Upload CSV progress state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0..100

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
    function handleRoomData({ participants, chef, gameStarted: gs, datasetReady: ready, datasetMeta }) {
      setConnected(true);
      setGameStarted(gs);
      setIsChef(pseudo === chef);
      setChefName(chef);
      setScores(Object.fromEntries(participants.map(p => [p, 0])));
      setFinalRanking([]);
      setDatasetReady(!!ready);
      if (datasetMeta) setDatasetInfo(datasetMeta);
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

    function handleDatasetUpdated({ authors, totalMessages, ready }) {
      setDatasetReady(!!ready);
      setDatasetInfo({ authors, totalMessages });
      setAnnouncements(a => [
        ...a,
        `Dataset importé (${authors} auteurs, ${totalMessages} messages)`
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
  socket.on('datasetUpdated', handleDatasetUpdated);
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
      socket.off('datasetUpdated', handleDatasetUpdated);
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
  const joinRoom = useCallback(({ roomCode, pseudo: p, secret }) => {
    setCurrentRoom(roomCode);
    socket.emit('joinRoom', { roomCode, pseudo: p, secret });
  }, []);

  const startGame = useCallback((params = {}) => {
    socket.emit('startGame', params);
  }, []);

  const uploadCsv = useCallback(async (csvText) => {
    try {
      if (!currentRoom) throw new Error('Room non définie');
      const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CHATCHOQ_SERVER_URL)
        || (typeof window !== 'undefined' && window.location && window.location.hostname ? `http://${window.location.hostname}:3000` : 'http://localhost:3000');

      // Utilise XMLHttpRequest pour suivre la progression d'upload
      setUploading(true);
      setUploadProgress(0);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${baseUrl}/api/rooms/${currentRoom}/csv`, true);
        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.setRequestHeader('x-chef-id', socket.id || '');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(pct);
          } else {
            // Si la taille n'est pas calculable, afficher une progression indéterminée (on laisse le pourcentage tel quel)
            setUploadProgress((p) => (p < 99 ? p + 1 : p));
          }
        };

        xhr.onload = () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText || '{}');
              if (typeof data.authors === 'number') {
                setDatasetReady(true);
                setDatasetInfo({ authors: data.authors, totalMessages: data.totalMessages || 0 });
                setAnnouncements(a => [...a, `Dataset importé (${data.authors} auteurs, ${data.totalMessages || 0} messages)`]);
              }
              resolve(null);
            } else {
              let msg = `HTTP ${xhr.status}`;
              try {
                const data = JSON.parse(xhr.responseText || '{}');
                if (data && data.error) msg = data.error;
              } catch {
                /* ignore JSON parse error */
              }
              setAnnouncements(a => [...a, `Erreur upload CSV: ${msg}`]);
              reject(new Error(msg));
            }
          } catch (err) {
            setAnnouncements(a => [...a, `Erreur upload CSV: ${err.message}`]);
            reject(err);
          }
        };

        xhr.onerror = () => {
          setAnnouncements(a => [...a, 'Erreur upload CSV: réseau']);
          reject(new Error('network_error'));
        };

        xhr.onloadend = () => {
          setUploading(false);
          setUploadProgress(100);
          // après un court délai, réinitialiser visuellement
          setTimeout(() => setUploadProgress(0), 600);
        };

        xhr.send(csvText);
      });
    } catch (e) {
      setUploading(false);
      setAnnouncements(a => [...a, `Erreur upload CSV: ${e.message}`]);
    }
  }, [currentRoom]);

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
    const safe = (message || '').toString().slice(0, 500);
    socket.emit('sendChatMessage', { message: safe });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit('leaveRoom', () => {
      // ACK reçu: on peut nettoyer et laisser la navigation se faire côté UI
    });
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
    datasetReady,
    datasetInfo,
    uploadCsv,
    uploading,
    uploadProgress,
  };
}
