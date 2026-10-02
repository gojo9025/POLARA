'use client';

import React from 'react';

export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      color: '#e8ecf4',
    }}>
      <div style={{
        position: 'relative',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        border: '1px solid rgba(56, 182, 230, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(56, 182, 230, 0.15)',
      }}>
        {/* Radar ring */}
        <div style={{
          position: 'absolute',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '1px dashed rgba(56, 182, 230, 0.25)',
        }} />

        {/* Radar sweep */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '45px',
          height: '45px',
          transformOrigin: '0 0',
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(56, 182, 230, 0.5) 60deg, transparent 65deg)',
          animation: 'radar-sweep 2.5s linear infinite',
        }} />

        {/* Center node */}
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--ice-400)',
          boxShadow: '0 0 10px var(--ice-400)',
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--ice-400)',
          marginBottom: '4px',
        }}>
          NCPOR TELEMETRY SYNC
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          Retrieving polar satellite observations & research dossiers...
        </div>
      </div>
    </div>
  );
}
