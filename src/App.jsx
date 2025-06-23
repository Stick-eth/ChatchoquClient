import React, { useEffect, useState } from 'react';
import GamePage from './pages/GamePage';
import { ServerList } from './pages/ServerList';
import { Home } from './pages/Home';

export default function App() {
  const [pseudo, setPseudo] = useState(() => localStorage.getItem('pseudo') || '');
  const [route, setRoute] = useState(window.location.hash || '#/');

  const navigate = hash => {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(hash);
    }
  };

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const updatePseudo = p => {
    setPseudo(p);
    if (p) {
      localStorage.setItem('pseudo', p);
    } else {
      localStorage.removeItem('pseudo');
    }
  };

  if (!pseudo && route !== '#/') {
    navigate('#/');
    return null;
  }

  if (route.startsWith('#/room/')) {
    const code = route.slice(7);
    return <GamePage roomCode={code} pseudo={pseudo} onLeave={() => navigate('#/servers')} />;
  }

  if (route === '#/servers') {
    return (
      <ServerList
        pseudo={pseudo}
        onJoin={code => navigate('#/room/' + code)}
        onPseudoChange={updatePseudo}
      />
    );
  }

  return <Home onConfirm={p => { updatePseudo(p); navigate('#/servers'); }} />;
}
