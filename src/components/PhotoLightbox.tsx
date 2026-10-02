'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Camera, MapPin, Calendar, Shield, ExternalLink } from 'lucide-react';
import { Photograph } from '@/lib/types';
import { useToast } from '@/lib/toast';

interface PhotoLightboxProps {
  photos: Photograph[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const { success } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % photos.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  if (!isOpen || photos.length === 0) return null;

  const current = photos[currentIndex];

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = current.highResUrl || current.imageUrl || '';
    a.download = `polara-${current.id}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
    success('Download Started', `Downloading high-res photo: ${current.title}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 11, 20, 0.95)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--ice-400)', fontWeight: 600 }}>
            {currentIndex + 1} of {photos.length}
          </span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{current.title}</h3>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
            <Download size={14} /> Download High-Res
          </button>
          <button
            className="btn-icon"
            onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {photos.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex - 1 + photos.length) % photos.length)}
            style={{
              position: 'absolute',
              left: '24px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <img
          src={current.highResUrl || current.imageUrl}
          alt={current.title}
          style={{
            maxWidth: '90%',
            maxHeight: '75vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}
        />

        {photos.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex + 1) % photos.length)}
            style={{
              position: 'absolute',
              right: '24px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
            }}
            aria-label="Next photo"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div
        style={{
          padding: '16px 24px',
          background: 'rgba(9, 18, 32, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ maxWidth: '650px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
            {current.description}
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="var(--ice-400)" /> {current.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} color="var(--aurora-400)" /> {current.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Camera size={13} color="var(--cyan-400)" /> {current.photographer}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: 'var(--aurora-400)' }}>
            <Shield size={12} /> {current.copyright}
          </span>
          <span>Archived under POLARA Scientific Open License</span>
        </div>
      </div>
    </div>
  );
}
