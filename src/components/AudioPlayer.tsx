'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Disc, Sparkles, Waves } from 'lucide-react';
import { AudioRecording } from '@/lib/types';
import { useToast } from '@/lib/toast';

interface AudioPlayerProps {
  recording: AudioRecording;
  autoPlay?: boolean;
}

export default function AudioPlayer({ recording, autoPlay = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<Array<AudioNode>>([]);
  const animFrameRef = useRef<number | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { info, success } = useToast();

  const isSynthetic = recording.audioUrl.startsWith('web-audio-synth://');

  // Web Audio Synthetic Sound generator
  const startSyntheticAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      synthNodesRef.current.forEach(n => {
        try { (n as AudioScheduledSourceNode).stop?.(); n.disconnect(); } catch {}
      });
      synthNodesRef.current = [];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);
      synthNodesRef.current.push(masterGain);

      const type = recording.audioUrl.replace('web-audio-synth://', '');

      if (type === 'weddell-seal') {
        // Eerie sci-fi downward frequency chirp sweeps
        const playChirp = () => {
          if (!isPlaying && synthNodesRef.current.length === 0) return;
          const osc = ctx.createOscillator();
          const sweepGain = ctx.createGain();
          
          osc.type = 'sine';
          const now = ctx.currentTime;
          osc.frequency.setValueAtTime(1400 + Math.random() * 800, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 1.2);

          sweepGain.gain.setValueAtTime(0.01, now);
          sweepGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
          sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          osc.connect(sweepGain);
          sweepGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 1.3);
        };

        playChirp();
        synthIntervalRef.current = setInterval(playChirp, 2400);
      } else if (type === 'glacier-fizz') {
        // Glacier ice fizz crackles & low-frequency calving boom
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.94 ? 0.8 : 0.05);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, ctx.currentTime);
        filter.Q.setValueAtTime(3.0, ctx.currentTime);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        synthNodesRef.current.push(noise, filter);
      } else {
        // Polar howling winds
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const windSource = ctx.createBufferSource();
        windSource.buffer = buffer;
        windSource.loop = true;

        const lowPass = ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.setValueAtTime(260, ctx.currentTime);

        windSource.connect(lowPass);
        lowPass.connect(masterGain);
        windSource.start();
        synthNodesRef.current.push(windSource, lowPass);
      }

      setIsSynthesizing(true);
    } catch (e) {
      console.warn('Web Audio synthesis not supported:', e);
    }
  }, [isMuted, volume, isPlaying, recording.audioUrl]);

  const stopSyntheticAudio = useCallback(() => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    synthNodesRef.current.forEach(node => {
      try {
        (node as AudioScheduledSourceNode).stop?.();
        node.disconnect();
      } catch {}
    });
    synthNodesRef.current = [];
    setIsSynthesizing(false);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      stopSyntheticAudio();
      setIsPlaying(false);
    } else {
      if (isSynthetic) {
        setIsPlaying(true);
        startSyntheticAudio();
        info('Acoustic Synthesis Active', `Generating live hydrophone telemetry for ${recording.title}`);
      } else if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn('Audio play failed, switching to acoustic synthesis:', err);
          setIsPlaying(true);
          startSyntheticAudio();
          info('Playing Hydrophone Acoustic Emulation', recording.title);
        });
      }
    }
  };

  useEffect(() => {
    if (isSynthetic && isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(t => {
          if (t >= 60) return 0;
          return t + 0.5;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isSynthetic, isPlaying]);

  useEffect(() => {
    return () => {
      stopSyntheticAudio();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stopSyntheticAudio]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSynthetic) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isSynthetic) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current && !isSynthetic) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (!isSynthetic) {
      const a = document.createElement('a');
      a.href = recording.audioUrl;
      a.download = `polara-${recording.id}-acoustic.mp3`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
      success('Audio Download Started', recording.title);
    } else {
      info('Synthetic Hydrophone Signal', 'Real-time telemetry stream generated via Web Audio API.');
    }
  };

  return (
    <div style={{
      background: 'var(--navy-900)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
    }}>
      {!isSynthetic && (
        <audio
          ref={audioRef}
          src={recording.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
      )}

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Waves size={12} /> Hydrophone Audio
            </span>
            <span className="badge badge-ice" style={{ fontSize: '0.7rem' }}>
              {recording.region}
            </span>
          </div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{recording.title}</h4>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            Source: {recording.source} • {recording.duration}
          </span>
        </div>

        <button
          className="btn-icon"
          onClick={downloadAudio}
          title="Download audio stream"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Download size={16} />
        </button>
      </div>

      {/* Animated Waveform Visualizer */}
      <div style={{
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        background: 'rgba(56, 182, 230, 0.04)',
        borderRadius: '8px',
        padding: '0 12px',
        marginBottom: '16px',
        border: '1px solid rgba(56, 182, 230, 0.1)',
      }}>
        {Array.from({ length: 32 }).map((_, idx) => {
          const height = isPlaying
            ? Math.max(12, Math.sin(idx * 0.4 + currentTime * 3) * 22 + 20)
            : 6 + (idx % 5) * 4;

          return (
            <div
              key={idx}
              style={{
                width: '4px',
                height: `${height}px`,
                background: isPlaying ? 'var(--ice-400)' : 'rgba(56, 182, 230, 0.25)',
                borderRadius: '2px',
                transition: 'height 0.1s ease',
              }}
            />
          );
        })}
      </div>

      {/* Scrubber & Timers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-tertiary)', width: '36px' }}>
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || (isSynthetic ? 60 : 100)}
          value={currentTime}
          onChange={handleSeek}
          style={{
            flex: 1,
            accentColor: 'var(--ice-400)',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-tertiary)', width: '36px', textAlign: 'right' }}>
          {recording.duration}
        </span>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={togglePlay}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ice-400), var(--cyan-500))',
            border: 'none',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(56, 182, 230, 0.4)',
            transition: 'transform 0.15s ease',
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
        </button>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleMute}
            className="btn-icon"
            style={{ padding: 0, border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: '70px', accentColor: 'var(--ice-400)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Scientific Notes */}
      {recording.scientificNotes && (
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
        }}>
          <strong style={{ color: 'var(--ice-300)' }}>Acoustic Context: </strong>
          {recording.scientificNotes}
          {recording.frequencyRange && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              <span>Frequency: {recording.frequencyRange}</span>
              {recording.samplingRate && <span>Sampling: {recording.samplingRate}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
