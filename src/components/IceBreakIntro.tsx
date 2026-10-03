'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, Snowflake, ArrowRight, Box, Image as ImageIcon } from 'lucide-react';
import IceBreak3DScene from './IceBreak3DScene';
import './IceBreakIntro.css';

interface Shard {
  id: number;
  clipPath: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  duration: number;
  delay: number;
}

export default function IceBreakIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | 'cinematic'>('3d');
  const [crackStage, setCrackStage] = useState(0); // 0: resting, 1: cracking, 2: shattered
  const [shards, setShards] = useState<Shard[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Check if intro has already been shown in this session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('polara_ice_break_seen');
    if (!hasSeenIntro) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    }

    const handleReplay = () => {
      setIsVisible(true);
      setIsBreaking(false);
      setCrackStage(0);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('replay-polar-intro', handleReplay);
    return () => {
      window.removeEventListener('replay-polar-intro', handleReplay);
      document.body.style.overflow = '';
    };
  }, []);

  // Web Audio procedural glacial sound effects for cinematic fallback mode
  const playIceSound = (type: 'creak' | 'crack' | 'shatter') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (type === 'creak') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'shatter') {
        const boomOsc = ctx.createOscillator();
        const boomGain = ctx.createGain();
        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(140, now);
        boomOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);
        boomGain.gain.setValueAtTime(0.7, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        boomOsc.connect(boomGain);
        boomGain.connect(ctx.destination);
        boomOsc.start(now);
        boomOsc.stop(now + 1.25);

        for (let i = 0; i < 12; i++) {
          const pingOsc = ctx.createOscillator();
          const pingGain = ctx.createGain();
          const pingDelay = now + 0.05 + Math.random() * 0.45;
          pingOsc.type = 'triangle';
          pingOsc.frequency.setValueAtTime(1800 + Math.random() * 3200, pingDelay);
          pingGain.gain.setValueAtTime(0.15, pingDelay);
          pingGain.gain.exponentialRampToValueAtTime(0.001, pingDelay + 0.35);

          pingOsc.connect(pingGain);
          pingGain.connect(ctx.destination);
          pingOsc.start(pingDelay);
          pingOsc.stop(pingDelay + 0.36);
        }
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const generateShards = () => {
    const list: Shard[] = [];
    const shardCount = 18;
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2;
      const dist = 350 + Math.random() * 450;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const rotate = (Math.random() - 0.5) * 280;
      const duration = 0.9 + Math.random() * 0.4;
      const delay = Math.random() * 0.15;

      const p1 = `${Math.floor(10 + Math.random() * 20)}% ${Math.floor(Math.random() * 20)}%`;
      const p2 = `${Math.floor(80 + Math.random() * 20)}% ${Math.floor(10 + Math.random() * 25)}%`;
      const p3 = `${Math.floor(75 + Math.random() * 25)}% ${Math.floor(75 + Math.random() * 25)}%`;
      const p4 = `${Math.floor(Math.random() * 25)}% ${Math.floor(80 + Math.random() * 20)}%`;
      const clip = `polygon(${p1}, ${p2}, ${p3}, ${p4})`;

      list.push({
        id: i,
        clipPath: clip,
        x,
        y,
        rotate,
        scale: 0.3 + Math.random() * 0.7,
        duration,
        delay,
      });
    }
    setShards(list);
  };

  const handleBreakIce = () => {
    if (isBreaking) return;
    setIsBreaking(true);

    if (viewMode === '3d') {
      // The 3D scene handles the physical animation and calls onBreakComplete
      setCrackStage(1);
    } else {
      // 2D Cinematic Fallback animation
      setCrackStage(1);
      playIceSound('creak');
      setTimeout(() => {
        setCrackStage(2);
        generateShards();
        playIceSound('shatter');
        setTimeout(() => {
          handleBreakFinished();
        }, 1300);
      }, 550);
    }
  };

  const handleBreakFinished = () => {
    sessionStorage.setItem('polara_ice_break_seen', 'true');
    setIsVisible(false);
    document.body.style.overflow = '';
  };

  const handleSkip = () => {
    sessionStorage.setItem('polara_ice_break_seen', 'true');
    setIsVisible(false);
    document.body.style.overflow = '';
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className={`ice-break-portal ${isBreaking ? 'portal-breaking' : ''}`}>
        {/* Background Glacial Canvas */}
        <div className="ice-break-backdrop">
          <div className="ice-break-aurora" />
          <div className="ice-break-vignette" />
        </div>

        {/* Crystalline Frost Layer Overlays */}
        <div className={`frost-overlay ${crackStage >= 1 ? 'frost-fractured' : ''}`} />

        {/* Mode Switcher Pill */}
        <div className="intro-mode-switcher">
          <button
            className={`mode-btn ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => setViewMode('3d')}
            disabled={isBreaking}
            title="Interactive 3D WebGL Simulation"
          >
            <Box size={14} />
            <span>3D WebGL Animation</span>
            <span className="mode-chip">Three.js</span>
          </button>
          <button
            className={`mode-btn ${viewMode === 'cinematic' ? 'active' : ''}`}
            onClick={() => setViewMode('cinematic')}
            disabled={isBreaking}
            title="8K National Geographic High-Res Visual"
          >
            <ImageIcon size={14} />
            <span>8K Photo Mode</span>
          </button>
        </div>

        {/* Center Main Stage: 3D Animation or 8K Photo */}
        <div className="ice-break-centerpiece">
          <div className={`polar-break-frame ${crackStage >= 2 ? 'shattered' : ''}`}>
            {viewMode === '3d' ? (
              /* Real 3D Polar Bear Breaking Through 3D Ice Wall (Three.js) */
              <IceBreak3DScene
                isBreaking={isBreaking}
                onBreakComplete={handleBreakFinished}
                soundEnabled={soundEnabled}
              />
            ) : (
              /* 8K Photorealistic Glacial Break */
              <>
                <img
                  src="/images/polar-bear-break.jpg"
                  alt="Colossal Polar Bear shattering through crystalline iceberg"
                  className="polar-break-img"
                />

                <svg
                  className={`ice-crack-svg ${crackStage >= 1 ? 'crack-active' : ''}`}
                  viewBox="0 0 1000 1000"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 500,500 L 460,380 L 420,290 L 370,210 L 330,120 L 290,0"
                    className="fissure primary"
                  />
                  <path
                    d="M 500,500 L 580,390 L 640,310 L 730,220 L 810,130 L 920,30"
                    className="fissure primary"
                  />
                  <path
                    d="M 500,500 L 390,560 L 280,610 L 190,690 L 100,750 L 0,810"
                    className="fissure primary"
                  />
                  <path
                    d="M 500,500 L 610,570 L 710,630 L 820,720 L 910,800 L 1000,890"
                    className="fissure primary"
                  />
                  <path
                    d="M 460,380 L 380,390 L 310,360 L 220,340"
                    className="fissure secondary"
                  />
                  <path
                    d="M 580,390 L 680,410 L 770,390 L 880,420"
                    className="fissure secondary"
                  />
                  <circle cx="500" cy="500" r="140" className="impact-circle" />
                </svg>

                {crackStage >= 2 && <div className="ice-shockwave-flash" />}
              </>
            )}
          </div>

          {/* Flying Physical Ice Shards during 2D cinematic shatter */}
          {viewMode === 'cinematic' && crackStage >= 2 && (
            <div className="shards-container">
              {shards.map((s) => (
                <motion.div
                  key={s.id}
                  className="ice-shard"
                  style={{ clipPath: s.clipPath }}
                  initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: s.x,
                    y: s.y,
                    rotate: s.rotate,
                    scale: s.scale,
                    opacity: 0,
                  }}
                  transition={{
                    duration: s.duration,
                    delay: s.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Narrative & Interaction HUD: 21st.dev Style Capsule */}
        <div className={`ice-break-hud ${crackStage >= 2 ? 'hud-fading' : ''}`}>
          <div className="hud-header-capsule">
            <span className="hud-badge">
              <Snowflake size={14} className="hud-snowflake" />
              NCPOR POLAR ARCHIVE • CRYOSPHERE VAULT
            </span>
            <div className="hud-live-tag">
              <span className="live-dot" />
              SVALBARD 78°55′N • INDARC ONLINE
            </div>
          </div>

          <h1 className="hud-glacier-title">
            THE CRYOSPHERE AWAITS
          </h1>

          <p className="hud-glacier-subtitle">
            Official scientific gateway into India&apos;s 44 polar expeditions, IndARC subsurface ocean acoustics,
            and longitudinal cryospheric archives. Shatter the glacial threshold to enter POLARA.
          </p>

          <div className="hud-action-row">
            {/* 21st.dev Style Glowing Border-Beam Action Button */}
            <button
              onClick={handleBreakIce}
              disabled={isBreaking}
              className="break-ice-btn"
            >
              <div className="btn-border-beam" />
              <div className="btn-content">
                <Sparkles size={18} className="btn-icon-pulse" />
                <span>
                  {isBreaking
                    ? 'SHATTERING GLACIAL ICE WALL...'
                    : 'SHATTER ICE & ENTER POLARA'}
                </span>
                <ArrowRight size={18} />
              </div>
            </button>

            {/* Sound Toggle Pill */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="sound-toggle-btn"
              title={soundEnabled ? 'Mute Glacial Sound FX' : 'Enable Glacial Sound FX'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{soundEnabled ? 'Glacial SFX: ON' : 'SFX: OFF'}</span>
            </button>

            {/* Fast Skip Option */}
            <button onClick={handleSkip} className="skip-btn">
              Direct Access
            </button>
          </div>
        </div>

        {/* Bottom Ambient Coordinates */}
        <div className="ice-break-footer">
          <span>POLAR SCIENCE & OCEANOGRAPHIC RESEARCH VAULT</span>
          <span>LAT 79°01′N LON 11°32′E • FAST ICE DEPTH 192M</span>
        </div>
      </div>
    </AnimatePresence>
  );
}
