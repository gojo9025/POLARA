'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Maximize, FileText, Check, Download, Video as VideoIcon } from 'lucide-react';
import { Video } from '@/lib/types';
import { useToast } from '@/lib/toast';

interface VideoPlayerProps {
  video: Video;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { info, success } = useToast();

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
        info('Video Playback Notice', 'Loading streaming stream or fallback format.');
      });
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div style={{
      background: 'var(--navy-900)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
    }}>
      {/* Video Container */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
        <video
          ref={videoRef}
          poster={video.thumbnailUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="metadata"
        >
          {video.videoUrl && <source src={video.videoUrl} type="video/webm" />}
          {video.fallbackUrl && <source src={video.fallbackUrl} type="video/mp4" />}
          Your browser does not support HTML5 video playback.
        </video>

        {!isPlaying && (
          <div
            onClick={togglePlay}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.35)',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--ice-400), var(--aurora-400))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 8px 24px rgba(30, 62, 98, 0.5)',
            }}>
              <Play size={28} style={{ marginLeft: '4px' }} />
            </div>
          </div>
        )}
      </div>

      {/* Video Details & Meta */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
              <span className="badge badge-warm" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <VideoIcon size={12} /> Polar Footage
              </span>
              <span className="badge badge-ice" style={{ fontSize: '0.7rem' }}>
                {video.region}
              </span>
              {video.duration && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Duration: {video.duration}
                </span>
              )}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{video.title}</h3>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {video.transcript && (
              <button
                className={`btn btn-sm ${showTranscript ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowTranscript(!showTranscript)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <FileText size={14} /> Transcript
              </button>
            )}
          </div>
        </div>

        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
          {video.description}
        </p>

        {showTranscript && video.transcript && (
          <div style={{
            marginTop: '16px',
            padding: '14px 16px',
            borderRadius: '10px',
            background: 'var(--navy-850)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--ice-300)', display: 'block', marginBottom: '4px' }}>Scientific Video Transcript:</strong>
            {video.transcript}
          </div>
        )}
      </div>
    </div>
  );
}
