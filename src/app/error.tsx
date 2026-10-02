'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log telemetry error in console
    console.error('POLARA Telemetry Exception:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, rgba(14, 21, 41, 0.95) 0%, rgba(4, 8, 16, 0.98) 100%)',
      padding: '24px',
      color: '#e8ecf4',
    }}>
      <div style={{
        maxWidth: '480px',
        textAlign: 'center',
        background: 'rgba(10, 15, 30, 0.9)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '24px',
        padding: '48px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(239, 68, 68, 0.1)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#ef4444',
        }}>
          <AlertOctagon size={32} />
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          color: '#f87171',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          SYSTEM TELEMETRY FAULT
        </div>

        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '12px',
        }}>
          Cryosphere Link Interrupted
        </h2>

        <p style={{
          fontSize: '0.875rem',
          color: '#9ca8c4',
          lineHeight: 1.6,
          marginBottom: '28px',
        }}>
          An unexpected computational error occurred while synchronizing polar observations. Our automated recovery routines can reinitialize the session.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RotateCcw size={16} /> Reinitialize System
          </button>
          <Link
            href="/"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Home size={16} /> Basecamp
          </Link>
        </div>
      </div>
    </div>
  );
}
