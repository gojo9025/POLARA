'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import './page.css';
import {
  MessageCircle, Send, Sparkles, FileText, User, BookOpen,
  GraduationCap, Globe, Microscope, Copy, Check, Download,
  RotateCcw, Key, Settings, ExternalLink, Zap, AlertCircle,
  CheckCircle2, RefreshCw, X, ShieldAlert, Cpu
} from 'lucide-react';
import { askPolarAI, getStoredGeminiKey, setStoredGeminiKey, verifyGeminiKey, getServerAIStatus } from '@/lib/ai';
import { useToast } from '@/lib/toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; type: string; page?: number; id?: string; relevance?: number }[];
  mode?: string;
  modelUsed?: string;
  suggestions?: string[];
  warning?: string;
}

export default function AskPolaraPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'research' | 'student' | 'educator' | 'public'>('research');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // API Key State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [serverHasKey, setServerHasKey] = useState(false);
  
  // Quick Setup Banner State
  const [showBanner, setShowBanner] = useState(true);
  const [inlineKeyInput, setInlineKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{ valid: boolean; message: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { success, info, error: toastError } = useToast();

  useEffect(() => {
    // 1. Check local browser storage key
    const key = getStoredGeminiKey();
    if (key) {
      setApiKeyInput(key);
      setInlineKeyInput(key);
      setHasCustomKey(true);
    }

    // 2. Check server environment (.env.local) status
    getServerAIStatus().then((status) => {
      if (status.hasServerKey) {
        setServerHasKey(true);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const isGeminiActive = hasCustomKey || serverHasKey;

  // Verify and Save key from Quick Banner
  const handleConnectInlineKey = async () => {
    const keyToTest = inlineKeyInput.trim();
    if (!keyToTest) return;

    setIsVerifying(true);
    setVerificationFeedback(null);

    const result = await verifyGeminiKey(keyToTest);
    setIsVerifying(false);

    if (result.valid) {
      setStoredGeminiKey(keyToTest);
      setApiKeyInput(keyToTest);
      setHasCustomKey(true);
      setVerificationFeedback({ valid: true, message: 'Google Gemini 1.5 Flash verified and active!' });
      success('Gemini Connected', 'Real-time Google Gemini completions enabled for Ask POLARA!');
    } else {
      setVerificationFeedback({ valid: false, message: result.error || 'Invalid API Key. Please verify key from AI Studio.' });
      toastError('Connection Failed', result.error || 'Gemini API rejected key');
    }
  };

  // Verify key in Settings Modal
  const handleTestKeyInModal = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      toastError('Empty Key', 'Please enter an API key to test');
      return;
    }
    setIsVerifying(true);
    setVerificationFeedback(null);
    const result = await verifyGeminiKey(keyToTest);
    setIsVerifying(false);
    if (result.valid) {
      setVerificationFeedback({ valid: true, message: '✓ Key Verified: Gemini 1.5 Flash is operational!' });
      success('Key Verified', 'API Key confirmed operational with Google');
    } else {
      setVerificationFeedback({ valid: false, message: `✗ Verification error: ${result.error || 'API Key Invalid'}` });
      toastError('Invalid Key', result.error || 'Key was rejected by Google Gemini');
    }
  };

  const handleSaveModalKey = () => {
    setStoredGeminiKey(apiKeyInput);
    setHasCustomKey(!!apiKeyInput.trim());
    setShowKeyModal(false);
    if (apiKeyInput.trim()) {
      success('Gemini Key Saved', 'Google Gemini 1.5 Flash activated for your session.');
    } else {
      info('Key Cleared', 'Switched back to POLARA Neural Knowledge Engine');
    }
  };

  const handleDisconnectKey = () => {
    setStoredGeminiKey('');
    setApiKeyInput('');
    setInlineKeyInput('');
    setHasCustomKey(false);
    setVerificationFeedback(null);
    setShowKeyModal(false);
    info('Gemini Disconnected', 'Reset to built-in POLARA Neural Engine');
  };

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      mode,
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customQuery) setInput('');
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await askPolarAI({
        prompt: textToSend,
        messages: [...historyPayload, { role: 'user', content: textToSend }],
        mode,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        mode,
        modelUsed: res.modelUsed,
        suggestions: res.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**POLARA Science Assistant Notice:**\nWe encountered a temporary network variance (${(err as Error).message}). POLARA's local archive indices are still accessible. Please select one of the core topics below or retry your query.`,
        sources: [
          { title: 'Antarctic Sea Ice Extent and Variability: Observations from ISEA-44', type: 'Report', id: 'rep1' },
          { title: 'Himadri Station Meteorological Records', type: 'Dataset', id: 'ds4' }
        ],
        mode,
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    success('Copied', 'Response text copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) return;
    const transcript = `# POLARA AI Research Session Transcript\nDate: ${new Date().toISOString()}\nMode: ${mode}\nEngine: ${isGeminiActive ? 'Google Gemini 1.5 Flash' : 'POLARA Neural RAG'}\n\n` +
      messages.map(m => `### ${m.role === 'user' ? 'Scientist / Inquirer' : 'POLARA AI'}:\n${m.content}\n\n${m.sources?.length ? `*Sources Cited:*\n${m.sources.map(s => `- ${s.title} (${s.type})`).join('\n')}\n` : ''}`).join('\n---\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polara-ai-session-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    success('Transcript Exported', 'Downloaded markdown session log');
  };

  const handleReset = () => {
    setMessages([]);
    info('Conversation Cleared', 'Starting a new inquiry session');
  };

  const modes = [
    { key: 'research' as const, label: 'Research', icon: <Microscope size={14} />, desc: 'Technical & quantitative data' },
    { key: 'student' as const, label: 'Student', icon: <GraduationCap size={14} />, desc: 'Pedagogical & intuitive analogies' },
    { key: 'educator' as const, label: 'Educator', icon: <BookOpen size={14} />, desc: 'Curriculum & lesson concepts' },
    { key: 'public' as const, label: 'Public', icon: <Globe size={14} />, desc: 'High-impact climate awareness' },
  ];

  return (
    <AppLayout>
      <div className="ask-page">
        {/* Header */}
        <div className="ask-header">
          <div className="ask-title">
            <div className="ask-icon-wrap">
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1>Ask POLARA</h1>
                <span
                  className={`badge ${isGeminiActive ? 'badge-aurora' : 'badge-cyan'}`}
                  style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  {isGeminiActive ? <Zap size={12} className="text-aurora" /> : <Cpu size={12} />}
                  {isGeminiActive ? 'Google Gemini 1.5 Flash' : 'POLARA Grounded RAG'}
                </span>
              </div>
              <p>Source-grounded answers powered by NCPOR scientific records and multi-expedition telemetry</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${isGeminiActive ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              onClick={() => {
                setVerificationFeedback(null);
                setShowKeyModal(true);
              }}
              title="Configure Google Gemini API Key"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Key size={14} />
              <span>{isGeminiActive ? 'Gemini Key (Active)' : 'Connect Gemini Key'}</span>
            </button>

            {messages.length > 0 && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleDownloadTranscript}
                  title="Export session transcript"
                >
                  <Download size={14} />
                  <span>Export</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleReset}
                  title="Clear conversation"
                >
                  <RotateCcw size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mode Selector Strip */}
        <div className="mode-strip">
          <div className="mode-selector">
            <span className="mode-label">Scientific Persona:</span>
            {modes.map(m => (
              <button
                key={m.key}
                className={`mode-btn ${mode === m.key ? 'active' : ''}`}
                onClick={() => setMode(m.key)}
                title={m.desc}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          <span className="ground-truth-label">
            Ground Truth: ISEA-44 • IndARC-14 • ISOE-13 • Chandra Basin
          </span>
        </div>

        {/* Messages & Interactive Area */}
        <div className="messages-area">
          {/* Active Key Status Bar (When Gemini is Connected) */}
          {isGeminiActive ? (
            <div className="gemini-connected-bar">
              <div className="connected-left">
                <span className="live-dot-green" />
                <span className="connected-title">Google Gemini 1.5 Flash Connected & Active</span>
                <span className="connected-source-badge">
                  {serverHasKey ? 'Configured via .env.local' : 'Stored in Browser Storage'}
                </span>
              </div>
              <button
                className="btn-configure-link"
                onClick={() => {
                  setVerificationFeedback(null);
                  setShowKeyModal(true);
                }}
              >
                Configure / Switch Key
              </button>
            </div>
          ) : showBanner ? (
            /* Quick Connect Banner (When NO Key is Set Yet) */
            <div className="gemini-connect-banner">
              <div className="banner-top">
                <div className="banner-icon-pulse">
                  <Key size={20} />
                </div>
                <div className="banner-text">
                  <h3>Activate Google Gemini API in Ask POLARA</h3>
                  <p>
                    Paste your Google Gemini API key to activate real-time web-scale reasoning calibrated with POLARA&apos;s polar archive records.
                  </p>
                </div>
                <button
                  className="banner-close-btn"
                  onClick={() => setShowBanner(false)}
                  title="Dismiss banner (use built-in RAG)"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="banner-form-row">
                <div className="banner-input-wrapper">
                  <Key size={15} className="banner-input-icon" />
                  <input
                    type="password"
                    placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
                    value={inlineKeyInput}
                    onChange={e => setInlineKeyInput(e.target.value)}
                    className="banner-key-input"
                    disabled={isVerifying}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleConnectInlineKey();
                    }}
                  />
                </div>
                <button
                  className="btn btn-primary btn-connect-key"
                  onClick={handleConnectInlineKey}
                  disabled={!inlineKeyInput.trim() || isVerifying}
                >
                  {isVerifying ? <RefreshCw size={14} className="spin-icon" /> : <Zap size={14} />}
                  <span>{isVerifying ? 'Verifying...' : 'Connect Gemini'}</span>
                </button>
              </div>

              {verificationFeedback && (
                <div className={`verification-msg ${verificationFeedback.valid ? 'success' : 'error'}`}>
                  {verificationFeedback.valid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{verificationFeedback.message}</span>
                </div>
              )}

              <div className="banner-footer-links">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="banner-ext-link"
                >
                  Get a free Gemini API Key from Google AI Studio <ExternalLink size={12} />
                </a>
                <span className="banner-note">
                  Key is saved securely in your browser or can be set in <code>.env.local</code>.
                </span>
              </div>
            </div>
          ) : null}

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Sparkles size={36} />
              </div>
              <h3>Explore Grounded Polar Science</h3>
              <p>Inquire about Antarctic sea ice loss, Arctic amplification, glacier physics, or marine acoustics.</p>

              <div className="suggestion-grid">
                {[
                  'What did ISEA-44 discover about Antarctic sea ice?',
                  'How does Arctic warming influence the Indian monsoon?',
                  'Describe India’s Bharati station in the Larsemann Hills',
                  'What sounds do Weddell seals and icebergs make underwater?',
                  'Explain the data variables in Southern Ocean CTD profiles',
                  'What are psychrophilic extremophiles in Antarctic lakes?'
                ].map(q => (
                  <button
                    key={q}
                    className="suggestion-btn"
                    onClick={() => handleSend(q)}
                  >
                    <MessageCircle size={14} />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Thread */}
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className="message-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  {msg.role === 'user' ? (
                    <span className="message-mode">{msg.mode} inquiry</span>
                  ) : (
                    <span className="badge badge-ice" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      {msg.modelUsed?.includes('gemini') ? `✨ ${msg.modelUsed}` : '⚡ POLARA Grounded RAG'}
                    </span>
                  )}
                  {msg.role === 'assistant' && (
                    <button
                      className="btn-icon"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      title="Copy response"
                      style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                    >
                      {copiedId === msg.id ? <Check size={14} style={{ color: 'var(--aurora-400)' }} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>

                <div className="prose">
                  {msg.content.split('\n\n').map((para, i) => (
                    <p key={i}>
                      {para.split(/(\*\*.*?\*\*)/g).map((chunk, j) => {
                        if (chunk.startsWith('**') && chunk.endsWith('**')) {
                          return <strong key={j}>{chunk.slice(2, -2)}</strong>;
                        }
                        return chunk;
                      })}
                    </p>
                  ))}
                </div>

                {/* Sources Card */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources-container">
                    <div className="sources-heading">
                      <FileText size={12} />
                      <span>Archive Ground Truth References</span>
                    </div>
                    <div className="source-cards">
                      {msg.sources.map((s, idx) => (
                        <div key={idx} className="source-card">
                          <div className="source-meta">
                            <span className="source-type">{s.type}</span>
                            {s.page && <span className="source-page">Pg. {s.page}</span>}
                            {s.relevance && <span className="source-relevance">{Math.round(s.relevance * 100)}% Match</span>}
                          </div>
                          <div className="source-title-link">
                            {s.id ? (
                              <Link href={`/repository/${s.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {s.title}
                              </Link>
                            ) : (
                              <span>{s.title}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="followup-suggestions">
                    <span className="followup-label">Follow-up:</span>
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        className="followup-btn"
                        onClick={() => handleSend(sug)}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar">
                <Sparkles size={16} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="ask-input-area">
          <div className="input-bar">
            <input
              type="text"
              className="input"
              placeholder={`Ask POLARA about polar research in ${mode} mode...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
            >
              <Send size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            <span>Answers ground strictly in NCPOR research datasets and published literature.</span>
            <span>Press Enter to inquire</span>
          </div>
        </div>

        {/* Gemini API Key Modal */}
        {showKeyModal && (
          <div className="modal-backdrop" onClick={() => setShowKeyModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(30, 62, 98, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ice-400)' }}>
                  <Key size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Google Gemini AI Settings</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Power Ask POLARA with Google Gemini 1.5 Flash
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                POLARA supports live Google Gemini completions with NCPOR ground truth citations.
                You can save your API key here in your browser, or configure it globally in <code>.env.local</code>.
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#fff' }}>
                  Google Gemini API Key:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    className="input"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setVerificationFeedback(null);
                    }}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleTestKeyInModal}
                    disabled={!apiKeyInput.trim() || isVerifying}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {isVerifying ? <RefreshCw size={13} className="spin-icon" /> : <CheckCircle2 size={13} />}
                    <span>Test Key</span>
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                  Your key is never stored on external third-party servers.
                </span>
              </div>

              {verificationFeedback && (
                <div className={`verification-msg ${verificationFeedback.valid ? 'success' : 'error'}`} style={{ marginBottom: '16px' }}>
                  {verificationFeedback.valid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{verificationFeedback.message}</span>
                </div>
              )}

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '20px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <strong>Server Environment Alternative:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-tertiary)' }}>
                  Add <code>GEMINI_API_KEY=AIzaSy...</code> to your project&apos;s <code>.env.local</code> file to enable it automatically across all browsers.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {hasCustomKey ? (
                  <button className="btn btn-danger btn-sm" onClick={handleDisconnectKey}>
                    Remove Key
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowKeyModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveModalKey}>
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
