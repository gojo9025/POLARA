'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { learningModules, getResourceById } from '@/lib/data';
import {
  GraduationCap, BookOpen, Clock, ArrowRight, ArrowLeft, Check,
  CheckCircle2, Sparkles, Layers, Share2, HelpCircle,
  FileText, ExternalLink, Award, ChevronRight, Compass,
  Lightbulb, AlertCircle, RotateCcw
} from 'lucide-react';
import './page.css';

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.id as string;

  const module = learningModules.find(m => m.id === moduleId);

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<Record<number, boolean>>({});
  const [knowledgeAnswer, setKnowledgeAnswer] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!module) {
    return (
      <AppLayout>
        <div className="module-not-found">
          <AlertCircle size={48} className="text-warning" />
          <h2>Learning Module Not Found</h2>
          <p>The module identifier &quot;{moduleId}&quot; could not be located in the POLARA science archive.</p>
          <Link href="/learning" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Learning Hub
          </Link>
        </div>
      </AppLayout>
    );
  }

  const chapters = module.chapters || [
    {
      id: 'c1',
      title: module.title,
      subtitle: 'Overview & Scientific Context',
      content: module.description,
      keyTakeaways: [
        'Fundamental polar science concepts verified by NCPOR research',
        'Direct observations collected during Indian scientific expeditions',
        'Vital indicators for tracking global climate change',
      ],
      mediaUrl: module.imageUrl,
      mediaType: 'image' as const,
      caption: module.title,
    }
  ];

  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const progressPercent = Math.round(((activeChapterIndex + 1) / chapters.length) * 100);
  const isLastChapter = activeChapterIndex === chapters.length - 1;

  const handleNextChapter = () => {
    // mark current chapter as completed
    setCompletedChapters(prev => ({ ...prev, [activeChapterIndex]: true }));
    if (!isLastChapter) {
      setActiveChapterIndex(prev => prev + 1);
      setKnowledgeAnswer(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(prev => prev - 1);
      setKnowledgeAnswer(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Chapter self-check question dynamically generated
  const sampleChapterQuestions = [
    {
      q: 'Which physical mechanism is primarily responsible for the rapid climate feedback in this environment?',
      options: [
        'Solar albedo reflectivity variation between ice and open ocean',
        'Deep thermal geothermal vents beneath continental crust',
        'Lunar tidal amplitude shifts over 18.6-year cycles',
        'Surface biological photosynthesis fluctuations'
      ],
      correct: 0,
      expl: 'Correct! The contrast between high-albedo reflective ice (~0.85) and dark solar-absorbing seawater (~0.08) creates a powerful thermodynamic feedback loop.'
    },
    {
      q: 'Why are observations from Indian stations (Bharati, Maitri, Himadri) critical for global climate modeling?',
      options: [
        'They provide the only data from these high-latitude sectors to validate satellite radar algorithms',
        'They are the only stations operating continuously',
        'Satellite telemetry cannot penetrate polar cloud cover without local radio retransmission',
        'Antarctic Treaty rules prohibit other countries from measuring sea ice'
      ],
      correct: 0,
      expl: 'Correct! Ground-truth observations and ice core measurements from Indian stations calibrate satellite microwave algorithms used by global weather and climate models.'
    },
    {
      q: 'What adaptation enables polar microorganisms to maintain biological function in sub-zero brine?',
      options: [
        'Anti-freeze proteins (AFPs) and polyunsaturated flexible membrane lipids',
        'Thick limestone shells that retain thermal energy',
        'High metabolic respiration that warms cellular fluid above +5°C',
        'Dormant spores that never divide or reproduce in the cold'
      ],
      correct: 0,
      expl: 'Correct! Specialized AFPs arrest ice crystal growth while polyunsaturated fatty acids prevent cellular membranes from freezing rigid.'
    }
  ];

  const currentQ = sampleChapterQuestions[activeChapterIndex % sampleChapterQuestions.length];

  return (
    <AppLayout>
      <div className="module-detail-page">
        {/* Top Sticky Header */}
        <div className="module-topbar">
          <div className="module-topbar-inner">
            <div className="module-breadcrumbs">
              <Link href="/learning" className="back-link">
                <ArrowLeft size={14} /> Learning Hub
              </Link>
              <span className="sep">/</span>
              <span className="current-title">{module.title}</span>
            </div>

            <div className="module-topbar-actions">
              <button className="share-btn" onClick={handleShare} title="Share module link">
                <Share2 size={14} /> {copiedLink ? 'Link Copied!' : 'Share'}
              </button>
              <Link href={`/ask?q=Tell me more about ${encodeURIComponent(module.title)}`} className="ask-btn">
                <Sparkles size={14} /> Ask POLARA AI
              </Link>
            </div>
          </div>

          {/* Progress bar */}
          <div className="module-progress-track">
            <div className="module-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="module-layout-container">
          {/* Left Sidebar: Chapters Stepper & Metadata */}
          <aside className="module-sidebar">
            <div className="module-meta-card">
              <div className="module-badge-row">
                <span className={`badge ${module.difficulty === 'beginner' ? 'badge-aurora' : module.difficulty === 'intermediate' ? 'badge-ice' : 'badge-frost'}`}>
                  {module.difficulty}
                </span>
                <span className="meta-pill"><Clock size={12} /> {module.estimatedTime}</span>
              </div>
              <h2 className="sidebar-module-title">{module.title}</h2>
              <p className="sidebar-module-desc">{module.description}</p>
              
              <div className="sidebar-audience">
                <span className="audience-label">Target Audience:</span>
                <span className="audience-value">{module.targetAudience}</span>
              </div>
            </div>

            {/* Chapters Navigation */}
            <div className="chapters-nav-card">
              <div className="chapters-nav-header">
                <h3><Layers size={16} /> Course Syllabus</h3>
                <span className="chapter-count">{activeChapterIndex + 1}/{chapters.length}</span>
              </div>

              <div className="chapter-steps-list">
                {chapters.map((ch, idx) => {
                  const isActive = idx === activeChapterIndex;
                  const isDone = completedChapters[idx];
                  return (
                    <button
                      key={ch.id}
                      className={`chapter-step-btn ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        setKnowledgeAnswer(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="step-indicator">
                        {isDone ? <CheckCircle2 size={16} className="text-aurora" /> : <span>{idx + 1}</span>}
                      </div>
                      <div className="step-info">
                        <span className="step-title">{ch.title}</span>
                        {ch.subtitle && <span className="step-subtitle">{ch.subtitle}</span>}
                      </div>
                      <ChevronRight size={14} className="step-arrow" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verified Research Sources */}
            {module.sourceResources && module.sourceResources.length > 0 && (
              <div className="sources-card">
                <h4><FileText size={14} /> Verified Archive Sources</h4>
                <div className="source-links">
                  {module.sourceResources.map(resId => {
                    const r = getResourceById(resId);
                    return (
                      <Link key={resId} href={`/repository/${resId}`} className="source-link-item">
                        <span className="source-id">{resId.toUpperCase()}</span>
                        <span className="source-title">{r?.title || 'Archive Resource Document'}</span>
                        <ExternalLink size={12} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Main Reading Canvas */}
          <main className="module-main-content">
            <article className="chapter-article">
              <header className="chapter-header">
                <div className="chapter-number-pill">
                  <Compass size={14} /> Chapter {activeChapterIndex + 1} of {chapters.length}
                </div>
                <h1 className="chapter-title">{currentChapter.title}</h1>
                {currentChapter.subtitle && (
                  <h3 className="chapter-subtitle">{currentChapter.subtitle}</h3>
                )}
              </header>

              {/* Media Container */}
              {currentChapter.mediaUrl && (
                <div className="chapter-media-card">
                  <div className="media-img-wrap">
                    <img
                      src={currentChapter.mediaUrl}
                      alt={currentChapter.caption || currentChapter.title}
                      loading="eager"
                    />
                    <div className="media-overlay-gradient" />
                  </div>
                  {currentChapter.caption && (
                    <div className="media-caption">
                      <Sparkles size={13} className="text-cyan" />
                      <span>{currentChapter.caption}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Chapter Prose Content */}
              <div className="chapter-prose">
                {currentChapter.content.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph.split(/(\*\*.*?\*\*)/g).map((part, bIdx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={bIdx}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                ))}
              </div>

              {/* Key Scientific Takeaways Callout */}
              {currentChapter.keyTakeaways && currentChapter.keyTakeaways.length > 0 && (
                <div className="takeaways-box">
                  <div className="takeaways-header">
                    <Lightbulb size={18} className="text-warm" />
                    <h4>Key Scientific Takeaways</h4>
                  </div>
                  <ul className="takeaways-list">
                    {currentChapter.keyTakeaways.map((point, kIdx) => (
                      <li key={kIdx}>
                        <div className="takeaway-bullet">
                          <Check size={12} />
                        </div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Knowledge Self-Check */}
              <div className="knowledge-check-card">
                <div className="knowledge-header">
                  <HelpCircle size={18} className="text-cyan" />
                  <div>
                    <h4>Chapter Knowledge Check</h4>
                    <p>Verify your comprehension before advancing to the next section</p>
                  </div>
                </div>

                <div className="knowledge-question-box">
                  <p className="k-question-text">{currentQ.q}</p>
                  <div className="k-options-grid">
                    {currentQ.options.map((opt, optIdx) => {
                      const isChosen = knowledgeAnswer === optIdx;
                      const isCorrect = optIdx === currentQ.correct;
                      let btnCls = 'k-option-btn';
                      if (knowledgeAnswer !== null) {
                        if (isCorrect) btnCls += ' correct';
                        else if (isChosen) btnCls += ' incorrect';
                      }
                      return (
                        <button
                          key={optIdx}
                          className={btnCls}
                          onClick={() => setKnowledgeAnswer(optIdx)}
                          disabled={knowledgeAnswer !== null}
                        >
                          <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                          <span className="opt-text">{opt}</span>
                          {knowledgeAnswer !== null && isCorrect && <Check size={16} className="text-aurora" />}
                        </button>
                      );
                    })}
                  </div>

                  {knowledgeAnswer !== null && (
                    <div className="knowledge-explanation">
                      <Sparkles size={14} className="text-cyan" />
                      <span>{currentQ.expl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Controls */}
              <nav className="chapter-nav-buttons" aria-label="Chapter navigation">
                <button
                  className="btn btn-secondary btn-nav-prev"
                  onClick={handlePrevChapter}
                  disabled={activeChapterIndex === 0}
                >
                  <ArrowLeft size={16} /> Previous Chapter
                </button>

                {isLastChapter ? (
                  <button
                    className="btn btn-primary btn-nav-finish"
                    onClick={() => {
                      setCompletedChapters(prev => ({ ...prev, [activeChapterIndex]: true }));
                      router.push('/learning?tab=quiz');
                    }}
                  >
                    <Award size={18} /> Complete Course & Take Quiz <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-nav-next"
                    onClick={handleNextChapter}
                  >
                    Next Chapter <ArrowRight size={16} />
                  </button>
                )}
              </nav>
            </article>
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
