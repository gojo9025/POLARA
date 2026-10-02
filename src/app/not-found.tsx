'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, AlertTriangle, ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, rgba(14, 21, 41, 0.9) 0%, rgba(4, 8, 16, 0.98) 100%)',
      padding: '24px',
      color: '#e8ecf4',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background ambient radar rings */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        border: '1px dashed rgba(56, 182, 230, 0.15)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        border: '1px solid rgba(56, 182, 230, 0.1)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '520px',
        textAlign: 'center',
        background: 'rgba(10, 15, 30, 0.85)',
        border: '1px solid rgba(56, 182, 230, 0.25)',
        borderRadius: '24px',
        padding: '48px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(56, 182, 230, 0.12)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#f87171',
        }}>
          <AlertTriangle size={32} />
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          color: '#5cc9ef',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          TELEMETRY ERROR • 404
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}>
          Coordinates Out of Bounds
        </h1>

        <p style={{
          fontSize: '0.9375rem',
          color: '#9ca8c4',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          The requested research waypoint, expedition log, or archive file does not exist on this telemetry frequency. The station sensor may be offline or relocated.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Home size={16} /> Return to Mission Base
          </Link>
          <Link
            href="/explore"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Search size={16} /> Search Observatory
          </Link>
        </div>
      </div>
    </div>
  );
}
