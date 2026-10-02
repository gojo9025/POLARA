'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import PolarBearIceberg3D from '@/components/PolarBearIceberg3D';
import IceBreakIntro from '@/components/IceBreakIntro';
import PolarBearNarrator from '@/components/PolarBearNarrator';
import './page.css';
import AppLayout from '@/components/AppLayout';
import {
  Search, ArrowRight, Compass, BookOpen, BarChart3,
  GraduationCap, MessageCircle, Snowflake, Globe, FileText,
  Image as ImageIcon, Play, Users, TrendingUp, Sparkles, Megaphone,
  Box, Radio
} from 'lucide-react';
import {
  expeditions, researchAreas, reports, publications,
  learningModules, platformStats, sampleOutreachPackage
} from '@/lib/data';

const polarStations = [
  {
    id: 'bharati',
    name: 'Bharati Station',
    location: 'Larsemann Hills, Antarctica',
    coords: '69°24′S, 76°11′E',
    temp: '-18.4°C',
    wind: '14.2 kt ESE',
    pressure: '984.6 hPa',
    status: 'ONLINE',
    region: 'East Antarctica',
    iceCondition: 'Fast Ice: 1.84m',
    sensor: 'AWS-P04 Marine Met',
    subtext: '44th ISEA Primary Base',
    color: 'var(--ice-400)',
    radarX: '65%',
    radarY: '38%',
  },
  {
    id: 'maitri',
    name: 'Maitri Station',
    location: 'Schirmacher Oasis, Antarctica',
    coords: '70°45′S, 11°44′E',
    temp: '-26.8°C',
    wind: '22.0 kt ENE',
    pressure: '978.2 hPa',
    status: 'ONLINE',
    region: 'Queen Maud Land',
    iceCondition: 'Plateau Margin: 2.42m',
    sensor: 'Cryo-Flux Array',
    subtext: 'Meteorological & Geomagnetic Lab',
    color: 'var(--cyan-400)',
    radarX: '42%',
    radarY: '58%',
  },
  {
    id: 'himadri',
    name: 'Himadri Station',
    location: 'Ny-Ålesund, Svalbard',
    coords: '78°55′N, 11°56′E',
    temp: '-8.2°C',
    wind: '8.4 kt N',
    pressure: '1012.4 hPa',
    status: 'ONLINE',
    region: 'High Arctic',
    iceCondition: 'Fjord Terminus Active',
    sensor: 'Atmospheric LiDAR v3',
    subtext: 'Arctic Climate & Aerosol Watch',
    color: 'var(--frost-400)',
    radarX: '72%',
    radarY: '68%',
  },
  {
    id: 'indarc',
    name: 'IndARC Subsurface Mooring',
    location: 'Kongsfjorden Fjord, Svalbard',
    coords: '79°01′N, 11°32′E',
    temp: '-1.4°C',
    wind: 'Depth: 192m',
    pressure: 'Salinity: 34.85 PSU',
    status: 'LOGGING',
    region: 'Arctic Ocean',
    iceCondition: 'Acoustic Profiling Active',
    sensor: 'ADCP & CTD Array',
    subtext: 'Multi-Sensor Ocean Observatory',
    color: 'var(--aurora-400)',
    radarX: '28%',
    radarY: '45%',
  }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStationId, setActiveStationId] = useState('bharati');
  const [heroVisualMode, setHeroVisualMode] = useState<'3d' | 'cinematic' | 'telemetry'>('3d');

  const activeStation = polarStations.find(s => s.id === activeStationId) || polarStations[0];

  return (
    <>
      <IceBreakIntro />
      <AppLayout>
        <div className="home-page">
        {/* ═══ Hero Section ═══ */}
        <section className="hero">
          <div className="hero-bg">
            <div className="hero-gradient-1" />
            <div className="hero-gradient-2" />
            <div className="hero-grid" />
            {/* Animated particles */}
            <div className="hero-particles">
              {Array.from({ length: 20 }).map((_, i) => {
                const left = (i * 37) % 100;
                const top = (i * 59) % 100;
                const delay = (i * 13) % 5;
                const duration = 3 + ((i * 17) % 4);
                return (
                  <div key={i} className="particle" style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }} />
                );
              })}
            </div>
          </div>

          <div className="hero-container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="hero-badge">
                <Snowflake size={14} />
                <span>India&apos;s Polar Science Knowledge Ecosystem</span>
              </div>

              <h1 className="hero-title">
                Discover the Science<br />
                <span className="text-gradient">Behind the Poles</span>
              </h1>

              <p className="hero-description">
                Explore expeditions, research, datasets, publications and multimedia
                from India&apos;s polar science ecosystem — organized, connected and made
                accessible through POLARA.
              </p>

              <div className="hero-search">
                <Search size={20} className="hero-search-icon" />
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder="Search polar science... (e.g., Antarctic sea ice, Arctic climate)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
                <Link
                  href={searchQuery.trim() ? `/explore?q=${encodeURIComponent(searchQuery)}` : '/explore'}
                  className="btn btn-primary"
                >
                  Search
                </Link>
              </div>

              <div className="hero-ctas">
                <Link href="/explore" className="btn btn-primary btn-lg">
                  <Globe size={18} />
                  Explore Polar Knowledge
                </Link>
                <Link href="/ask" className="btn btn-secondary btn-lg">
                  <MessageCircle size={18} />
                  Ask POLARA
                </Link>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('replay-polar-intro'))}
                  className="btn btn-secondary btn-lg"
                  title="Replay cinematic polar bear ice break intro"
                >
                  <Sparkles size={18} />
                  Ice-Break Intro
                </button>
              </div>

              <div className="hero-tags">
                {['Antarctic sea ice', 'Arctic climate', 'Indian expeditions', 'Glaciology', 'Southern Ocean', 'Polar biodiversity'].map(tag => (
                  <Link href={`/explore?q=${encodeURIComponent(tag)}`} key={tag} className="tag">
                    {tag}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* ═══ 21st.dev Style Showcase Column ═══ */}
            <div className="hero-showcase-column">
              {/* Floating Switcher Bar */}
              <div className="hero-switcher-bar">
                <button
                  className={`switcher-pill ${heroVisualMode === '3d' ? 'active' : ''}`}
                  onClick={() => setHeroVisualMode('3d')}
                  title="Interactive 3D Polar Bear walking on Iceberg"
                >
                  <Box size={14} />
                  <span>3D Polar Bear</span>
                  <span className="switcher-chip">Three.js</span>
                </button>

                <button
                  className={`switcher-pill ${heroVisualMode === 'cinematic' ? 'active' : ''}`}
                  onClick={() => setHeroVisualMode('cinematic')}
                  title="8K High-Resolution Glacial Imagery"
                >
                  <Sparkles size={14} />
                  <span>8K Glacial Cam</span>
                </button>

                <button
                  className={`switcher-pill ${heroVisualMode === 'telemetry' ? 'active' : ''}`}
                  onClick={() => setHeroVisualMode('telemetry')}
                  title="Scientific Stations Telemetry Array"
                >
                  <Radio size={14} />
                  <span>Station Telemetry</span>
                </button>
              </div>

              {/* Dynamic View with AnimatePresence */}
              <AnimatePresence mode="wait">
                {heroVisualMode === '3d' && (
                  <motion.div
                    key="3d"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PolarBearIceberg3D />
                  </motion.div>
                )}

                {heroVisualMode === 'cinematic' && (
                  <motion.div
                    key="cinematic"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="cinematic-iceberg-view"
                  >
                    <img
                      src="/images/polar-bear-iceberg.jpg"
                      alt="Majestic polar bear moving gracefully across a glacial iceberg in the Arctic"
                      className="cinematic-iceberg-img"
                    />
                    <div className="cinematic-lens-overlay" />
                    <div className="cinematic-hud-tag">
                      <div className="tag-pulse" />
                      <div className="tag-meta">
                        <span className="tag-title">URSUS MARITIMUS • 8K SATELLITE EXPEDITION FEED</span>
                        <span className="tag-loc">Kongsfjorden Glacier Pack Ice, Svalbard • Drift Rate 0.4 kt</span>
                      </div>
                    </div>
                    <div className="cinematic-badge-row">
                      <span className="badge badge-aurora">Telemetry Tracked</span>
                      <span className="badge badge-ice">Fast Ice: 1.84m</span>
                    </div>
                  </motion.div>
                )}

                {heroVisualMode === 'telemetry' && (
                  <motion.div
                    key="telemetry"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="telemetry-hud">
                      <div className="hud-corner hud-corner-tl" />
                      <div className="hud-corner hud-corner-tr" />
                      <div className="hud-corner hud-corner-bl" />
                      <div className="hud-corner hud-corner-br" />

                      <div className="hud-header">
                        <div className="hud-title-wrap">
                          <div className="hud-live-dot" />
                          <span className="hud-title">NCPOR Telemetry Array</span>
                        </div>
                        <span className="hud-time">UTC LIVE FEED</span>
                      </div>

                      {/* Station Tabs */}
                      <div className="hud-station-tabs">
                        {polarStations.map(station => (
                          <button
                            key={station.id}
                            className={`hud-tab ${activeStationId === station.id ? 'active' : ''}`}
                            onClick={() => setActiveStationId(station.id)}
                          >
                            {station.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>

                      {/* Telemetry Body */}
                      <div className="hud-telemetry-body">
                        <div className="hud-station-info">
                          <div className="station-badge-row">
                            <span className="badge badge-ice" style={{ color: activeStation.color, borderColor: activeStation.color }}>
                              {activeStation.region}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--aurora-400)', fontFamily: 'var(--font-mono)' }}>
                              ● {activeStation.status}
                            </span>
                          </div>

                          <div className="station-name">{activeStation.name}</div>
                          <div className="station-coords">
                            <Compass size={13} /> {activeStation.coords}
                          </div>

                          <div className="telemetry-metrics-grid">
                            <div className="metric-card">
                              <label>Temp / Metric</label>
                              <span>{activeStation.temp}</span>
                            </div>
                            <div className="metric-card">
                              <label>Vector / Depth</label>
                              <span>{activeStation.wind}</span>
                            </div>
                            <div className="metric-card">
                              <label>Baro / Salinity</label>
                              <span>{activeStation.pressure}</span>
                            </div>
                            <div className="metric-card">
                              <label>Condition</label>
                              <span style={{ fontSize: '0.8125rem' }}>{activeStation.iceCondition}</span>
                            </div>
                          </div>
                        </div>

                        {/* Radar Scope */}
                        <div className="radar-scope-container">
                          <div className="radar-scope">
                            <div className="radar-ring radar-ring-1" />
                            <div className="radar-ring radar-ring-2" />
                            <div className="radar-crosshair-h" />
                            <div className="radar-crosshair-v" />
                            <div className="radar-sweep-beam" />
                            <div
                              className="radar-blip"
                              style={{
                                left: activeStation.radarX,
                                top: activeStation.radarY,
                                backgroundColor: activeStation.color,
                                boxShadow: `0 0 10px ${activeStation.color}`,
                              }}
                            />
                          </div>
                          <span className="radar-caption">RADAR COORD LOCK</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ═══ Stats Bar ═══ */}
        <section className="stats-bar">
          <div className="stats-bar-inner">
            <div className="stats-bar-note">
              <Sparkles size={14} />
              <span>Prototype Dataset</span>
            </div>
            {[
              { value: platformStats.totalResources.toLocaleString(), label: 'Knowledge Resources', icon: <FileText size={16} /> },
              { value: platformStats.expeditions.toString(), label: 'Expeditions', icon: <Compass size={16} /> },
              { value: platformStats.publications.toString(), label: 'Publications', icon: <BookOpen size={16} /> },
              { value: platformStats.datasets.toString(), label: 'Datasets', icon: <BarChart3 size={16} /> },
              { value: platformStats.mediaAssets.toLocaleString(), label: 'Media Assets', icon: <ImageIcon size={16} /> },
              { value: platformStats.learningResources.toString(), label: 'Learning Resources', icon: <GraduationCap size={16} /> },
            ].map(stat => (
              <div key={stat.label} className="stat-item">
                <div className="stat-item-value">{stat.value}</div>
                <div className="stat-item-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Grand Static Polar Bear Scrollytelling Guide (21st.dev) ═══ */}
        <PolarBearNarrator />

        {/* ═══ Featured Expeditions ═══ */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Featured Expeditions</h2>
              <p>India&apos;s latest polar research expeditions</p>
            </div>
            <Link href="/expeditions" className="btn btn-ghost">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="expedition-grid">
            {expeditions.map((exp, i) => (
              <Link href={`/expeditions/${exp.id}`} key={exp.id} className="expedition-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div
                  className="expedition-card-image"
                  style={{
                    backgroundImage: `url(${exp.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '160px',
                    position: 'relative'
                  }}
                >
                  <div className="expedition-card-overlay" />
                  <div className="expedition-card-region">
                    <span className="badge badge-ice">{exp.region}</span>
                  </div>
                </div>
                <div className="expedition-card-content">
                  <div className="expedition-card-year">{exp.year}</div>
                  <h3 className="expedition-card-name">{exp.name}</h3>
                  <p className="expedition-card-location">{exp.location}</p>
                  <div className="expedition-card-areas">
                    {exp.researchAreas.slice(0, 3).map(area => (
                      <span key={area} className="tag">{area}</span>
                    ))}
                  </div>
                  <div className="expedition-card-stats">
                    <span>{exp.resourceCount.reports} reports</span>
                    <span>{exp.resourceCount.datasets} datasets</span>
                    <span>{exp.resourceCount.publications} publications</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ Research Highlights ═══ */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Research Highlights</h2>
              <p>Latest findings from polar research</p>
            </div>
            <Link href="/repository" className="btn btn-ghost">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="highlights-grid">
            {reports.map((report, i) => (
              <Link href={`/repository/${report.id}`} key={report.id} className="highlight-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="highlight-card-meta">
                  <span className="badge badge-cyan">{report.researchArea}</span>
                  <span className="highlight-year">{report.year}</span>
                </div>
                <h3 className="highlight-title">{report.title}</h3>
                <p className="highlight-desc truncate-3">{report.description}</p>
                <div className="highlight-footer">
                  <div className="highlight-authors">
                    <Users size={14} />
                    <span>{report.authors?.join(', ')}</span>
                  </div>
                  <span className="highlight-link">
                    Read more <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ Explore Polar Science ═══ */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Explore Polar Science</h2>
              <p>Browse by research area</p>
            </div>
          </div>

          <div className="research-grid">
            {researchAreas.map((area, i) => (
              <Link
                href={`/explore?area=${encodeURIComponent(area.name)}`}
                key={area.id}
                className="research-card"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="research-card-icon" style={{ background: `${area.color}15`, color: area.color }}>
                  <span style={{ fontSize: '1.5rem' }}>{area.icon}</span>
                </div>
                <div className="research-card-info">
                  <h4>{area.name}</h4>
                  <p className="truncate-2">{area.description}</p>
                </div>
                <div className="research-card-count" style={{ color: area.color }}>
                  {area.resourceCount}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ Learning Hub ═══ */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Learning Hub</h2>
              <p>Educational resources for everyone</p>
            </div>
            <Link href="/learning" className="btn btn-ghost">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="learning-grid">
            {[
              { title: 'For Students', desc: 'Simple explanations and visual learning', icon: <GraduationCap size={24} />, href: '/learning?audience=student', color: 'var(--ice-500)' },
              { title: 'For Educators', desc: 'Teaching resources and lesson plans', icon: <BookOpen size={24} />, href: '/learning?audience=educator', color: 'var(--cyan-500)' },
              { title: 'Explainers', desc: 'Research made accessible for everyone', icon: <Sparkles size={24} />, href: '/learning?type=explainer', color: 'var(--aurora-500)' },
              { title: 'Quizzes', desc: 'Test your polar science knowledge', icon: <Play size={24} />, href: '/learning?type=quiz', color: 'var(--frost-500)' },
              { title: 'Visual Stories', desc: 'Science stories with images and visuals', icon: <ImageIcon size={24} />, href: '/learning?type=story', color: 'var(--warm-500)' },
            ].map((item, i) => (
              <Link href={item.href} key={item.title} className="learning-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="learning-card-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ Knowledge Flow ═══ */}
        <section className="section flow-section">
          <div className="flow-bg" />
          <div className="section-header">
            <div>
              <h2>From Research to Public Knowledge</h2>
              <p>How POLARA transforms polar science</p>
            </div>
          </div>

          <div className="flow-pipeline">
            {[
              { icon: <FileText size={24} />, label: 'Scientific Research', sub: 'Upload & ingest' },
              { icon: <Sparkles size={24} />, label: 'AI Understanding', sub: 'Extract & structure' },
              { icon: <Search size={24} />, label: 'Knowledge Index', sub: 'Search & discover' },
              { icon: <Users size={24} />, label: 'Audience Adaptation', sub: 'Transform & simplify' },
              { icon: <Megaphone size={24} />, label: 'Outreach', sub: 'Publish & disseminate' },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flow-step" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flow-step-icon">{step.icon}</div>
                  <div className="flow-step-label">{step.label}</div>
                  <div className="flow-step-sub">{step.sub}</div>
                </div>
                {i < 4 && <div className="flow-arrow"><ArrowRight size={20} /></div>}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ═══ Latest Outreach ═══ */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Latest Outreach</h2>
              <p>Recent content generated from polar research</p>
            </div>
            <Link href="/outreach" className="btn btn-ghost">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="outreach-grid">
            {sampleOutreachPackage.outputs.slice(0, 4).map((output, i) => (
              <div key={output.id} className="outreach-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="outreach-card-type">
                  <span className={`badge ${['badge-ice', 'badge-cyan', 'badge-frost', 'badge-warm'][i]}`}>
                    {output.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="outreach-card-status">
                    <span className="status-dot status-dot-draft" />
                    AI Generated
                  </span>
                </div>
                <h4>{output.title}</h4>
                <p className="truncate-3">{output.content.substring(0, 200)}...</p>
                <div className="outreach-card-source">
                  <FileText size={12} />
                  <span>Source: {sampleOutreachPackage.sourceResourceTitle.substring(0, 60)}...</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CTA Section ═══ */}
        <section className="cta-section">
          <div className="cta-bg" />
          <div className="cta-content">
            <h2>Ready to explore polar science?</h2>
            <p>Search, learn, and discover India&apos;s polar research — powered by AI.</p>
            <div className="cta-buttons">
              <Link href="/explore" className="btn btn-primary btn-lg">
                <Globe size={18} />
                Start Exploring
              </Link>
              <Link href="/ask" className="btn btn-secondary btn-lg">
                <MessageCircle size={18} />
                Ask POLARA
              </Link>
              <Link href="/login" className="btn btn-ghost btn-lg">
                Sign In for Full Access
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ Footer ═══ */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-logo">
                <Snowflake size={20} />
                <span>POLARA</span>
              </div>
              <p>Polar Outreach, Learning & Research Archive</p>
              <p className="footer-org">National Centre for Polar and Ocean Research (NCPOR)</p>
              <p className="footer-org">Ministry of Earth Sciences, Government of India</p>
            </div>
            <div className="footer-note">
              <p>This is a prototype application. All data shown is demonstration data.</p>
              <p>Smart India Hackathon 2025 — Problem Statement #26063</p>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
    </>
  );
}
