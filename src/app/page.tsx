'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import PolarBearIceberg3D from '@/components/PolarBearIceberg3D';
import IceBreakIntro from '@/components/IceBreakIntro';
import PolarBearNarrator from '@/components/PolarBearNarrator';
import './page.css';
import AppLayout from '@/components/AppLayout';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import {
  Search, ArrowRight, Compass, BookOpen, BarChart3,
  GraduationCap, MessageCircle, Snowflake, Globe, FileText,
  Image as ImageIcon, Play, Users, TrendingUp, Sparkles, Megaphone,
  Box, Radio, Database
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
                <span>NCPOR • MINISTRY OF EARTH SCIENCES • GOVT. OF INDIA</span>
              </div>

              <h1 className="hero-title">
                Sovereign Polar & Oceanographic<br />
                <span className="text-gradient">Scientific Research Archive</span>
              </h1>

              <p className="hero-description">
                The unified national data gateway for longitudinal cryospheric records, ice-core paleoclimatology,
                oceanographic telemetry, and 44 historic Indian scientific expeditions across Antarctica, the Arctic, and the Himalayas.
              </p>

              <div className="hero-search">
                <Search size={20} className="hero-search-icon" />
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder="Search 1,400+ polar research datasets, expedition logs, station telemetry..."
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
                  Search Archive
                </Link>
              </div>

              <div className="hero-ctas">
                <Link href="/explore" className="btn btn-primary btn-lg">
                  <Database size={18} />
                  Access Research Archives
                </Link>
                <Link href="/ask" className="btn btn-secondary btn-lg">
                  <MessageCircle size={18} />
                  Ask POLARA AI
                </Link>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('replay-polar-intro'))}
                  className="hero-replay-btn"
                  title="Replay Cryospheric Intro"
                >
                  <Sparkles size={14} />
                  <span>Replay Intro</span>
                </button>
              </div>

              <div className="hero-tags">
                <span className="hero-tags-label">Curated Domains:</span>
                {['Antarctic Sea Ice', 'Arctic Climate & IndARC', '44th ISEA Expeditions', 'Western Himalayan Glaciology', 'Southern Ocean Biogeochemistry'].map(tag => (
                  <Link href={`/explore?q=${encodeURIComponent(tag)}`} key={tag} className="tag">
                    {tag}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* ═══ 21st.dev Style Showcase Column ═══ */}
            <div className="hero-showcase-column">
              <PolarBearIceberg3D />
            </div>
          </div>
        </section>

        {/* ═══ Stats Bar ═══ */}
        <section className="stats-bar">
          <div className="stats-bar-inner">
            <div className="stats-bar-note">
              <Radio size={14} className="stats-live-dot" />
              <span>SYNCHRONIZED POLAR ARCHIVE</span>
            </div>
            {[
              { value: platformStats.totalResources.toLocaleString(), label: 'Cataloged Resources', icon: <FileText size={16} /> },
              { value: platformStats.expeditions.toString(), label: 'Scientific Expeditions', icon: <Compass size={16} /> },
              { value: platformStats.publications.toString(), label: 'Peer-Reviewed Papers', icon: <BookOpen size={16} /> },
              { value: platformStats.datasets.toString(), label: 'Open Datasets', icon: <BarChart3 size={16} /> },
              { value: platformStats.mediaAssets.toLocaleString(), label: 'Multimedia Records', icon: <ImageIcon size={16} /> },
              { value: platformStats.learningResources.toString(), label: 'Educational Modules', icon: <GraduationCap size={16} /> },
            ].map(stat => (
              <div key={stat.label} className="stat-item">
                <div className="stat-item-value">{stat.value}</div>
                <div className="stat-item-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Global Archival Partners (Infinite Slider) ═══ */}
        <section className="section py-8 overflow-hidden bg-[var(--bg-secondary)] border-b border-[var(--border-secondary)]">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              International Archival Partners & Nodes
            </h4>
          </div>
          <InfiniteSlider gap={32} duration={40} className="w-full">
            <div className="flex items-center gap-3 px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
              <Snowflake size={24} className="text-[var(--ice-400)]" />
              <span className="font-heading font-semibold tracking-wide">Norwegian Polar Institute</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
              <Globe size={24} className="text-[var(--cyan-400)]" />
              <span className="font-heading font-semibold tracking-wide">Svalbard Integrated Arctic Earth Observing System</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
              <Compass size={24} className="text-[var(--aurora-400)]" />
              <span className="font-heading font-semibold tracking-wide">Antarctic Treaty Secretariat</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
              <Database size={24} className="text-[var(--warm-400)]" />
              <span className="font-heading font-semibold tracking-wide">National Centre for Polar and Ocean Research</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
              <Snowflake size={24} className="text-[var(--frost-400)]" />
              <span className="font-heading font-semibold tracking-wide">British Antarctic Survey</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
              <Search size={24} className="text-[var(--accent-primary)]" />
              <span className="font-heading font-semibold tracking-wide">Scientific Committee on Antarctic Research</span>
            </div>
          </InfiniteSlider>
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

        {/* ═══ Sovereign Scientific Footer ═══ */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-top-grid">
              {/* Col 1: Institutional Authority */}
              <div className="footer-col-authority">
                <div className="footer-logo">
                  <Snowflake size={22} className="footer-logo-icon" />
                  <span className="footer-logo-title">POLARA</span>
                </div>
                <div className="footer-institution-badge">
                  <span>NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (NCPOR)</span>
                </div>
                <p className="footer-inst-desc">
                  An autonomous scientific research institute under the Ministry of Earth Sciences (MoES),
                  Government of India. Mandated to lead the Indian Antarctic, Arctic, Southern Ocean,
                  and Himalayan Cryosphere scientific programmes.
                </p>
                <div className="footer-geo-loc">
                  Headland Sada, Vasco da Gama, Goa - 403804, India
                </div>
              </div>

              {/* Col 2: Permanent Research Stations */}
              <div className="footer-col">
                <div className="footer-col-heading">Permanent Observatories</div>
                <ul className="footer-links-list">
                  <li>
                    <span className="station-code">ANTARCTICA</span>
                    <span className="station-name">Bharati Station (69°24′S, 76°11′E)</span>
                  </li>
                  <li>
                    <span className="station-code">ANTARCTICA</span>
                    <span className="station-name">Maitri Station (70°45′S, 11°44′E)</span>
                  </li>
                  <li>
                    <span className="station-code">ARCTIC</span>
                    <span className="station-name">Himadri Station (Ny-Ålesund, Svalbard)</span>
                  </li>
                  <li>
                    <span className="station-code">ARCTIC</span>
                    <span className="station-name">IndARC Subsurface Mooring (Kongsfjorden)</span>
                  </li>
                  <li>
                    <span className="station-code">HIMALAYAS</span>
                    <span className="station-name">Himansh Observatory (Chandra Basin)</span>
                  </li>
                </ul>
              </div>

              {/* Col 3: Research Archives */}
              <div className="footer-col">
                <div className="footer-col-heading">Data Portals & Services</div>
                <ul className="footer-links-list">
                  <li><Link href="/explore?type=dataset">Cryospheric Core Datasets</Link></li>
                  <li><Link href="/repository">Peer-Reviewed Publications</Link></li>
                  <li><Link href="/expeditions">44 Historical Convoys</Link></li>
                  <li><Link href="/explore?type=audio">Kongsfjorden Hydrophone Tapes</Link></li>
                  <li><Link href="/ask">POLARA Scientific AI Oracle</Link></li>
                  <li><Link href="/collections">Institutional Dossiers</Link></li>
                </ul>
              </div>

              {/* Col 4: Open Science Compliance */}
              <div className="footer-col">
                <div className="footer-col-heading">Compliance & Standards</div>
                <ul className="footer-links-list">
                  <li><span>National Data Sharing & Accessibility Policy (NDSAP)</span></li>
                  <li><span>Open Government Data (OGD) India Compliant</span></li>
                  <li><span>ISO 19115 Geospatial Metadata Standard</span></li>
                  <li><span>WMO CryoNet Data Node Verified</span></li>
                  <li><span>Creative Commons CC-BY 4.0 Open Science</span></li>
                </ul>
                <div className="footer-system-status">
                  <span className="status-live-pip" />
                  <span>Telemetry Feeds: Nominal • UTC Sync Active</span>
                </div>
              </div>
            </div>

            <div className="footer-bottom-bar">
              <div className="footer-copyright">
                © {new Date().getFullYear()} POLARA • National Centre for Polar and Ocean Research, MoES, Government of India.
              </div>
              <div className="footer-bottom-links">
                <span>Terms of Data Usage</span>
                <span>•</span>
                <span>Citation Guidelines</span>
                <span>•</span>
                <span>DOI Minting Policy</span>
                <span>•</span>
                <span>Security Clearance</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AppLayout>
    </>
  );
}
