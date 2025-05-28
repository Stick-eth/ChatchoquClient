// src/components/TenorGif.jsx
import React from 'react';

export function TenorGif({ url, width = '100%', height = 300 }) {
  // https://tenor.com/view/foo-bar-25591052 → postId = 25591052
  const postId = url.split('/').pop().split('-').pop();
  const src = `https://tenor.com/embed/${postId}`;
  return (
    <iframe
      src={src}
      title={`gif-tenor-${postId}`}
      width={width}
      height={height}
      frameBorder="0"
      allowFullScreen
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}
