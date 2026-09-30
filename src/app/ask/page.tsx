'use client';

import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import './page.css';
import {
  MessageCircle, Send, Sparkles, FileText, User, BookOpen,
  GraduationCap, Globe, Microscope, ArrowRight, RotateCcw
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; type: string; page?: number }[];
  mode?: string;
}

const sampleResponses: Record<string, { answer: string; sources: { title: string; type: string; page?: number }[] }> = {
  'sea ice': {
    answer: `Based on observations from the 44th Indian Scientific Expedition to Antarctica (ISEA-44), sea ice extent in the Indian Ocean sector showed significant variability during the 2024-25 austral summer.

**Key findings:**

1. **Below-average extent**: Sea ice extent was approximately **12% below the long-term average** in the Indian Ocean sector during the observation period (November 2024 – April 2025).

2. **Delayed ice formation**: Fast ice formation around Bharati Station occurred approximately **2 weeks later** than the 2010-2020 decadal average, suggesting warming trends in the coastal marine environment.

3. **Measurement agreement**: Ship-based electromagnetic induction measurements showed excellent correlation with satellite-derived data (r² = 0.94), giving high confidence in the observations.

4. **Spatial variability**: First-year ice thickness measurements revealed significant spatial heterogeneity, which the research team linked to local wind patterns in the Prydz Bay region.

These findings contribute to the growing body of evidence documenting changes in Antarctic sea ice patterns and have implications for understanding regional ocean circulation and ecosystem dynamics.`,
    sources: [
      { title: 'Antarctic Sea Ice Extent and Variability: Observations from ISEA-44', type: 'Report', page: 12 },
      { title: 'Antarctic Sea Ice Concentration — Indian Ocean Sector (2024-25)', type: 'Dataset' },
      { title: 'Declining sea ice trends in the Indian Ocean sector of Antarctica', type: 'Publication' },
    ],
  },
  'default': {
    answer: `I'd be happy to help you explore polar science knowledge! Based on the POLARA repository, I can answer questions about:

• **Antarctic expeditions** — India's scientific expeditions to Antarctica, including observations from Maitri and Bharati stations
• **Arctic research** — Studies from the Himadri station in Svalbard, including Arctic amplification research
• **Southern Ocean** — Hydrographic surveys, Argo float deployments, and ocean observation data
• **Climate science** — Sea ice trends, teleconnections between Arctic changes and the Indian monsoon
• **Polar biology** — Microbial diversity, extremophiles, and biodiversity studies
• **Glaciology** — Ice core studies, glacier mass balance, and ice dynamics

Please ask a specific question and I'll search the knowledge repository for source-grounded answers.`,
    sources: [],
  },
};

export default function AskPolaraPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'research' | 'student' | 'educator' | 'public'>('research');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      mode,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const query = input.toLowerCase();
      const matchKey = Object.keys(sampleResponses).find(k => k !== 'default' && query.includes(k)) || 'default';
      const response = sampleResponses[matchKey];

      let answer = response.answer;
      if (mode === 'student' && matchKey !== 'default') {
        answer = `## Simple Explanation 🎓\n\nImagine the ocean around Antarctica as a giant frozen pond. Scientists from India went there and measured how much of it was frozen.\n\nHere's what they found:\n\n🧊 **Less ice than usual** — About 12% less frozen ocean than what's been normal in recent years.\n\n⏰ **Ice formed late** — The ice near India's Bharati station started freezing about 2 weeks later than it usually does.\n\n📡 **Double-checked results** — They measured from their ship AND from satellites in space, and got almost the same answers!\n\n🌡️ **Why it matters** — When there's less ice, the dark ocean water absorbs more heat from the sun, which makes things even warmer. It's like a warming cycle.\n\nPretty cool (pun intended!) that Indian scientists travel all the way to Antarctica to help us understand how our planet is changing! 🌍`;
      } else if (mode === 'public' && matchKey !== 'default') {
        answer = `## Antarctica's Ocean Ice Is Changing 🌊\n\nIndia's latest Antarctic expedition found that the frozen ocean around Antarctica is shrinking. During their 44th expedition, scientists discovered:\n\n**12% less ice** than what has been normal in recent years.\n\nWhy should we care? Sea ice acts like a giant mirror, reflecting sunlight back into space. When there's less of it, the ocean absorbs more heat — making things warmer in a cycle that's hard to stop.\n\nIndian researchers at the Bharati station also noticed ice forming later in the season, another sign of warming in this remote part of the world.\n\nThe good news? Scientists are watching these changes closely, using both ships and satellites to track what's happening — giving us the data we need to understand and respond to climate change.`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        sources: response.sources,
        mode,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const modes = [
    { key: 'research' as const, label: 'Research', icon: <Microscope size={14} />, desc: 'Technical language' },
    { key: 'student' as const, label: 'Student', icon: <GraduationCap size={14} />, desc: 'Simple language' },
    { key: 'educator' as const, label: 'Educator', icon: <BookOpen size={14} />, desc: 'Teaching-oriented' },
    { key: 'public' as const, label: 'Public', icon: <Globe size={14} />, desc: 'Plain language' },
  ];

  return (
    <AppLayout>
      <div className="ask-page">
        {/* Header */}
        <div className="ask-header">
          <div className="ask-title">
            <div className="ask-icon-wrap">
              <MessageCircle size={24} />
            </div>
            <div>
              <h1>Ask POLARA</h1>
              <p>Source-grounded answers from the polar science knowledge repository</p>
            </div>
          </div>

          <div className="mode-selector">
            <span className="mode-label">Response Mode:</span>
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
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Sparkles size={32} />
              </div>
              <h3>Ask about polar science</h3>
              <p>Get source-grounded answers from POLARA&apos;s knowledge repository</p>

              <div className="suggestion-grid">
                {[
                  'What research has been conducted on Antarctic sea ice?',
                  'Explain Arctic amplification in simple terms',
                  'What datasets are from the Southern Ocean expedition?',
                  'Tell me about microbial life in Antarctic lakes',
                ].map(q => (
                  <button
                    key={q}
                    className="suggestion-btn"
                    onClick={() => { setInput(q); }}
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
                {msg.role === 'user' && msg.mode && (
                  <span className="message-mode">{msg.mode} mode</span>
                )}
                <div className="message-text" dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/## (.*?)(\n|$)/g, '<h4>$1</h4>')
                    .replace(/• (.*?)(\n|$)/g, '<li>$1</li>')
                    .replace(/\n\n/g, '<br/><br/>')
                    .replace(/\n/g, '<br/>')
                    .replace(/(🧊|⏰|📡|🌡️|🎓|🌊|🌍)/g, '<span style="font-size:1.2em">$1</span>')
                }} />

                {msg.sources && msg.sources.length > 0 && (
                  <div className="message-sources">
                    <h5>Sources</h5>
                    {msg.sources.map((src, i) => (
                      <div key={i} className="source-item">
                        <FileText size={12} />
                        <span className="source-title">{src.title}</span>
                        <span className="source-type">{src.type}</span>
                        {src.page && <span className="source-page">Page {src.page}</span>}
                      </div>
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
                  <span>Searching knowledge repository</span>
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
              placeholder="Ask about polar science..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="input-note">
            Answers are grounded in the POLARA knowledge repository. Sources are cited with each response.
          </p>
        </div>
      </div>

      
    </AppLayout>
  );
}
