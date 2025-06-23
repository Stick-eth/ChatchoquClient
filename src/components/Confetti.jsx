import React, { useEffect, useState } from 'react';

export function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) return;
    const newPieces = Array.from({ length: 40 }).map(() => ({
      left: Math.random() * 100,
      bg: `hsl(${Math.random() * 360},100%,50%)`,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 3,
    }));
    setPieces(newPieces);
  }, [active]);

  if (!active) return null;

  return (
    <div className="confetti-container">
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
