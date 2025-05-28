// src/components/ChatPanel.jsx
import React, { useEffect, useRef } from 'react';
import { TenorGif } from './TenorGif';

const TENOR_REGEX = /https?:\/\/tenor\.com\/view\/[^\s]+/i;

export function ChatPanel({ messages }) {
  const containerRef = useRef(null);

  // À chaque mise à jour de messages, on descend tout en bas
  useEffect(() => {
    const c = containerRef.current;
    if (c) {
      c.scrollTop = c.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 2,
        border: '1px solid #ccc',
        padding: '1rem',
        height: '300px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((m, i) => {
        const text = m.content;
        const match = text.match(TENOR_REGEX);

        return (
          <div key={i} style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#555', fontSize: '0.8rem' }}>
              [{m.timestamp.toLocaleTimeString()}]
            </span>{' '}
            {match
              ? <TenorGif url={match[0]} height={200} />
              : <span>{text}</span>
            }
          </div>
        );
      })}
    </div>
  );
}
