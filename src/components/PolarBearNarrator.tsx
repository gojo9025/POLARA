'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Sparkles, Compass, Radio, ArrowRight,
  MessageCircle, BarChart3, Database, ShieldCheck, ChevronRight
} from 'lucide-react';
import './PolarBearNarrator.css';

interface StoryChapter {
  id: number;
  badge: string;
  title: string;
  speechText: string;
  quote: string;
  stats: { label: string; value: string }[];
  ctaLabel: string;
  ctaHref: string;
  ctaIcon: React.ReactNode;
  themeColor: string;
}

const chapters: StoryChapter[] = [
  {
    id: 1,
    badge: 'GUARDIAN OF THE CRYOSPHERE',
    title: 'Welcome to India\'s Polar Knowledge Vault',
    speechText:
      'I am the sentinel of the frozen frontier. You stand at POLARA — India’s sovereign open-access polar science ecosystem. Across four decades, our researchers have braved the planet\'s harshest extremes. Every expedition, ice core, and satellite observation is cataloged here for humanity.',
    quote: '"The polar ice is not barren wasteland; it is Earth\'s climate black box."',
    stats: [
      { label: 'Expeditions', value: '44 Traverses' },
      { label: 'Archived Assets', value: '1,420+ Records' },
      { label: 'Polar Regions', value: 'Arctic, Antarctic, Himalayas' },
    ],
    ctaLabel: 'Explore Knowledge Vault',
    ctaHref: '/explore',
    ctaIcon: <Database size={16} />,
    themeColor: '#1E3E62',
  },
  {
    id: 2,
    badge: '44 SCIENTIFIC EXPEDITIONS',
    title: 'From Maitri to Bharati & Himadri',
    speechText:
      'Look closely at the ice. 44 times, Indian scientific convoys have navigated the Roaring Forties into Queen Maud Land and the Larsemann Hills. From our first station Dakshin Gangotri to the modern year-round research stations Bharati, Maitri, and Himadri in Svalbard.',
    quote: '"Over 10,000 kilometers from the Indian mainland, scientific sovereignty stands firm."',
    stats: [
      { label: 'Active Stations', value: '3 Major Bases' },
      { label: 'Research Papers', value: '420+ Peer-Reviewed' },
      { label: 'Scientists Deployed', value: '2,600+ Explorers' },
    ],
    ctaLabel: 'View All 44 Expeditions',
    ctaHref: '/expeditions',
    ctaIcon: <Compass size={16} />,
    themeColor: '#FF6500',
  },
  {
    id: 3,
    badge: 'SUB-SURFACE HYDROPHONE ARRAY',
    title: 'IndARC: 192m Beneath the Arctic Fjords',
    speechText:
      'Listen to the deep. In Kongsfjorden, Svalbard, 192 meters underwater, India\'s IndARC subsurface mooring listens to the sea. Its acoustic hydrophones and sensor arrays record glacial calving, marine mammal migrations, and warm Atlantic current intrusion year-round.',
    quote: '"Acoustics reveal what satellites cannot see through the frozen ocean."',
    stats: [
      { label: 'Mooring Depth', value: '192 Meters' },
      { label: 'Sensor Array', value: 'CTD & ADCP Active' },
      { label: 'Acoustic Recordings', value: '180+ Hydrophone Tapes' },
    ],
    ctaLabel: 'Listen to Marine Audio',
    ctaHref: '/repository?type=Audio',
    ctaIcon: <Radio size={16} />,
    themeColor: '#1E3E62',
  },
  {
    id: 4,
    badge: 'EARTH OBSERVATION & SEA ICE',
    title: 'Real-Time Telemetry & Cryo-Dynamics',
    speechText:
      'The ice is alive. It expands to 18 million square kilometers each winter and retreats in summer. We track radar sea ice concentration, meteorological vectors, and atmospheric carbon flux in near real time across the high latitudes.',
    quote: '"A 1% shift in polar sea ice alters monsoon dynamics across South Asia."',
    stats: [
      { label: 'Station Telemetry', value: '4 Synchronized Feeds' },
      { label: 'Fast Ice Metrics', value: '1.84m Thickness' },
      { label: 'Update Cadence', value: '15-Min Intervals' },
    ],
    ctaLabel: 'Inspect Cryo-Datasets',
    ctaHref: '/explore?type=Dataset',
    ctaIcon: <BarChart3 size={16} />,
    themeColor: '#1E3E62',
  },
  {
    id: 5,
    badge: 'AI ORACLE • GEMINI POWERED',
    title: 'Ask POLARA: Neural Polar Intelligence',
    speechText:
      'Have a question about glacial mass balance, benthic biodiversity, or the Southern Ocean heat sink? Speak with my neural intelligence. Powered by Google Gemini and grounded in authentic polar publications, POLARA answers with academic precision.',
    quote: '"Bridging complex polar datasets with conversational intelligence."',
    stats: [
      { label: 'RAG Grounding', value: '100% Peer-Reviewed' },
      { label: 'Citation Engine', value: 'Direct Expeditions' },
      { label: 'Model Architecture', value: 'Gemini 2.5 Flash' },
    ],
    ctaLabel: 'Consult POLARA AI',
    ctaHref: '/ask',
    ctaIcon: <MessageCircle size={16} />,
    themeColor: '#FF6500',
  },
];

