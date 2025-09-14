import React, { useEffect, useRef, useState } from 'react';

export function ChatBox({ messages, onSend }) {
  const [text, setText] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const c = containerRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [messages]);

  const handleSubmit = e => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (onSend) onSend(trimmed);
    setText('');
  };

  return (
    <div className="chat-box" style={{ position: 'relative' }}>
      <span className="container-emoji-badge">💬</span>
      <h3>Chat</h3>
      <div ref={containerRef} className="chat-panel">
        {messages.map((m, i) => (
          <div key={i} className="chat-message">
            <span className="chat-timestamp">[{m.timestamp.toLocaleTimeString()}]</span>{' '}
            <strong>{m.pseudo}:</strong> {m.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message..."
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
