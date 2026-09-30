'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { sampleOutreachPackage, reports } from '@/lib/data';
import './page.css';
import {
  Megaphone, FileText, Share2, Camera, Globe, GraduationCap,
  BookOpen, MessageSquare, Sparkles, ArrowRight, Check, Edit,
  Eye, Copy, ChevronDown, ChevronUp, Video, Volume2
} from 'lucide-react';

const outputIcons: Record<string, React.ReactNode> = {
  research_highlight: <Sparkles size={18} />,
  website_article: <Globe size={18} />,
  linkedin: <Share2 size={18} />,
  instagram: <Camera size={18} />,
  short_social: <MessageSquare size={18} />,
  student_explanation: <GraduationCap size={18} />,
  teacher_resource: <BookOpen size={18} />,
  quiz: <FileText size={18} />,
  newsletter: <FileText size={18} />,
  data_reel: <Video size={18} />,
  data_sonification: <Volume2 size={18} />,
};

const outputColors: Record<string, string> = {
  research_highlight: 'var(--ice-500)',
  website_article: 'var(--cyan-500)',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  short_social: 'var(--warm-500)',
  student_explanation: 'var(--aurora-500)',
  teacher_resource: 'var(--frost-500)',
  data_reel: '#FF0050',
  data_sonification: 'var(--navy-400)',
};

export default function OutreachStudioPage() {
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const pkg = sampleOutreachPackage;
  const [outputs, setOutputs] = useState(pkg.outputs);

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApprove = (id: string) => {
    setOutputs(prev => prev.map(out => 
      out.id === id ? { ...out, status: 'approved' } : out
    ));
    alert('Output approved successfully!');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  return (
    <AppLayout>
      <div className="outreach-page">
        {/* Header */}
        <div className="outreach-header">
          <div className="outreach-header-bg" />
          <div className="outreach-header-content">
            <div className="page-breadcrumb">
              <Link href="/">Home</Link> / <span>Outreach Studio</span>
            </div>
            <div className="outreach-title-row">
              <div className="outreach-icon-wrap">
                <Megaphone size={24} />
              </div>
              <div>
                <h1>POLARA Outreach Studio</h1>
                <p>Convert verified scientific knowledge and datasets into publication-ready text, media reels, and sonified audio.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Source Selection */}
        <div className="source-section">
          <h2>One Source → Many Outputs</h2>
          <p>Select a verified research resource to generate multi-format outreach content</p>

          <div className="source-card">
            <div className="source-card-icon"><FileText size={20} /></div>
            <div className="source-card-info">
              <span className="source-card-type badge badge-ice">Report + Dataset</span>
              <h3>{pkg.sourceResourceTitle}</h3>
              <span className="source-card-meta">
                Published · {reports[0]?.researchArea} · {reports[0]?.year}
              </span>
            </div>
            <span className="badge badge-aurora">Source Selected</span>
          </div>
        </div>

        {/* Output Cards */}
        <div className="outputs-section">
          <h2>Generated Outreach Package</h2>
          <p>Each output is generated from the source document. All drafts require review before publishing.</p>

          <div className="outputs-grid">
            {outputs.map((output, i) => {
              const isExpanded = expandedCards.has(output.id);
              const color = outputColors[output.type] || 'var(--ice-500)';

              return (
                <div key={output.id} className="output-card" style={{ animationDelay: `${i * 80}ms`, borderColor: output.status === 'approved' ? '#10B981' : undefined }}>
                  <div className="output-card-header">
                    <div className="output-card-icon" style={{ color, background: `${color}15` }}>
                      {outputIcons[output.type]}
                    </div>
                    <div className="output-card-title">
                      <span className="output-type-label">
                        {output.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <h4>{output.title}</h4>
                    </div>
                    <div className="output-card-status">
                      {output.status === 'approved' ? (
                        <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <Check size={10} /> Approved
                        </span>
                      ) : (
                        <span className="status-badge status-ai">
                          <Sparkles size={10} /> AI Generated
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`output-card-body ${isExpanded ? 'expanded' : ''}`}>
                    <div className="output-preview">
                      {output.content.substring(0, isExpanded ? undefined : 200)}
                      {!isExpanded && output.content.length > 200 && '...'}
                    </div>
                  </div>

                  <div className="output-card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleExpand(output.id)} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                    <div className="output-action-group">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(output.content)} aria-label="Copy to clipboard"><Copy size={14} /> Copy</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => alert('Edit view coming soon')}><Edit size={14} /> Edit</button>
                      <button className="btn btn-secondary btn-sm" aria-label="Review"><Eye size={14} /> Review</button>
                      {output.status !== 'approved' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(output.id)}><Check size={14} /> Approve</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow */}
        <div className="workflow-section">
          <h2>Content Approval Workflow</h2>
          <div className="workflow-steps">
            {[
              { label: 'Generated', desc: 'AI creates draft', active: true },
              { label: 'Draft', desc: 'Content saved', active: true },
              { label: 'Review', desc: 'Editor reviews', active: false },
              { label: 'Approved', desc: 'Content verified', active: false },
              { label: 'Published', desc: 'Live on platform', active: false },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <div className={`workflow-step ${step.active ? 'active' : ''}`}>
                  <div className="workflow-step-dot" />
                  <span className="workflow-step-label">{step.label}</span>
                  <span className="workflow-step-desc">{step.desc}</span>
                </div>
                {i < 4 && <div className="workflow-connector" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        
      </div>
    </AppLayout>
  );
}
