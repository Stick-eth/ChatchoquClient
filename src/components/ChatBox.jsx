import React, { useEffect, useRef, useState } from 'react';

export function ChatBox({ messages, onSend, floatingInput = false, showHeader = true }) {
  const [text, setText] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const c = containerRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [messages]);

  const handleSubmit = e => {
    e.preventDefault();
    const trimmed = text.trim().slice(0, 500);
    if (!trimmed) return;
    if (onSend) onSend(trimmed);
    setText('');
  };

  // Permettre l'insertion de texte par défaut quand l'utilisateur tape hors champ
  useEffect(() => {
    const onInsert = (e) => {
      const str = e?.detail?.text || '';
      if (!str) return;
      // Ne pas insérer si ce ChatBox n'est pas visible
      const el = inputRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      if (!visible) return;
      setText(prev => (prev + str).slice(0, 500));
      // Focus pour continuer la saisie naturellement
      el.focus();
    };
    window.addEventListener('chatbox-insert-text', onInsert);
    return () => window.removeEventListener('chatbox-insert-text', onInsert);
  }, []);

  const inputForm = (
    <form onSubmit={handleSubmit} className={floatingInput ? 'chat-input-floating' : 'chat-input'}>
      <div className={floatingInput ? 'chat-input-inner' : ''}>
        <input
          ref={inputRef}
          value={text}
          maxLength={500}
          onChange={e => setText(e.target.value.slice(0, 500))}
          placeholder="Message..."
        />
        <button type="submit">Envoyer</button>
      </div>
    </form>
  );

  return (
    <div className="chat-box" style={{ position: 'relative' }}>
      {showHeader && <span className="container-emoji-badge">💬</span>}
      {showHeader && <h3>Chat</h3>}
      <div ref={containerRef} className={`chat-panel${floatingInput ? ' has-floating' : ''}`}>
        {messages.map((m, i) => (
          <div key={i} className="chat-message">
            <span className="chat-timestamp">[{m.timestamp.toLocaleTimeString()}]</span>{' '}
            <strong>{m.pseudo}:</strong> {m.message}
          </div>
        ))}
      </div>
      {inputForm}
    </div>
  );
}
