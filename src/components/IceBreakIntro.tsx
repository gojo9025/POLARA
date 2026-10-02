'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, Snowflake, ArrowRight } from 'lucide-react';
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
  const [crackStage, setCrackStage] = useState(0); // 0: resting, 1: cracking, 2: shattered
  const [shards, setShards] = useState<Shard[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Check if intro has already been shown in this session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('polara_ice_break_seen');
    if (!hasSeenIntro) {
      setIsVisible(true);
      // Prevent background scrolling while intro is active
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

  // Web Audio procedural glacial sound effects
  const playIceSound = (type: 'creak' | 'crack' | 'shatter') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'creak') {
        // Deep low frequency groan
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

        // Low-pass filter for icy thickness
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
      } else if (type === 'crack') {
        // Sharp high-pitch snap + noise burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'shatter') {
        // Massive explosive ice burst: Sub-bass boom + crystalline harmonic clatter
        // Sub bass boom
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

        // High crystalline ice crystal pings (12 rapid micro-tones)
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
      // Audio context might be restricted before interaction; fail gracefully
    }
  };

  // Generate randomized polygon crystalline shards for the shattering explosion
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

      // Unique irregular polygon clip-paths for authentic ice crystals
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
    setCrackStage(1);

    // Audio cue: Stage 1 Ice creaking and initial fracture
    playIceSound('creak');
    setTimeout(() => {
      playIceSound('crack');
    }, 280);

    // Stage 2: Cataclysmic shatter!
    setTimeout(() => {
      setCrackStage(2);
      generateShards();
      playIceSound('shatter');

      // Dismiss after animation finishes
      setTimeout(() => {
        sessionStorage.setItem('polara_ice_break_seen', 'true');
        setIsVisible(false);
        document.body.style.overflow = '';
      }, 1300);
    }, 600);
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

        {/* Center Main Stage: Majestic Polar Bear Breaking Through Ice */}
        <div className="ice-break-centerpiece">
          <div className={`polar-break-frame ${crackStage >= 2 ? 'shattered' : ''}`}>
            {/* Real 8K Polar Bear Bursting Through Ice */}
            <img
              src="/images/polar-bear-break.jpg"
              alt="Colossal Polar Bear shattering through crystalline iceberg"
              className="polar-break-img"
            />

            {/* Glowing Glacial Fracture Lines (SVG) */}
            <svg
              className={`ice-crack-svg ${crackStage >= 1 ? 'crack-active' : ''}`}
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              {/* Primary fissure paths radiating from the polar bear's impact point */}
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
              {/* Lateral fracture branches */}
              <path
                d="M 460,380 L 380,390 L 310,360 L 220,340"
                className="fissure secondary"
              />
              <path
                d="M 580,390 L 680,410 L 770,390 L 880,420"
                className="fissure secondary"
              />
              <path
                d="M 390,560 L 340,650 L 310,740 L 240,820"
                className="fissure secondary"
              />
              <path
                d="M 610,570 L 680,680 L 740,780 L 830,850"
                className="fissure secondary"
              />
              {/* Core impact circle */}
              <circle cx="500" cy="500" r="140" className="impact-circle" />
            </svg>

            {/* Shockwave Energy Flash */}
            {crackStage >= 2 && <div className="ice-shockwave-flash" />}
          </div>

          {/* Flying Physical Ice Shards during shatter */}
          {crackStage >= 2 && (
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
              ARCTIC GLACIAL THRESHOLD
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
            A real-time gateway into India&apos;s 44 polar expeditions, satellite telemetry,
            and ocean acoustic science. Break the surface to enter POLARA.
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
                <span>{isBreaking ? 'SHATTERING GLACIAL ICE...' : 'BREAK ICE & ENTER POLARA'}</span>
                <ArrowRight size={18} />
              </div>
            </button>

            {/* Sound Toggle Pill */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="sound-toggle-btn"
              title={soundEnabled ? 'Mute Ice Sound FX' : 'Enable Ice Sound FX'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{soundEnabled ? 'Glacial SFX: ON' : 'SFX: OFF'}</span>
            </button>

            {/* Fast Skip Option */}
            <button onClick={handleSkip} className="skip-btn">
              Skip Intro
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
