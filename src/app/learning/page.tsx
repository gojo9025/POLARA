'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { learningModules, glossaryTerms, sampleQuiz } from '@/lib/data';
import './page.css';
import {
  GraduationCap, BookOpen, Sparkles, Play, HelpCircle,
  ArrowRight, Check, X, RotateCcw, Clock, Star
} from 'lucide-react';

export default function LearningHubPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'quiz' | 'glossary'>('modules');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const quiz = sampleQuiz;

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === quiz.questions[currentQ].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0); setSelectedAnswer(null); setScore(0);
    setQuizComplete(false); setQuizStarted(false);
  };

  return (
    <AppLayout>
      <div className="learning-page">
        <div className="learning-header">
          <div className="learning-header-bg" />
          <div className="learning-header-content">
            <div className="page-breadcrumb">
              <Link href="/">Home</Link> / <span>Learning Hub</span>
            </div>
            <h1><GraduationCap size={32} /> Learning Hub</h1>
            <p>Educational resources, quizzes, and explainers from polar science research</p>

            <div className="tab-bar">
              {[
                { key: 'modules' as const, label: 'Learning Modules', icon: <BookOpen size={16} /> },
                { key: 'quiz' as const, label: 'Quizzes', icon: <HelpCircle size={16} /> },
                { key: 'glossary' as const, label: 'Glossary', icon: <Sparkles size={16} /> },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="learning-body">
          {/* Learning Modules */}
          {activeTab === 'modules' && (
            <div className="modules-grid">
              {learningModules.map((module, i) => (
                <div key={module.id} className="module-card" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="module-image" />
                  <div className="module-content">
                    <div className="module-meta">
                      <span className={`badge ${module.difficulty === 'beginner' ? 'badge-aurora' : module.difficulty === 'intermediate' ? 'badge-ice' : 'badge-frost'}`}>
                        {module.difficulty}
                      </span>
                      <span className="module-time"><Clock size={12} /> {module.estimatedTime}</span>
                    </div>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                    <div className="module-topics">
                      {module.topics.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                    <div className="module-footer">
                      <span className="module-audience">{module.targetAudience}</span>
                      <button className="btn btn-primary btn-sm">
                        Start Learning <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quiz */}
          {activeTab === 'quiz' && (
            <div className="quiz-section">
              {!quizStarted ? (
                <div className="quiz-intro">
                  <div className="quiz-intro-icon"><HelpCircle size={32} /></div>
                  <h2>{quiz.title}</h2>
                  <p>{quiz.questions.length} questions · {quiz.difficulty} difficulty</p>
                  <p>Generated from: Antarctic Sea Ice Observation Report</p>
                  <button className="btn btn-primary btn-lg" onClick={() => setQuizStarted(true)}>
                    <Play size={18} /> Start Quiz
                  </button>
                </div>
              ) : quizComplete ? (
                <div className="quiz-complete">
                  <div className="quiz-score">
                    <Star size={32} />
                    <h2>{score} / {quiz.questions.length}</h2>
                    <p>{score === quiz.questions.length ? 'Perfect score! 🎉' : score >= 3 ? 'Great job! 🌟' : 'Keep learning! 📚'}</p>
                  </div>
                  <button className="btn btn-primary" onClick={resetQuiz}>
                    <RotateCcw size={16} /> Try Again
                  </button>
                </div>
              ) : (
                <div className="quiz-active">
                  <div className="quiz-progress">
                    <span>Question {currentQ + 1} of {quiz.questions.length}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} />
                    </div>
                  </div>

                  <div className="quiz-question">
                    <h3>{quiz.questions[currentQ].question}</h3>

                    <div className="quiz-options">
                      {quiz.questions[currentQ].options.map((opt, idx) => {
                        const isCorrect = idx === quiz.questions[currentQ].correctAnswer;
                        const isSelected = selectedAnswer === idx;
                        let className = 'quiz-option';
                        if (selectedAnswer !== null) {
                          if (isCorrect) className += ' correct';
                          else if (isSelected) className += ' incorrect';
                        }

                        return (
                          <button key={idx} className={className} onClick={() => handleAnswer(idx)}>
                            <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                            <span>{opt}</span>
                            {selectedAnswer !== null && isCorrect && <Check size={16} />}
                            {selectedAnswer !== null && isSelected && !isCorrect && <X size={16} />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswer !== null && (
                      <div className="quiz-explanation">
                        <Sparkles size={14} />
                        <p>{quiz.questions[currentQ].explanation}</p>
                      </div>
                    )}

                    {selectedAnswer !== null && (
                      <button className="btn btn-primary" onClick={nextQuestion}>
                        {currentQ < quiz.questions.length - 1 ? 'Next Question' : 'See Results'} <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Glossary */}
          {activeTab === 'glossary' && (
            <div className="glossary-list">
              {glossaryTerms.map((term, i) => (
                <div key={term.id} className="glossary-card" style={{ animationDelay: `${i * 60}ms` }}>
                  <h3>{term.term}</h3>
                  <div className="glossary-def">
                    <label>Definition</label>
                    <p>{term.definition}</p>
                  </div>
                  <div className="glossary-simple">
                    <label>Simple Explanation</label>
                    <p>{term.simpleExplanation}</p>
                  </div>
                  <div className="glossary-related">
                    {term.relatedTerms.map(rt => <span key={rt} className="tag">{rt}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
      </div>
    </AppLayout>
  );
}
