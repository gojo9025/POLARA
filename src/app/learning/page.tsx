'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { learningModules, glossaryTerms, quizzes, getResourceById } from '@/lib/data';
import { LearningModule, Quiz } from '@/lib/types';
import './page.css';
import {
  GraduationCap, BookOpen, Sparkles, Play, HelpCircle,
  ArrowRight, ArrowLeft, Check, X, RotateCcw, Clock, Star,
  Layers, ExternalLink, Trophy, Search, Lightbulb, CheckCircle2,
  Share2, Compass, Waves, ThermometerSnowflake, FileText,
  Users, Award, ChevronRight, BookOpenCheck
} from 'lucide-react';

function LearningHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'modules' | 'quiz' | 'glossary'>('modules');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reader Modal State
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [modalKnowledgeAnswer, setModalKnowledgeAnswer] = useState<number | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>({});

  // Quiz State
  const [activeQuizId, setActiveQuizId] = useState<string>('quiz1');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Glossary State
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');

  // Handle URL Query Params (?source=rep1, ?id=lm1, ?tab=quiz, etc.)
  useEffect(() => {
    const sourceParam = searchParams.get('source');
    const idParam = searchParams.get('id');
    const tabParam = searchParams.get('tab') || searchParams.get('type');

    if (tabParam === 'quiz') setActiveTab('quiz');
    else if (tabParam === 'glossary') setActiveTab('glossary');

    if (idParam) {
      const match = learningModules.find(m => m.id === idParam);
      if (match) {
        setSelectedModule(match);
        setActiveChapterIdx(0);
      }
    } else if (sourceParam) {
      // Find module matching this source resource
      const match = learningModules.find(
        m => m.sourceResources?.includes(sourceParam) || m.id === sourceParam
      );
      if (match) {
        setSelectedModule(match);
        setActiveChapterIdx(0);
      }
    }
  }, [searchParams]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedModule(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeQuiz = useMemo(() => {
    return quizzes.find(q => q.id === activeQuizId) || quizzes[0];
  }, [activeQuizId]);

  // Filter modules
  const filteredModules = useMemo(() => {
    return learningModules.filter(m => {
      const matchDiff = selectedDifficulty === 'all' || m.difficulty === selectedDifficulty;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.topics.some(t => t.toLowerCase().includes(q));
      return matchDiff && matchQuery;
    });
  }, [selectedDifficulty, searchQuery]);

  // Filter glossary
  const filteredGlossary = useMemo(() => {
    return glossaryTerms.filter(term => {
      const q = glossaryQuery.toLowerCase();
      const matchQuery =
        !q ||
        term.term.toLowerCase().includes(q) ||
        term.definition.toLowerCase().includes(q) ||
        term.simpleExplanation.toLowerCase().includes(q) ||
        term.relatedTerms.some(rt => rt.toLowerCase().includes(q));
      const matchLetter =
        selectedLetter === 'all' ||
        term.term.charAt(0).toUpperCase() === selectedLetter;
      return matchQuery && matchLetter;
    });
  }, [glossaryQuery, selectedLetter]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Quiz Handlers
  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === activeQuiz.questions[currentQ].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < activeQuiz.questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  const switchQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  // Modal Chapter Navigation
  const modalChapters = selectedModule?.chapters || [];
  const currentModalChapter = modalChapters[activeChapterIdx] || modalChapters[0];
  const isLastModalChapter = activeChapterIdx === modalChapters.length - 1;

  const handleNextModalChapter = () => {
    if (selectedModule) {
      setCompletedChapters(prev => ({
        ...prev,
        [`${selectedModule.id}-${activeChapterIdx}`]: true,
      }));
    }
    if (!isLastModalChapter) {
      setActiveChapterIdx(prev => prev + 1);
      setModalKnowledgeAnswer(null);
    }
  };

  const handlePrevModalChapter = () => {
    if (activeChapterIdx > 0) {
      setActiveChapterIdx(prev => prev - 1);
      setModalKnowledgeAnswer(null);
    }
  };

  return (
    <AppLayout>
      <div className="learning-page">
        {/* Refreshed Polar Hero Header */}
        <header className="learning-header">
          <div className="learning-header-bg" />
          <div className="learning-header-content">
            <div className="page-breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span>Learning Hub</span>
            </div>

            <div className="learning-title-row">
              <div className="learning-title-icon">
                <BookOpenCheck size={28} />
              </div>
              <div>
                <h1>Polar Science Learning Hub</h1>
                <p>Interactive curriculum, multi-chapter modules, self-paced quizzes, and scientific glossaries</p>
              </div>
            </div>

            {/* Hub Stats Ribbon */}
            <div className="learning-stats-ribbon">
              <div className="hub-stat-item">
                <Layers size={15} className="hub-stat-icon text-cyan" />
                <span><strong>{learningModules.length}</strong> Interactive Modules</span>
              </div>
              <div className="hub-stat-sep" />
              <div className="hub-stat-item">
                <Trophy size={15} className="hub-stat-icon text-warm" />
                <span><strong>{quizzes.length}</strong> Field Quizzes</span>
              </div>
              <div className="hub-stat-sep" />
              <div className="hub-stat-item">
                <Compass size={15} className="hub-stat-icon text-aurora" />
                <span><strong>{glossaryTerms.length}</strong> Scientific Terms</span>
              </div>
              <div className="hub-stat-sep" />
              <div className="hub-stat-item">
                <Sparkles size={15} className="hub-stat-icon text-frost" />
                <span>Verified by <strong>NCPOR</strong> Polar Expeditions</span>
              </div>
            </div>

            {/* Refreshed Navigation Tabs */}
            <nav className="tab-bar" aria-label="Learning sections">
              {[
                { key: 'modules' as const, label: `Learning Modules (${learningModules.length})`, icon: <BookOpenCheck size={17} /> },
                { key: 'quiz' as const, label: `Quizzes & Challenges (${quizzes.length})`, icon: <Trophy size={17} /> },
                { key: 'glossary' as const, label: `Polar Glossary (${glossaryTerms.length})`, icon: <Compass size={17} /> },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon} <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>

        <main className="learning-body">
          {/* TAB 1: LEARNING MODULES */}
          {activeTab === 'modules' && (
            <div className="modules-section">
              {/* Filter and Search Bar */}
              <div className="modules-filter-bar">
                <div className="module-search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search modules by topic (e.g. Sea Ice, Microbes, Monsoon, Glaciers)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="module-search-input"
                  />
                  {searchQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="difficulty-filters">
                  {[
                    { id: 'all', label: 'All Levels' },
                    { id: 'beginner', label: 'Beginner' },
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'advanced', label: 'Advanced' },
                  ].map(diff => (
                    <button
                      key={diff.id}
                      className={`diff-filter-btn ${selectedDifficulty === diff.id ? 'active' : ''}`}
                      onClick={() => setSelectedDifficulty(diff.id)}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modules Grid */}
              {filteredModules.length === 0 ? (
                <div className="modules-empty-state">
                  <HelpCircle size={40} className="text-muted" />
                  <h3>No learning modules match your filters</h3>
                  <p>Try clearing your search query or choosing &quot;All Levels&quot;.</p>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setSearchQuery(''); setSelectedDifficulty('all'); }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="modules-grid">
                  {filteredModules.map((module, i) => {
                    const chapterCount = module.chapters?.length || 2;
                    return (
                      <div
                        key={module.id}
                        className="module-card"
                        style={{ animationDelay: `${i * 60}ms` }}
                        onClick={() => {
                          setSelectedModule(module);
                          setActiveChapterIdx(0);
                          setModalKnowledgeAnswer(null);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedModule(module);
                            setActiveChapterIdx(0);
                            setModalKnowledgeAnswer(null);
                          }
                        }}
                      >
                        {/* Authentic Photo Image Thumbnail */}
                        <div className="module-image-wrap">
                          <img
                            src={module.imageUrl}
                            alt={module.title}
                            className="module-cover-img"
                            loading="lazy"
                          />
                          <div className="module-img-scrim" />

                          {/* Top Badges */}
                          <div className="module-badge-overlay">
                            <span className={`badge ${module.difficulty === 'beginner' ? 'badge-aurora' : module.difficulty === 'intermediate' ? 'badge-ice' : 'badge-frost'}`}>
                              {module.difficulty}
                            </span>
                            <span className="module-time-badge">
                              <Clock size={11} /> {module.estimatedTime}
                            </span>
                          </div>

                          {/* Chapter Count Badge */}
                          <div className="module-chapters-pill">
                            <Layers size={12} /> {chapterCount} Chapters
                          </div>
                        </div>

                        <div className="module-content">
                          <h3 className="module-card-title">{module.title}</h3>
                          <p className="module-card-desc">{module.description}</p>

                          <div className="module-topics">
                            {module.topics.slice(0, 3).map(t => (
                              <span key={t} className="tag">{t}</span>
                            ))}
                            {module.topics.length > 3 && (
                              <span className="tag-more">+{module.topics.length - 3}</span>
                            )}
                          </div>

                          <div className="module-footer">
                            <div className="module-audience-info">
                              <Users size={12} className="text-muted" />
                              <span>{module.targetAudience}</span>
                            </div>

                            <div className="module-card-actions" onClick={e => e.stopPropagation()}>
                              <Link
                                href={`/learning/${module.id}`}
                                className="btn-icon-link"
                                title="Open Dedicated Page"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <button
                                className="btn btn-primary btn-sm btn-start-learning"
                                onClick={() => {
                                  setSelectedModule(module);
                                  setActiveChapterIdx(0);
                                  setModalKnowledgeAnswer(null);
                                }}
                              >
                                <Play size={13} /> Start Learning <ArrowRight size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUIZZES */}
          {activeTab === 'quiz' && (
            <div className="quiz-tab-container">
              {/* Quiz Selection Cards */}
              {!quizStarted && (
                <div className="quiz-selector-bar">
                  <span className="quiz-selector-label">Choose Topic:</span>
                  <div className="quiz-selector-pills">
                    {quizzes.map((q, idx) => (
                      <button
                        key={q.id}
                        className={`quiz-pill-btn ${activeQuizId === q.id ? 'active' : ''}`}
                        onClick={() => switchQuiz(q.id)}
                      >
                        <Trophy size={14} />
                        <span>{q.title.replace('Test Your Knowledge: ', '')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="quiz-section">
                {!quizStarted ? (
                  <div className="quiz-intro">
                    <div className="quiz-intro-icon">
                      <Trophy size={36} />
                    </div>
                    <h2>{activeQuiz.title}</h2>
                    <p className="quiz-intro-meta">
                      <span>{activeQuiz.questions.length} questions</span>
                      <span>·</span>
                      <span className="capitalize">{activeQuiz.difficulty} difficulty</span>
                      <span>·</span>
                      <span>Immediate explanations</span>
                    </p>
                    <p className="quiz-intro-desc">
                      Test and sharpen your comprehension of polar science observations, oceanographic teleconnections, and extreme ecology.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => setQuizStarted(true)}>
                      <Play size={18} /> Launch Field Quiz
                    </button>
                  </div>
                ) : quizComplete ? (
                  <div className="quiz-complete">
                    <div className="quiz-score-badge">
                      <Award size={48} className="text-warm" />
                      <h2>{score} / {activeQuiz.questions.length}</h2>
                      <p className="score-verdict">
                        {score === activeQuiz.questions.length
                          ? 'Outstanding! Certified Polar Specialist 🏆'
                          : score >= 3
                          ? 'Great job! Strong Arctic & Antarctic knowledge 🌟'
                          : 'Good effort! Review the chapters and try again 📚'}
                      </p>
                    </div>

                    <div className="quiz-complete-actions">
                      <button className="btn btn-primary" onClick={resetQuiz}>
                        <RotateCcw size={16} /> Retake This Quiz
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          const nextIdx = (quizzes.findIndex(q => q.id === activeQuizId) + 1) % quizzes.length;
                          switchQuiz(quizzes[nextIdx].id);
                        }}
                      >
                        Try Next Quiz <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="quiz-active">
                    <div className="quiz-progress-header">
                      <div className="quiz-progress-text">
                        <span>Question {currentQ + 1} of {activeQuiz.questions.length}</span>
                        <span className="quiz-current-topic">{activeQuiz.title}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="quiz-question-box">
                      <h3 className="quiz-q-title">{activeQuiz.questions[currentQ].question}</h3>

                      <div className="quiz-options">
                        {activeQuiz.questions[currentQ].options.map((opt, idx) => {
                          const isCorrect = idx === activeQuiz.questions[currentQ].correctAnswer;
                          const isSelected = selectedAnswer === idx;
                          let className = 'quiz-option';
                          if (selectedAnswer !== null) {
                            if (isCorrect) className += ' correct';
                            else if (isSelected) className += ' incorrect';
                          }

                          return (
                            <button
                              key={idx}
                              className={className}
                              onClick={() => handleAnswer(idx)}
                              disabled={selectedAnswer !== null}
                            >
                              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                              <span className="option-text">{opt}</span>
                              {selectedAnswer !== null && isCorrect && <Check size={18} className="text-aurora" />}
                              {selectedAnswer !== null && isSelected && !isCorrect && <X size={18} className="text-danger" />}
                            </button>
                          );
                        })}
                      </div>

                      {selectedAnswer !== null && (
                        <div className="quiz-explanation">
                          <Sparkles size={16} className="text-cyan flex-shrink-0" />
                          <div>
                            <strong>Scientific Context:</strong>
                            <p>{activeQuiz.questions[currentQ].explanation}</p>
                          </div>
                        </div>
                      )}

                      {selectedAnswer !== null && (
                        <div className="quiz-next-row">
                          <button className="btn btn-primary" onClick={nextQuestion}>
                            {currentQ < activeQuiz.questions.length - 1 ? 'Next Question' : 'View Final Score'} <ArrowRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GLOSSARY */}
          {activeTab === 'glossary' && (
            <div className="glossary-section">
              {/* Search & Letter bar */}
              <div className="glossary-controls">
                <div className="glossary-search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search terminology (e.g. Cryosphere, Polynya, Katabatic, Albedo)..."
                    value={glossaryQuery}
                    onChange={e => setGlossaryQuery(e.target.value)}
                    className="glossary-search-input"
                  />
                  {glossaryQuery && (
                    <button className="clear-search-btn" onClick={() => setGlossaryQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="letter-filter-pills">
                  <button
                    className={`letter-pill ${selectedLetter === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedLetter('all')}
                  >
                    All
                  </button>
                  {alphabet.map(letter => {
                    const hasTerms = glossaryTerms.some(t => t.term.toUpperCase().startsWith(letter));
                    if (!hasTerms) return null;
                    return (
                      <button
                        key={letter}
                        className={`letter-pill ${selectedLetter === letter ? 'active' : ''}`}
                        onClick={() => setSelectedLetter(letter)}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Glossary Grid */}
              <div className="glossary-list">
                {filteredGlossary.map((term, i) => (
                  <div key={term.id} className="glossary-card" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="glossary-card-top">
                      <div className="term-icon-badge">
                        <ThermometerSnowflake size={16} />
                      </div>
                      <h3 className="glossary-term-name">{term.term}</h3>
                    </div>

                    <div className="glossary-def">
                      <label>Scientific Definition</label>
                      <p>{term.definition}</p>
                    </div>

                    <div className="glossary-simple">
                      <label><Lightbulb size={12} className="text-warm inline-icon" /> In Plain English</label>
                      <p>{term.simpleExplanation}</p>
                    </div>

                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div className="glossary-related">
                        <span className="related-label">Related:</span>
                        {term.relatedTerms.map(rt => (
                          <button
                            key={rt}
                            className="tag tag-clickable"
                            onClick={() => {
                              setGlossaryQuery(rt);
                              setSelectedLetter('all');
                            }}
                          >
                            {rt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ── INTERACTIVE MODULE READER MODAL ── */}
        {selectedModule && (
          <div className="modal-backdrop" onClick={() => setSelectedModule(null)}>
            <div
              className="module-reader-modal"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Topbar */}
              <div className="modal-topbar">
                <div className="modal-title-wrap">
                  <span className={`badge ${selectedModule.difficulty === 'beginner' ? 'badge-aurora' : selectedModule.difficulty === 'intermediate' ? 'badge-ice' : 'badge-frost'}`}>
                    {selectedModule.difficulty}
                  </span>
                  <h2 className="modal-module-title">{selectedModule.title}</h2>
                </div>

                <div className="modal-topbar-actions">
                  <Link
                    href={`/learning/${selectedModule.id}`}
                    className="modal-action-btn"
                    title="Open Full Page View"
                  >
                    <ExternalLink size={14} /> Full View
                  </Link>
                  <button
                    className="modal-close-btn"
                    onClick={() => setSelectedModule(null)}
                    aria-label="Close reader"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Stepper Tabs */}
              <div className="modal-chapter-tabs">
                {modalChapters.map((ch, idx) => {
                  const isCur = idx === activeChapterIdx;
                  const isDone = completedChapters[`${selectedModule.id}-${idx}`];
                  return (
                    <button
                      key={ch.id}
                      className={`modal-ch-tab ${isCur ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                      onClick={() => {
                        setActiveChapterIdx(idx);
                        setModalKnowledgeAnswer(null);
                      }}
                    >
                      <span className="modal-ch-number">
                        {isDone ? <Check size={12} className="text-aurora" /> : idx + 1}
                      </span>
                      <span className="modal-ch-label">{ch.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Main Reading Content */}
              <div className="modal-scroll-body">
                <div className="modal-chapter-heading">
                  <span className="chapter-kicker">
                    Chapter {activeChapterIdx + 1} of {modalChapters.length}
                  </span>
                  <h3>{currentModalChapter.title}</h3>
                  {currentModalChapter.subtitle && (
                    <p className="chapter-lead">{currentModalChapter.subtitle}</p>
                  )}
                </div>

                {/* Chapter Photo */}
                {currentModalChapter.mediaUrl && (
                  <div className="modal-media-wrap">
                    <img
                      src={currentModalChapter.mediaUrl}
                      alt={currentModalChapter.caption || currentModalChapter.title}
                      className="modal-chapter-img"
                    />
                    {currentModalChapter.caption && (
                      <div className="modal-img-caption">
                        <Sparkles size={12} className="text-cyan" />
                        <span>{currentModalChapter.caption}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Prose Text */}
                <div className="modal-prose">
                  {currentModalChapter.content.split('\n\n').map((paragraph, pIdx) => (
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

                {/* Key Takeaways */}
                {currentModalChapter.keyTakeaways && currentModalChapter.keyTakeaways.length > 0 && (
                  <div className="modal-takeaways-card">
                    <div className="takeaways-title">
                      <Lightbulb size={16} className="text-warm" />
                      <h4>Key Scientific Takeaways</h4>
                    </div>
                    <ul className="modal-takeaways-list">
                      {currentModalChapter.keyTakeaways.map((item, tIdx) => (
                        <li key={tIdx}>
                          <div className="modal-takeaway-check">
                            <Check size={11} />
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Verified Research Sources */}
                {selectedModule.sourceResources && selectedModule.sourceResources.length > 0 && (
                  <div className="modal-sources-bar">
                    <span className="sources-label"><FileText size={13} /> Verified Sources:</span>
                    <div className="sources-tags">
                      {selectedModule.sourceResources.map(resId => {
                        const r = getResourceById(resId);
                        return (
                          <Link
                            key={resId}
                            href={`/repository/${resId}`}
                            className="source-badge-link"
                          >
                            <span>{resId.toUpperCase()}</span>
                            <span>{r?.title ? `· ${r.title.slice(0, 30)}...` : ''}</span>
                            <ExternalLink size={10} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrevModalChapter}
                  disabled={activeChapterIdx === 0}
                >
                  <ArrowLeft size={14} /> Previous Chapter
                </button>

                <div className="modal-progress-indicator">
                  <span>Chapter {activeChapterIdx + 1} of {modalChapters.length}</span>
                </div>

                {isLastModalChapter ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setCompletedChapters(prev => ({
                        ...prev,
                        [`${selectedModule.id}-${activeChapterIdx}`]: true,
                      }));
                      setSelectedModule(null);
                      setActiveTab('quiz');
                    }}
                  >
                    <Award size={15} /> Complete Course & Take Quiz <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleNextModalChapter}
                  >
                    Next Chapter <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function LearningHubPage() {
  return (
    <Suspense fallback={<div className="learning-loading">Loading Polar Archive...</div>}>
      <LearningHubContent />
    </Suspense>
  );
}