export default function PolarBearNarrator() {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeChapter = chapters[activeChapterIndex];

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Track active chapter on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      chapterRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const triggerPoint = window.innerHeight * 0.45;
        if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
          setActiveChapterIndex(idx);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Subtle interactive parallax for the majestic polar bear
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMousePos({ x, y });
  };

  // Web Speech API for the polar bear to speak
  const toggleSpeech = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeChapter.speechText);
    utterance.rate = 0.95;
    utterance.pitch = 0.85; // Deeper, more majestic voice

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('Google'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Cancel speech on chapter change or unmount
  useEffect(() => {
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeChapterIndex]);

  return (
    <section
      ref={containerRef}
      className="polar-narrator-scrolly-section"
      onMouseMove={handleMouseMove}
    >
      {/* Background Glacial Mist & Aurora Canvas */}
      <div className="scrolly-ambient-bg">
        <div
          className="scrolly-aurora-glow"
          style={{ background: `radial-gradient(circle at 30% 40%, ${activeChapter.themeColor}22 0%, transparent 70%)` }}
        />
        <div className="scrolly-ice-grid" />
      </div>

      <div className="scrolly-layout-container">
        {/* ═══ LEFT STICKY STAGE: THE COLOSSAL POLAR BEAR GUARDIAN ═══ */}
        <div className="polar-bear-sticky-stage">
          <div className="polar-bear-anchor-wrapper">
            {/* 21st.dev Border-Beam Glowing Frame */}
            <div className="bear-border-beam-ring" />

            <div className="polar-bear-grand-card">
              {/* Grand High-Resolution Image */}
              <motion.div
                className="bear-image-viewport"
                animate={{
                  x: mousePos.x,
                  y: mousePos.y,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              >
                <img
                  src="/images/polar-bear-guardian.jpg"
                  alt="Colossal Majestic Polar Bear standing atop Arctic glacial peak"
                  className="bear-grand-image"
                />

                {/* Particle Frost / Condensation Breath Effect */}
                <div className="bear-breath-particles">
                  <div className="breath-puff puff-1" />
                  <div className="breath-puff puff-2" />
                  <div className="breath-puff puff-3" />
                </div>

                {/* Glacial Aurora Rim Light */}
                <div
                  className="bear-rim-aurora"
                  style={{
                    boxShadow: `inset 0 0 60px ${activeChapter.themeColor}55`,
                  }}
                />
              </motion.div>

              {/* Status Header Chip */}
              <div className="bear-card-header">
                <div className="bear-identity">
                  <span className="live-pulse-dot" />
                  <span className="bear-name">NANOOK • CRYOSPHERE GUARDIAN</span>
                </div>
                <div className="bear-loc">
                  <ShieldCheck size={14} className="icon-shield" />
                  <span>Sovereign Guide</span>
                </div>
              </div>

              {/* ═══ HOLOGRAPHIC NARRATIVE SPEECH BUBBLE (21st.dev) ═══ */}
              <div className="holographic-speech-capsule">
                <div className="speech-capsule-top">
                  <div className="speech-badge" style={{ color: activeChapter.themeColor, borderColor: `${activeChapter.themeColor}55` }}>
                    <Sparkles size={12} />
                    <span>CHAPTER {activeChapter.id} OF {chapters.length}</span>
                  </div>

                  {/* Audio Equalizer & Voice Button */}
                  {speechSupported && (
                    <button
                      onClick={toggleSpeech}
                      className={`voice-listen-pill ${isSpeaking ? 'speaking' : ''}`}
                      title="Have the Polar Bear speak this aloud"
                      aria-label="Toggle Polar Bear Voice"
                    >
                      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span>{isSpeaking ? 'Stop Voice' : 'Hear Bear Speak'}</span>
                      {isSpeaking && (
                        <div className="audio-equalizer">
                          <span className="bar bar-1" />
                          <span className="bar bar-2" />
                          <span className="bar bar-3" />
                          <span className="bar bar-4" />
                        </div>
                      )}
                    </button>
                  )}
                </div>

                {/* Narrative Dialogue Text with AnimatePresence */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeChapter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="speech-dialogue-body"
                  >
                    <p className="speech-dialogue-text">
                      &ldquo;{activeChapter.speechText}&rdquo;
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Chapter Fast Switcher Pills */}
                <div className="chapter-step-pills">
                  {chapters.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        chapterRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`step-pill ${activeChapterIndex === idx ? 'active' : ''}`}
                      style={{
                        backgroundColor: activeChapterIndex === idx ? activeChapter.themeColor : 'rgba(255,255,255,0.15)',
                      }}
                      title={`Jump to ${ch.badge}`}
                      aria-label={`Jump to Chapter ${ch.id}`}
                    />
                  ))}
                  <span className="step-counter">
                    0{activeChapter.id} / 0{chapters.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT SCROLLING NARRATIVE TRACK ═══ */}
        <div className="narrative-scrolling-track">
          <div className="scrolly-intro-notice">
            <span className="notice-chip">SCROLL TO EXPERIENCE</span>
            <h2>The Polar Odyssey of India</h2>
            <p>As you descend through the cryosphere, the Polar Bear unfolds each domain of the polar research initiative.</p>
          </div>

          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              ref={(el) => { chapterRefs.current[index] = el; }}
              className={`narrative-card ${activeChapterIndex === index ? 'card-focused' : ''}`}
            >
              <div className="narrative-card-inner">
                {/* Chapter Header */}
                <div className="chapter-meta-row">
                  <span
                    className="chapter-badge"
                    style={{
                      color: chapter.themeColor,
                      backgroundColor: `${chapter.themeColor}18`,
                      borderColor: `${chapter.themeColor}44`,
                    }}
                  >
                    {chapter.badge}
                  </span>
                  <span className="chapter-index-num">PHASE 0{chapter.id}</span>
                </div>

                <h3 className="narrative-card-title">{chapter.title}</h3>

                <blockquote className="narrative-quote">
                  {chapter.quote}
                </blockquote>

                {/* Key Metrics Bento */}
                <div className="chapter-stats-grid">
                  {chapter.stats.map((st, i) => (
                    <div key={i} className="chapter-stat-item">
                      <div className="stat-v" style={{ color: chapter.themeColor }}>
                        {st.value}
                      </div>
                      <div className="stat-l">{st.label}</div>
                    </div>
                  ))}
                </div>

                {/* Action CTA Button */}
                <div className="chapter-cta-row">
                  <Link
                    href={chapter.ctaHref}
                    className="chapter-explore-btn"
                    style={{
                      borderColor: `${chapter.themeColor}66`,
                    }}
                  >
                    <span className="btn-icon" style={{ color: chapter.themeColor }}>
                      {chapter.ctaIcon}
                    </span>
                    <span>{chapter.ctaLabel}</span>
                    <ChevronRight size={16} className="btn-arrow" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Scrolly Final Threshold */}
          <div className="scrolly-conclusion-card">
            <div className="conclusion-glow" />
            <Sparkles size={28} className="conclusion-icon" />
            <h3>You Have Navigated the Cryosphere</h3>
            <p>
              Continue deeper into live satellite monitoring, station radar scopes,
              or query the AI research oracle directly.
            </p>
            <div className="conclusion-actions">
              <Link href="/explore" className="btn btn-primary">
                Explore Full Directory <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('replay-polar-intro'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn btn-secondary"
              >
                Replay Ice-Break Intro
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
