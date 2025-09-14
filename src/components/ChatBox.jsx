import React, { useEffect, useRef, useState } from 'react';

export function ChatBox({ messages, onSend, floatingInput = false, showHeader = true }) {
  const [text, setText] = useState('');
  const containerRef = useRef(null);

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

  const inputForm = (
    <form onSubmit={handleSubmit} className={floatingInput ? 'chat-input-floating' : 'chat-input'}>
      <div className={floatingInput ? 'chat-input-inner' : ''}>
        <input
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
