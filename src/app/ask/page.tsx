'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import './page.css';
import {
  MessageCircle, Send, Sparkles, FileText, User, BookOpen,
  GraduationCap, Globe, Microscope, Copy, Check, Download,
  RotateCcw, Key, Settings, ExternalLink, Zap
} from 'lucide-react';
import { askPolarAI, getStoredGeminiKey, setStoredGeminiKey } from '@/lib/ai';
import { useToast } from '@/lib/toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; type: string; page?: number; id?: string; relevance?: number }[];
  mode?: string;
  modelUsed?: string;
  suggestions?: string[];
}

export default function AskPolaraPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'research' | 'student' | 'educator' | 'public'>('research');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // API Key Settings Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { success, info } = useToast();

  useEffect(() => {
    const key = getStoredGeminiKey();
    if (key) {
      setApiKeyInput(key);
      setHasCustomKey(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSaveKey = () => {
    setStoredGeminiKey(apiKeyInput);
    setHasCustomKey(!!apiKeyInput.trim());
    setShowKeyModal(false);
    if (apiKeyInput.trim()) {
      success('Gemini Key Activated', 'Live Google Gemini 1.5 Flash completions enabled!');
    } else {
      info('Key Cleared', 'Switched back to POLARA Neural Knowledge Engine');
    }
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
    const transcript = `# POLARA AI Research Session Transcript\nDate: ${new Date().toISOString()}\nMode: ${mode}\nEngine: ${hasCustomKey ? 'Google Gemini 1.5 Flash' : 'POLARA Neural RAG'}\n\n` +
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
                <span className={`badge ${hasCustomKey ? 'badge-aurora' : 'badge-cyan'}`} style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {hasCustomKey ? <Zap size={12} /> : <Sparkles size={12} />}
                  {hasCustomKey ? 'Gemini 1.5 Flash' : 'Polar Neural RAG'}
                </span>
              </div>
              <p>Source-grounded answers powered by NCPOR scientific records and multi-expedition telemetry</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowKeyModal(true)}
              title="Configure Google Gemini API Key"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Key size={14} />
              <span>{hasCustomKey ? 'Gemini Key (Active)' : 'AI Key Settings'}</span>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'var(--navy-900)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
          <div className="mode-selector" style={{ margin: 0 }}>
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
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            Ground Truth: ISEA-44 • IndARC-14 • ISOE-13 • Chandra Basin
          </span>
        </div>

        {/* Messages */}
        <div className="messages-area">
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
                      {msg.modelUsed === 'gemini-1.5-flash' ? '✨ Gemini 1.5 Flash' : '⚡ POLARA Grounded RAG'}
                    </span>
                  )}
                  {msg.role === 'assistant' && (
                    <button
                      className="btn-icon"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      title="Copy response"
                      style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                    >
                      {copiedId === msg.id ? <Check size={14} color="var(--aurora-400)" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>

                <div className="message-text" dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/### (.*?)\n/g, '<h4 style="color:var(--ice-300); margin: 12px 0 6px 0;">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/• (.*?)(\n|$)/g, '<li style="margin-left: 18px; margin-bottom: 4px;">$1</li>')
                    .replace(/\n\n/g, '<br/><br/>')
                    .replace(/\n/g, '<br/>')
                }} />

                {/* Sources list */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="message-sources" style={{ marginTop: '16px' }}>
                    <h5>Verified Archival Sources</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', marginTop: '6px' }}>
                      {msg.sources.map((src, i) => (
                        <div key={i} className="source-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <FileText size={14} color="var(--ice-400)" style={{ flexShrink: 0 }} />
                            <span className="source-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{src.title}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span className="source-type badge badge-cyan" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{src.type}</span>
                            {src.id && (
                              <Link href={`/repository/${src.id}`} className="btn-icon" title="View resource detail">
                                <ExternalLink size={12} />
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic follow-up suggestion chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', width: '100%', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Recommended Follow-ups:
                    </span>
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s)}
                        style={{
                          fontSize: '0.78rem',
                          padding: '4px 10px',
                          borderRadius: '14px',
                          background: 'rgba(56, 182, 230, 0.08)',
                          border: '1px solid rgba(56, 182, 230, 0.25)',
                          color: 'var(--ice-200)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        ↳ {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar"><Sparkles size={16} /></div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span>Synthesizing polar telemetry & literature</span>
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-bar">
            <input
              type="text"
              className="input"
              placeholder={`Ask POLARA in ${mode} mode (e.g. "Explain the fast ice deficit at Bharati Station")...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
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
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 182, 230, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ice-400)' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>AI Intelligence Settings</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Google Gemini 1.5 Flash / POLARA Neural Engine
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                POLARA features an integrated domain-grounded polar knowledge engine. To unlock live dynamic web-scale completions, you can optionally provide your Google Gemini API Key.
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Google Gemini API Key:
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  style={{ width: '100%', fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                  Stored securely in your local browser storage. Leave empty to use POLARA&apos;s built-in neural RAG.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setShowKeyModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveKey}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
