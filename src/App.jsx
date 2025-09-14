import React, { useCallback, useEffect, useRef, useState } from 'react';
import GamePage from './pages/GamePage';
import { ServerList } from './pages/ServerList';
import { Home } from './pages/Home';
import LoadingOverlay from './components/LoadingOverlay';
import { Landing } from './pages/Landing';

export default function App() {
  const [pseudo, setPseudo] = useState(() => localStorage.getItem('pseudo') || '');
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [showLoader, setShowLoader] = useState(true);
  const [leavingLoader, setLeavingLoader] = useState(false);
  const loaderTimersRef = useRef({ hide: null, unmount: null });
  const navInitiatedRef = useRef(false);
  const skipFirstRouteOverlayRef = useRef(true);

  const triggerLoader = useCallback((minDurationMs = 700) => {
    // Clear any existing timers
    if (loaderTimersRef.current.hide) clearTimeout(loaderTimersRef.current.hide);
    if (loaderTimersRef.current.unmount) clearTimeout(loaderTimersRef.current.unmount);
    setShowLoader(true);
    setLeavingLoader(false);
    loaderTimersRef.current.hide = setTimeout(() => {
      setLeavingLoader(true);
      loaderTimersRef.current.unmount = setTimeout(() => setShowLoader(false), 700); // match CSS leave
    }, minDurationMs);
  }, []);

  const navigate = useCallback(hash => {
    navInitiatedRef.current = true;
    triggerLoader(700);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(hash);
    }
  }, [triggerLoader]);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // redirect to server list if a pseudo is already stored
  useEffect(() => {
    if (pseudo && route === '#/') {
      navigate('#/servers');
    }
  }, [pseudo, route, navigate]);

  const updatePseudo = p => {
    const v = (p || '').trim().slice(0, 16);
    setPseudo(v);
    if (v) {
      localStorage.setItem('pseudo', v);
    } else {
      localStorage.removeItem('pseudo');
    }
  };

  // Handle initial loading overlay via triggerLoader for consistency
  useEffect(() => {
    triggerLoader(1000); // initial minimum 1s
    const timersRef = loaderTimersRef.current;
    return () => {
      if (timersRef.hide) clearTimeout(timersRef.hide);
      if (timersRef.unmount) clearTimeout(timersRef.unmount);
    };
  }, [triggerLoader]);

  // Show loader on any route change (including back/forward), except first render
  useEffect(() => {
    if (skipFirstRouteOverlayRef.current) {
      // First route resolution after mount: don't double-trigger
      skipFirstRouteOverlayRef.current = false;
      navInitiatedRef.current = false;
      return;
    }
    if (navInitiatedRef.current) {
      // navigate() already triggered loader
      navInitiatedRef.current = false;
      return;
    }
    // Route changed externally (back/forward or manual hash) → show loader
    triggerLoader(700);
  }, [route, triggerLoader]);

  if (!pseudo && route !== '#/' && route !== '#/start') {
    navigate('#/');
    return null;
  }

  if (route.startsWith('#/room/')) {
    const rest = route.slice(7); // could be 'CODE' or 'CODE?secret=...'
    const [codePart, query] = rest.split('?');
    const code = codePart;
    // parse secret in query string (hash mode)
    let secret = null;
    if (query) {
      const params = new URLSearchParams(query);
      secret = params.get('secret');
    }
    return (
      <>
        {showLoader && <LoadingOverlay visible={!leavingLoader} leaving={leavingLoader} />}
        <GamePage roomCode={code} roomSecret={secret} pseudo={pseudo} onLeave={() => navigate('#/servers')} />
      </>
    );
  }

  if (route === '#/servers') {
    return (
      <>
        {showLoader && <LoadingOverlay visible={!leavingLoader} leaving={leavingLoader} />}
        <ServerList
          pseudo={pseudo}
          onJoin={code => navigate('#/room/' + code)}
          onPseudoChange={updatePseudo}
        />
      </>
    );
  }

  if (route === '#/start') {
    return (
      <>
        {showLoader && <LoadingOverlay visible={!leavingLoader} leaving={leavingLoader} />}
        <Home onConfirm={p => { updatePseudo(p); navigate('#/servers'); }} />
      </>
    );
  }

  // Default: Landing page
  return (
    <>
      {showLoader && <LoadingOverlay visible={!leavingLoader} leaving={leavingLoader} />}
      <Landing />
    </>
  );
}
