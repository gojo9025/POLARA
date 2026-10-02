'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { sampleOutreachPackage, reports, datasets } from '@/lib/data';
import './page.css';
import {
  Megaphone, FileText, Share2, Camera, Globe, GraduationCap,
  BookOpen, MessageSquare, Sparkles, ArrowRight, Check, Edit,
  Eye, Copy, ChevronDown, ChevronUp, Video, Volume2, RefreshCw,
  Send, CheckCircle, Download
} from 'lucide-react';
import { askPolarAI } from '@/lib/ai';
import { useToast } from '@/lib/toast';

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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedResourceId, setSelectedResourceId] = useState<string>('rep1');
  const [customBrief, setCustomBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiModelUsed, setAiModelUsed] = useState<string | null>(null);

  const [outputs, setOutputs] = useState(sampleOutreachPackage.outputs);
  const { success, info, error: showError } = useToast();

  const allAvailableSources = [
    ...reports.map(r => ({ id: r.id, title: r.title, type: 'Report', region: r.region, area: r.researchArea, year: r.year, abstract: r.abstract, findings: r.findings })),
    ...datasets.map(d => ({ id: d.id, title: d.title, type: 'Dataset', region: d.region, area: d.researchArea, year: d.year, abstract: d.description, findings: d.variables })),
  ];

  const currentSource = allAvailableSources.find(s => s.id === selectedResourceId) || allAvailableSources[0];

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
    success('Output Approved', 'Content marked ready for publishing queue');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    success('Copied', 'Outreach copy copied to clipboard');
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await askPolarAI({
        prompt: `Generate a full multi-channel polar outreach campaign from this research document.${customBrief ? ` Target Focus: ${customBrief}` : ''}`,
        mode: 'outreach',
        context: {
          resourceTitle: currentSource.title,
          resourceType: currentSource.type,
          region: currentSource.region,
          abstract: currentSource.abstract,
          findings: currentSource.findings,
        },
      });

      setAiModelUsed(res.modelUsed);

      // Parse and update generated outputs
      const timestamp = new Date().toISOString().split('T')[0];
      const newOutputs = [
        {
          id: 'gen-art-' + Date.now(),
          type: 'website_article' as const,
          title: `Web Feature: New Discoveries in ${currentSource.region} Research`,
          content: `${res.answer}\n\n---\n*Verified Source: ${currentSource.title} (NCPOR Polar Archive)*`,
          status: 'ai_generated' as const,
          generatedAt: timestamp,
        },
        {
          id: 'gen-li-' + Date.now(),
          type: 'linkedin' as const,
          title: `Executive Briefing: ${currentSource.area} Key Findings`,
          content: `🧊 Scientific Dispatch from ${currentSource.region} — ${currentSource.title}\n\nRecent analyses from NCPOR researchers reveal significant insights into ${currentSource.area.toLowerCase()} and global climate teleconnections.\n\nKey takeaways:\n${currentSource.findings?.map(f => `• ${f}`).join('\n') || '• Multi-sensor observations verified against satellite telemetry.'}\n\nRead the full peer-reviewed data dossier in POLARA.\n#PolarScience #NCPOR #ClimateAction #IndianExpedition`,
          status: 'ai_generated' as const,
          generatedAt: timestamp,
        },
        {
          id: 'gen-ig-' + Date.now(),
          type: 'instagram' as const,
          title: `Visual Carousel Caption: Secrets of the ${currentSource.region} Cryosphere`,
          content: `❄️ What happens at the edge of the world impacts everyone.\n\nOur polar scientists have just published new data from ${currentSource.title}. From sub-zero ice sheets to deep ocean currents, explore what the numbers tell us about Earth's changing climate. 🐧🔬\n\nLink in bio to view full interactive charts on POLARA.\n#Antarctica #Arctic #PolarExploration #ScienceCommunication`,
          status: 'ai_generated' as const,
          generatedAt: timestamp,
        },
        {
          id: 'gen-edu-' + Date.now(),
          type: 'student_explanation' as const,
          title: `Student Learning Card: Understanding ${currentSource.title}`,
          content: `Did you know? Indian scientists travel over 10,000 km to study the frozen parts of our planet!\n\nHere is what they found in this study:\n${currentSource.findings?.slice(0, 3).map(f => `✨ ${f}`).join('\n') || '✨ Critical polar observations collected in sub-zero blizzards.'}\n\nWhy should students care? Because polar weather acts like Earth's thermostat!`,
          status: 'ai_generated' as const,
          generatedAt: timestamp,
        },
        {
          id: 'gen-reel-' + Date.now(),
          type: 'data_reel' as const,
          title: `Data-to-Reel Script: 15-Second Climate Micro-Video`,
          content: `🎬 [VIDEO SCRIPT]\n0:00 - 0:03: High-speed satellite flyover of ${currentSource.region}.\n0:03 - 0:08: Animated thermal anomaly overlay flashing over coordinates.\n0:08 - 0:12: Close-up of Indian research vessel cutting through pack ice.\n0:12 - 0:15: Call to action: "Explore the live data on POLARA."`,
          status: 'ai_generated' as const,
          generatedAt: timestamp,
        },
        {
          id: 'gen-sonif-' + Date.now(),
          type: 'data_sonification' as const,
          title: `Data Sonification Spec: Acoustic Representation`,
          content: `🔊 [AUDIO SYNTHESIS SPEC]\nMapping: Parameter values modulated to sine carrier frequencies (200Hz - 880Hz).\nTemporal: 1 second per seasonal cycle.\nDynamic Range: Sub-surface turbulence translated to low-frequency resonant hydrophone rumble.`,
          status: 'ai_generated' as const,
          generatedAt: timestamp,
        }
      ];

      setOutputs(newOutputs);
      success('Outreach Suite Generated', `Generated ${newOutputs.length} publication outputs with ${res.modelUsed}`);
    } catch (err: unknown) {
      showError('Generation Failed', (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportAll = () => {
    const content = outputs.map(o => `### [${o.type.toUpperCase()}] ${o.title}\nStatus: ${o.status}\nGenerated: ${o.generatedAt}\n\n${o.content}\n\n=========================\n`).join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polara-outreach-${selectedResourceId}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    success('Exported', 'Downloaded full outreach package markdown');
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1>POLARA Outreach Studio</h1>
                  <span className="badge badge-aurora" style={{ fontSize: '0.75rem' }}>
                    AI-Powered Communications
                  </span>
                </div>
                <p>Synthesize verified scientific telemetry into multi-format web articles, executive summaries, reels, and sonified audio.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Source Selection & AI Generator Controls */}
        <div className="source-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2>Select Scientific Source Document</h2>
              <p>Choose an archived dataset or expedition report to generate tailored communications</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {isGenerating ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
              <span>{isGenerating ? 'Synthesizing with AI...' : 'Generate Multi-Channel Suite with AI'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Archived Resource:
              </label>
              <select
                className="input"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                style={{ width: '100%' }}
              >
                {allAvailableSources.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.type}] {s.title} ({s.year})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Target Audience / Custom Angle (Optional):
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Focus on climate summit delegates, secondary schools..."
                value={customBrief}
                onChange={(e) => setCustomBrief(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="source-card" style={{ marginTop: '16px' }}>
            <div className="source-card-icon"><FileText size={20} /></div>
            <div className="source-card-info">
              <span className="source-card-type badge badge-ice">{currentSource.type} · {currentSource.region}</span>
              <h3>{currentSource.title}</h3>
              <span className="source-card-meta">
                Research Area: {currentSource.area} · Year: {currentSource.year} · Open Access NCPOR
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleExportAll} title="Export all outreach items">
                <Download size={14} /> Export Package
              </button>
              <span className="badge badge-aurora">Ready</span>
            </div>
          </div>
        </div>

        {/* Output Cards */}
        <div className="outputs-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2>Generated Outreach Deliverables ({outputs.length})</h2>
              <p>Publication-ready drafts across social media, academic highlights, pedagogical guides, and multimedia.</p>
            </div>
            {aiModelUsed && (
              <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                Generated via {aiModelUsed}
              </span>
            )}
          </div>

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
                    <div className="output-preview" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {isExpanded ? output.content : output.content.substring(0, 220) + (output.content.length > 220 ? '...' : '')}
                    </div>
                  </div>

                  <div className="output-card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleExpand(output.id)} aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                    <div className="output-action-group">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(output.content)} aria-label="Copy to clipboard">
                        <Copy size={14} /> Copy
                      </button>
                      {output.status !== 'approved' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(output.id)}>
                          <Check size={14} /> Approve
                        </button>
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
              { label: 'Generated', desc: 'AI creates draft from telemetry', active: true },
              { label: 'Draft', desc: 'Indexed in POLARA studio', active: true },
              { label: 'Review', desc: 'Researcher verifies accuracy', active: true },
              { label: 'Approved', desc: 'Ready for public distribution', active: false },
              { label: 'Published', desc: 'Live on outreach channels', active: false },
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
