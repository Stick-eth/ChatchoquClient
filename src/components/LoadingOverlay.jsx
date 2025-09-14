import React from 'react';
import logo from '../assets/logo/transparent_logo.png';
import './LoadingOverlay.css';

/**
 * LoadingOverlay
 * Fullscreen overlay that animates in from bottom to top with a wavy top edge,
 * shows the transparent logo, then can animate out to the bottom.
 */
export default function LoadingOverlay({ visible, leaving = false }) {
  return (
    <div className="loading-overlay" aria-hidden={!visible && !leaving}>
      <div
        className={
          'panelWrap ' + (visible ? 'enter' : '') + (leaving ? ' leave' : '')
        }
      >
  <svg className="panel" viewBox="0 0 1200 1200" preserveAspectRatio="none" aria-hidden="true">
          {/**
           * The path draws a wavy top edge then a rectangle to the bottom of the viewport
           */}
          <path
            d="M0,120 C150,80 300,160 450,120 C600,80 750,160 900,120 C1050,80 1200,160 1200,160 L1200,1200 L0,1200 Z"
            fill="#414abb"
            stroke="#ffffff"
            strokeWidth="6"
          />
        </svg>
        <img src={logo} alt="Logo" className="loading-logo" />
      </div>
    </div>
  );
}
