import React, { useEffect, useState } from 'react';

const PIECE_COUNT = 80;

export function Confetti({ active, style }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) return;
    const newPieces = Array.from({ length: PIECE_COUNT }).map(() => ({
      left: Math.random() * 100,
      bg: `hsl(${Math.random() * 360},100%,50%)`,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 3,
    }));
    setPieces(newPieces);
  }, [active]);

  if (!active) return null;

  return (
    <div className="confetti-container" style={style}>
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.bg,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
