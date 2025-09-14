import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Confetti } from './Confetti';
import html2canvas from 'html2canvas';
import logo from '../assets/logo/transparent_logo.png';
import { serverUrl } from '../socket';

// Regex partagées (hors composant pour éviter les deps dans useEffect)
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const TENOR_REGEX = /^https?:\/\/tenor\.com\/view\/[^\s]+$/i;
const DISCORD_IMG_REGEX = /^https?:\/\/cdn\.discordapp\.com\/[^\s]+\.(?:png|jpe?g|gif)(\?[^\s]+)?$/i;

export function RoundSummaryOverlay({ visible, author, scores, proposals = {}, roundPoints = {}, myPseudo, messages = [] }) {
  const shareRef = useRef(null);
  const [copyState, setCopyState] = useState('idle'); // idle | copying | done | error
  // Messages de la manche au format texte simple
  const roundTexts = useMemo(() => (messages || []).map(m => (m?.content ?? '').toString()).filter(Boolean), [messages]);
  const players = Object.keys(scores);

  // --- Helpers ---
  function hashCode(str) {
    let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const toHex = (n) => (Math.round((n + m) * 255).toString(16).padStart(2, '0'));
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  function generateAvatarDataUrl(name = 'User', size = 72) {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const hue = hashCode(name) % 360;
    const bg = hslToHex(hue, 65, 55);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size);
    // border white
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, size - 4, size - 4);
    // initials
    const initials = (name || 'U').toString().trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('') || 'U';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(size * 0.42)}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2 + 2);
    return canvas.toDataURL('image/png');
  }

  // Tenor oEmbed thumbnails cache
  const [tenorThumbs, setTenorThumbs] = useState({}); // url -> thumb url
  useEffect(() => {
    let cancelled = false;
    const tenorUrls = new Set();
    (messages || []).forEach(m => {
      const content = (m?.content ?? '').toString();
      content.split(URL_REGEX).forEach(part => {
        if (TENOR_REGEX.test(part)) tenorUrls.add(part);
      });
    });
    if (tenorUrls.size === 0) return;
    (async () => {
      const updates = {};
      for (const u of tenorUrls) {
        try {
          const resp = await fetch(`https://tenor.com/oembed?url=${encodeURIComponent(u)}`);
          if (!resp.ok) continue;
          const data = await resp.json();
          const thumb = data?.thumbnail_url || data?.url;
          if (thumb) updates[u] = thumb;
  } catch { /* ignore */ }
      }
      if (!cancelled && Object.keys(updates).length) setTenorThumbs(prev => ({ ...prev, ...updates }));
    })();
    return () => { cancelled = true; };
  }, [messages]);

  // Tous les hooks doivent être appelés avant tout early return
  if (!visible) return null;

  async function copyShareImage() {
    if (!shareRef.current) return;
    try {
      setCopyState('copying');
      // Assurer que l'élément est réellement dans le flux (pas display:none)
      const node = shareRef.current;
      const prev = {
        position: node.style.position,
        left: node.style.left,
        top: node.style.top,
        opacity: node.style.opacity,
        zIndex: node.style.zIndex,
        visibility: node.style.visibility,
      };
      // Le rendre hors écran mais mesurable
      node.style.position = 'absolute';
      node.style.left = '-9999px';
      node.style.top = '0px';
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.zIndex = '-1';

      // Attendre que les images soient chargées
      const waitForImagesLoad = (root, timeoutMs = 2500) => new Promise((resolve) => {
        const imgs = Array.from(root.querySelectorAll('img'));
        if (imgs.length === 0) return resolve();
        let done = 0; let settled = false;
        const check = () => { if (!settled && ++done >= imgs.length) { settled = true; resolve(); } };
        setTimeout(() => { if (!settled) { settled = true; resolve(); } }, timeoutMs);
        imgs.forEach(img => {
          if (img.complete) return check();
          img.addEventListener('load', check, { once: true });
          img.addEventListener('error', check, { once: true });
        });
      });
      await waitForImagesLoad(node, 2500);

      // Capturer avec html2canvas
      const canvas = await html2canvas(node, {
        backgroundColor: '#5663f7',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (doc) => {
          // Forcer les images avatars à se charger dans le clone
          const imgs = doc.querySelectorAll('img');
          imgs.forEach((img) => {
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';
          });
        },
      });

      // Restaurer styles
      node.style.position = prev.position;
      node.style.left = prev.left;
      node.style.top = prev.top;
      node.style.opacity = prev.opacity;
      node.style.zIndex = prev.zIndex;
      node.style.visibility = prev.visibility;

      let dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
        setCopyState('done');
        setTimeout(() => setCopyState('idle'), 1600);
        return;
      }

      // Fallback téléchargement
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'chatchoq-round.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setCopyState('idle');
    } catch (e) {
      console.error('copyShareImage error', e);
      // Fallback: retirer images externes et réessayer une fois
      try {
        const node = shareRef.current;
        if (node) {
          node.querySelectorAll('img[data-external-img="1"]').forEach((img) => {
            const ph = document.createElement('div');
            ph.style.width = img.width + 'px';
            ph.style.height = img.height + 'px';
            ph.style.background = '#f3f4f6';
            ph.style.border = '2px solid #e5e7eb';
            ph.style.boxShadow = '0 4px 0 #d1d5db';
            ph.style.display = 'inline-block';
            ph.style.verticalAlign = 'middle';
            ph.textContent = 'Image';
            img.replaceWith(ph);
          });
          const canvas = await html2canvas(node, { backgroundColor: '#5663f7', scale: 2, useCORS: true, logging: false, allowTaint: true });
          const dataUrl = canvas.toDataURL('image/png');
          const blob = await (await fetch(dataUrl)).blob();
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
            setCopyState('done');
            setTimeout(() => setCopyState('idle'), 1600);
            return;
          }
          const a = document.createElement('a');
          a.href = dataUrl; a.download = 'chatchoq-round.png';
          document.body.appendChild(a); a.click(); a.remove();
          setCopyState('idle');
          return;
        }
      } catch (e2) {
        console.error('fallback capture failed', e2);
      }
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ position: 'relative' }}>
        {/* Bouton de capture en haut à droite */}
        <button
          onClick={copyShareImage}
          className="share-copy-btn"
          aria-label="Copier l'image de la manche"
          title="Copier l'image de la manche"
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
        >
          {copyState === 'copying' ? '⏳' : copyState === 'done' ? '✅ Copié' : '📸 Partager'}
        </button>

        <img
          src={`/pfp/${author}.png`}
          alt={author}
          className="round-author-img"
        />
        <h2>L'auteur était {author}</h2>
        <h3>Guesses des joueurs</h3>
        <div className="guesses-grid">
          {players.map((p) => {
            const guess = proposals[p]?.guess;
            const correct = guess === author;
            const points = roundPoints[p] ?? 0;
            return (
              <div key={p} className="guess-card">
                <div className={`guess-sticker ${correct ? 'correct' : 'wrong'}`}>
                  {correct ? '✅' : '❌'} {guess || '—'}
                </div>
                <div className="guess-meta">
                  <strong>{p}{p === myPseudo ? ' (Moi)' : ''}</strong>
                  <small>{points ? `+${points} pts` : '0 pt'}</small>
                </div>
                <Confetti active={correct && p === myPseudo} />
              </div>
            );
          })}
        </div>

        {/* Carte dédiée à la capture (rendue hors écran) */}
        <div
          ref={shareRef}
          className="share-card"
          aria-hidden
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: 900,
            height: 1200,
            padding: 36,
            boxSizing: 'border-box',
            borderRadius: 0,
            border: '3px solid #e5e7eb',
            background: 'linear-gradient(180deg,#5663f7 0%, #414abb 100%)',
            color: 'white',
            fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflow: 'hidden',
          }}
        >
          {/* Header: logo + titre h1 (style in-game) + badge auteur à droite */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
              <img src={'/logo/transparent_logo.png'} alt="TerraGuessr" style={{ width: 96, height: 96, objectFit: 'contain', imageRendering: 'pixelated' }} onError={(e) => { e.currentTarget.src = logo; }} />
              <div style={{
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: "'Press Start 2P', Inter, Arial, sans-serif",
                fontSize: 44,
                lineHeight: 1.1,
                textShadow: '0 1px 0 rgba(255,255,255,0.35), 0 3px 0 rgba(0,0,0,0.28)',
              }}>TerraGuessr</div>
            </div>
            {/* En-tête: pas de badge auteur ici désormais (déplacé plus bas) */}
            <div />
          </div>

          {/* Zone messages */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, minHeight: 0 }}>
            <div style={{ margin: 0, fontFamily: "'Press Start 2P', Inter, Arial, sans-serif", fontSize: 18 }}>Messages du round</div>
            <div style={{
              flex: 1,
              minHeight: 0,
              background: '#ffffff',
              border: '3px solid #e5e7eb',
              padding: 16,
              boxShadow: '0 4px 0 #d1d5db',
              color: '#2f3441',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              overflow: 'hidden',
            }}>
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {roundTexts.length === 0 && (
                  <div style={{ opacity: 0.6, fontStyle: 'italic' }}>Aucun message</div>
                )}
                {roundTexts.map((t, i) => (
                  <div key={i} style={{ display: 'flex' }}>
                    <div style={{
                      background: '#ffffff',
                      color: '#111827',
                      border: '2px solid #e5e7eb',
                      borderRadius: 0,
                      padding: '8px 12px',
                      maxWidth: '90%',
                      boxShadow: '0 4px 0 #d1d5db, 0 6px 12px rgba(0,0,0,0.12)',
                      lineHeight: 1.35,
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      fontSize: 18,
                      textAlign: 'left',
                    }}>
                      {t.split(URL_REGEX).map((part, idx) => {
                        if (TENOR_REGEX.test(part)) {
                          const thumb = tenorThumbs[part];
                          if (thumb) {
                            return (
                              <img
                                key={idx}
                                src={`${serverUrl}/img-proxy?url=${encodeURIComponent(thumb)}`}
                                alt="GIF"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                data-external-img="1"
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  maxWidth: 560,
                                  height: 220,
                                  objectFit: 'cover',
                                  margin: '8px 0',
                                  background: '#f3f4f6',
                                  border: '2px solid #e5e7eb',
                                  boxShadow: '0 4px 0 #d1d5db',
                                }}
                              />
                            );
                          }
                          return (
                            <div key={idx} style={{
                              background: '#f3f4f6',
                              border: '2px solid #e5e7eb',
                              boxShadow: '0 4px 0 #d1d5db',
                              width: '100%',
                              maxWidth: 560,
                              height: 220,
                              margin: '8px 0',
                              color: '#6b7280',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontStyle: 'italic'
                            }}>Chargement du GIF…</div>
                          );
                        }
                        if (DISCORD_IMG_REGEX.test(part)) {
                          return (
                            <img
                              key={idx}
                              src={`${serverUrl}/img-proxy?url=${encodeURIComponent(part)}`}
                              alt="Image"
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              data-external-img="1"
                              style={{
                                display: 'block',
                                width: '100%',
                                maxWidth: 560,
                                height: 220,
                                objectFit: 'cover',
                                margin: '8px 0',
                                background: '#f3f4f6',
                                border: '2px solid #e5e7eb',
                                boxShadow: '0 4px 0 #d1d5db',
                              }}
                            />
                          );
                        }
                        return <span key={idx}>{part}</span>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section Auteur centrée */}
          <div style={{ marginTop: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <img
              src={`/pfp/${author}.png`}
              alt={author}
              style={{ width: 72, height: 72, objectFit: 'cover', imageRendering: 'pixelated', border: '3px solid #e5e7eb' }}
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.dataset.fallback) {
                  el.dataset.fallback = '1';
                  el.src = generateAvatarDataUrl(author || 'Auteur', 72);
                }
              }}
            />
            <div style={{ fontFamily: "'Press Start 2P', Inter, Arial, sans-serif", fontSize: 20 }}>Auteur: <strong>{author}</strong></div>
          </div>

          {/* Liste joueurs en pied */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginTop: 12 }}>
            {players.map((p) => {
              const guess = proposals[p]?.guess;
              const correct = guess === author;
              const points = roundPoints[p] ?? 0;
              return (
                <div key={p} style={{ position: 'relative', border: '3px solid #e5e7eb', background: '#f7f8fb', padding: '12px', boxShadow: '0 4px 0 #d1d5db' }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    top: 0,
                    right: 0,
                    transform: 'rotate(1.5deg)',
                    padding: '6px 10px',
                    border: '3px solid',
                    borderColor: correct ? '#16a34a' : '#ef4444',
                    background: correct ? 'rgba(22,163,74,0.16)' : 'rgba(239,68,68,0.15)',
                    color: correct ? '#14532d' : '#7f1d1d',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: '0 4px 0 #d1d5db'
                  }}>
                    {correct ? '✅' : '❌'} {guess || '—'}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#2f3441' }}>{p}{p === myPseudo ? ' (Moi)' : ''}</strong>
                    <small style={{ color: '#6b7280' }}>{points ? `+${points} pts` : '0 pt'}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

