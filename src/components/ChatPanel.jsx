// src/components/ChatPanel.jsx
import React, { useEffect, useRef } from 'react';
import { TenorGif } from './TenorGif';

// Regex global pour extraire les URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
// Regex spécifiques
const TENOR_REGEX = /^https?:\/\/tenor\.com\/view\/[^\s]+$/i;
// Regex for Discord CDN with query parameters
const DISCORD_IMG_REGEX = /^https?:\/\/cdn\.discordapp\.com\/[^\s]+\.(?:png|jpe?g|gif)(\?[^\s]+)?$/i;
export function ChatPanel({ messages }) {
  const containerRef = useRef(null);

  // Scroll automatique en bas
  useEffect(() => {
    const c = containerRef.current;
    if (c) c.scrollTop = c.scrollHeight;
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
      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: '0.5rem' }}>
          <span style={{ color: '#555', fontSize: '0.8rem' }}>
            [{m.timestamp.toLocaleTimeString()}]
          </span>{' '}
          <div>
            {/*
              On découpe le contenu sur chaque URL,
              puis on rerenderise chaque "part":
              - Tenor → <TenorGif>
              - Discord CDN → <img>
              - Sinon → texte brut
            */}
            {m.content.split(URL_REGEX).map((part, idx) => {
              if (TENOR_REGEX.test(part)) {
                return <TenorGif key={idx} url={part} height={200} />;
              }
              if (DISCORD_IMG_REGEX.test(part)) {
                return (
                  <img
                    key={idx}
                    src={part}
                    alt="shared"
                    style={{ maxWidth: '100%', maxHeight: 200, display: 'block', margin: '0.5rem 0' }}
                  />
                );
              }
              return <span key={idx}>{part}</span>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
