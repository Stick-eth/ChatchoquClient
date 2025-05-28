import React from 'react';

export function ChatPanel({ messages }) {
  return (
    <div
      style={{
        flex: 2,
        border: '1px solid #ccc',
        padding: '1rem',
        height: '300px',
        overflowY: 'auto'
      }}
    >
      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: '0.5rem' }}>
          <span style={{ color: '#555', fontSize: '0.8rem' }}>
            [{m.timestamp.toLocaleTimeString()}]
          </span>{' '}
          <span>{m.content}</span>
        </div>
      ))}
    </div>
  );
}
