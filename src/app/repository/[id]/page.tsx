'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { getResourceById, getExpeditionById, reports, datasets, publications, photographs, videos, audioRecordings } from '@/lib/data';
import AudioPlayer from '@/components/AudioPlayer';
import VideoPlayer from '@/components/VideoPlayer';
import PhotoLightbox from '@/components/PhotoLightbox';
import './page.css';
import {
  FileText, ArrowRight, Compass, BookOpen, BarChart3,
  MessageCircle, Sparkles, GraduationCap, Globe, Users,
  Calendar, MapPin, Tag, ExternalLink, Microscope, Copy, Check,
  Download, Bookmark, BookmarkCheck, Share2, Code2
} from 'lucide-react';
import { useBookmarks } from '@/lib/bookmarks';
import { useToast } from '@/lib/toast';

import { askPolarAI } from '@/lib/ai';

export default function ResourceDetailPage() {
  const params = useParams();
  const resource = getResourceById(params.id as string);
  const [explainMode, setExplainMode] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCitation, setShowCitation] = useState(false);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { success, info, error: showError } = useToast();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!resource) {
    return (
      <AppLayout>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <h2>Resource not found</h2>
          <p>The requested resource does not exist.</p>
          <Link href="/explore" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Browse Resources
          </Link>
        </div>
      </AppLayout>
    );
  }

  const expedition = resource.expeditionId ? getExpeditionById(resource.expeditionId) : null;
  const report = reports.find(r => r.id === resource.id);
  const dataset = datasets.find(d => d.id === resource.id);
  const publication = publications.find(p => p.id === resource.id);
  const photo = photographs.find(p => p.id === resource.id);
  const video = videos.find(v => v.id === resource.id);
  const audio = audioRecordings.find(a => a.id === resource.id);

  const handleExplain = async (mode: string) => {
    setExplainMode(mode);
    setIsGenerating(true);
    try {
      const res = await askPolarAI({
        prompt: `Provide a comprehensive scientific synthesis and analysis for this resource in ${mode} mode.`,
        mode: mode === 'researcher' ? 'research' : (mode as 'student' | 'public' | 'educator'),
        context: {
          resourceTitle: resource.title,
          resourceType: resource.type,
          region: resource.region,
          abstract: report?.abstract || publication?.abstract || resource.description,
          findings: report?.findings,
          variables: dataset?.variables,
          expedition: expedition?.name,
        },
      });
      setExplanation(res.answer);
      success('AI Explanation Generated', `Generated ${mode} synthesis using ${res.modelUsed}`);
    } catch (err: unknown) {
      showError('AI Generation Error', (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyBibtex = () => {
    const bibtex = `@article{polara_${resource.id}_${resource.year},
  title = {${resource.title}},
  author = {${resource.authors?.join(' and ') || 'NCPOR Polar Science Team'}},
  institution = {National Centre for Polar and Ocean Research (NCPOR)},
  year = {${resource.year}},
  url = {https://polara.ncpor.res.in/repository/${resource.id}},
  note = {Polar Outreach, Learning & Research Archive}
}`;
    navigator.clipboard.writeText(bibtex);
    success('Citation Copied', 'BibTeX citation copied to clipboard');
  };

  const handleDownloadPackage = () => {
    const dataContent = JSON.stringify({
      resourceId: resource.id,
      title: resource.title,
      type: resource.type,
      region: resource.region,
      researchArea: resource.researchArea,
      year: resource.year,
      authors: resource.authors,
      abstract: report?.abstract || publication?.abstract || resource.description,
      findings: report?.findings || [],
      variables: dataset?.variables || [],
      doi: `10.5067/POLAR-${resource.id.toUpperCase()}`,
      license: 'Open Access (CC-BY 4.0 NCPOR)',
      exportedAt: new Date().toISOString(),
    }, null, 2);

    const blob = new Blob([dataContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polara-${resource.id}-dossier.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    success('Dataset Exported', `Generated scientific package for ${resource.id}`);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      success('Link Copied', 'Resource URL copied to clipboard');
    }
  };

  const bookmarked = isBookmarked(resource.id);

  return (
    <AppLayout>
      <div className="resource-detail">
        {/* Hero */}
        <div className="rd-hero">
          <div className="rd-hero-bg" />
          <div className="rd-hero-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div className="page-breadcrumb">
                <Link href="/">Home</Link> / <Link href="/explore">Explore</Link> / <span>{resource.type}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => toggleBookmark(resource)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {bookmarked ? <BookmarkCheck size={14} style={{ color: 'var(--ice-400)' }} /> : <Bookmark size={14} />}
                  <span>{bookmarked ? 'Saved to Dossier' : 'Save Resource'}</span>
                </button>
                <button
                  onClick={handleCopyBibtex}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Copy BibTeX Citation"
                >
                  <Code2 size={14} /> Cite
                </button>
                <button
                  onClick={handleDownloadPackage}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Download Scientific Package"
                >
                  <Download size={14} /> Export
                </button>
                <button
                  onClick={handleShare}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Share Link"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            <div className="rd-badges" style={{ marginTop: '12px' }}>
              <span className="badge badge-ice">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</span>
              <span className="badge badge-cyan">{resource.researchArea}</span>
              <span className="badge badge-aurora">{resource.region}</span>
              <span className="badge badge-frost">{resource.status}</span>
            </div>
            <h1>{resource.title}</h1>
            <div className="rd-meta">
              {resource.authors && <span><Users size={14} /> {resource.authors.join(', ')}</span>}
              <span><Calendar size={14} /> {resource.year}</span>
              <span><MapPin size={14} /> {resource.region}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>
                DOI: 10.5067/POLAR-{resource.id.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="rd-body">
          <div className="rd-main">
            {/* Abstract / Description */}
            <section className="rd-section">
              <h3>{report || publication ? 'Abstract' : 'Description'}</h3>
              <p className="rd-abstract">{report?.abstract || publication?.abstract || resource.description}</p>
            </section>

            {/* Interactive Media Players for Photos, Videos, and Audios */}
            {audio && (
              <section className="rd-section">
                <AudioPlayer recording={audio} />
              </section>
            )}

            {video && (
              <section className="rd-section">
                <VideoPlayer video={video} />
              </section>
            )}

            {photo && (
              <section className="rd-section">
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000', textAlign: 'center' }}>
                  <img
                    src={photo.highResUrl || photo.imageUrl}
                    alt={photo.title}
                    style={{ width: '100%', maxHeight: '520px', objectFit: 'contain', display: 'block', cursor: 'pointer' }}
                    onClick={() => setLightboxOpen(true)}
                  />
                  <div style={{ padding: '16px 20px', background: 'var(--navy-900)', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>
                        Photographer: <strong style={{ color: 'var(--text-primary)' }}>{photo.photographer}</strong> • Location: {photo.location}
                      </span>
                      {photo.cameraInfo && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--ice-400)', fontFamily: 'monospace' }}>
                          Camera EXIF: {photo.cameraInfo}
                        </span>
                      )}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setLightboxOpen(true)}>
                      View Fullscreen Lightbox
                    </button>
                  </div>
                </div>

                {lightboxOpen && (
                  <PhotoLightbox
                    photos={[photo]}
                    currentIndex={0}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={() => {}}
                  />
                )}
              </section>
            )}

            {/* Key Findings */}
            {report?.findings && (
              <section className="rd-section">
                <h3><Sparkles size={18} /> Key Findings</h3>
                <ul className="findings-list">
                  {report.findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Dataset Details */}
            {dataset && (
              <section className="rd-section">
                <h3><BarChart3 size={18} /> Dataset Details</h3>
                <div className="dataset-grid">
                  <div className="ds-field"><label>Type</label><span>{dataset.datasetType}</span></div>
                  <div className="ds-field"><label>Format</label><span>{dataset.fileFormat}</span></div>
                  <div className="ds-field"><label>Collection Period</label><span>{dataset.collectionPeriod}</span></div>
                  <div className="ds-field"><label>Coverage</label><span>{dataset.geographicCoverage}</span></div>
                  {dataset.rowCount && <div className="ds-field"><label>Rows</label><span>{dataset.rowCount.toLocaleString()}</span></div>}
                  <div className="ds-field"><label>License</label><span>{dataset.license}</span></div>
                </div>
                <div className="ds-variables">
                  <h4>Variables</h4>
                  <div className="var-list">
                    {dataset.variables.map((v, i) => (
                      <div key={i} className="var-item">
                        <span className="var-name">{v}</span>
                        <span className="var-unit">{dataset.units[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Publication Details */}
            {publication && (
              <section className="rd-section">
                <h3><BookOpen size={18} /> Publication Details</h3>
                <div className="dataset-grid">
                  <div className="ds-field"><label>Journal</label><span>{publication.journal}</span></div>
                  <div className="ds-field"><label>Published</label><span>{publication.publicationDate}</span></div>
                  {publication.doi && <div className="ds-field"><label>DOI</label><span className="doi">{publication.doi}</span></div>}
                </div>
              </section>
            )}

            {/* Keywords */}
            <section className="rd-section">
              <h3><Tag size={18} /> Topics & Keywords</h3>
              <div className="keywords-list">
                {resource.keywords.map(k => (
                  <Link href={`/explore?q=${encodeURIComponent(k)}`} key={k} className="tag">{k}</Link>
                ))}
              </div>
            </section>

            {/* Explain This */}
            <section className="rd-section">
              <div className="explain-box">
                <h3><GraduationCap size={18} /> Explain This</h3>
                <p>Transform this resource for different audiences</p>
                <div className="explain-options">
                  {[
                    { key: 'researcher', label: 'Researcher', icon: <Microscope size={14} /> },
                    { key: 'student', label: 'University Student', icon: <GraduationCap size={14} /> },
                    { key: 'school', label: 'School Student', icon: <BookOpen size={14} /> },
                    { key: 'public', label: 'General Public', icon: <Globe size={14} /> },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      className={`explain-btn ${explainMode === opt.key ? 'active' : ''}`}
                      onClick={() => handleExplain(opt.key)}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>

                {isGenerating && (
                  <div className="explain-loading">
                    <Sparkles size={16} />
                    <span>Generating {explainMode} explanation...</span>
                  </div>
                )}

                {explanation && !isGenerating && (
                  <div className="explain-result">
                    <div className="explain-result-header">
                      <span className="badge badge-ice">{explainMode} mode</span>
                      <span className="explain-source">Source: {resource.title.substring(0, 50)}...</span>
                    </div>
                    <div className="explain-text" dangerouslySetInnerHTML={{
                      __html: explanation
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '<br/><br/>')
                        .replace(/\n/g, '<br/>')
                        .replace(/• (.*?)(<br|$)/g, '<li>$1</li>')
                    }} />
                  </div>
                )}
              </div>
            </section>

            {/* Ask POLARA */}
            <section className="rd-section">
              <div className="ask-banner">
                <MessageCircle size={20} />
                <div>
                  <h4>Ask about this resource</h4>
                  <p>Get AI-powered answers grounded in this document</p>
                </div>
                <Link href={`/ask?context=${resource.id}`} className="btn btn-primary">
                  Ask POLARA
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="rd-sidebar">
            {/* Metadata */}
            <div className="rd-sidebar-card">
              <h4>Metadata</h4>
              <div className="rd-meta-list">
                <div className="rd-meta-item"><label>Type</label><span>{resource.type}</span></div>
                <div className="rd-meta-item"><label>Research Area</label><span>{resource.researchArea}</span></div>
                <div className="rd-meta-item"><label>Region</label><span>{resource.region}</span></div>
                <div className="rd-meta-item"><label>Year</label><span>{resource.year}</span></div>
                <div className="rd-meta-item"><label>Status</label><span className="badge badge-aurora">{resource.status}</span></div>
                <div className="rd-meta-item"><label>Visibility</label><span>{resource.visibility}</span></div>
              </div>
            </div>

            {/* Related Expedition */}
            {expedition && (
              <div className="rd-sidebar-card">
                <h4><Compass size={16} /> Related Expedition</h4>
                <Link href={`/expeditions/${expedition.id}`} className="related-exp">
                  <span className="related-exp-name">{expedition.name}</span>
                  <span className="related-exp-year">{expedition.year} · {expedition.region}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {/* Connected Knowledge */}
            <div className="rd-sidebar-card">
              <h4><Sparkles size={16} /> Connected Knowledge</h4>
              <p className="rd-sidebar-note">Resources related to this document</p>
              {report?.relatedPublications && report.relatedPublications.length > 0 && (
                <div className="related-group">
                  <span className="related-label"><BookOpen size={12} /> Publications</span>
                  {publications.filter(p => report.relatedPublications.includes(p.id)).map(p => (
                    <div key={p.id} className="related-item">{p.title}</div>
                  ))}
                </div>
              )}
              {report?.relatedDatasets && report.relatedDatasets.length > 0 && (
                <div className="related-group">
                  <span className="related-label"><BarChart3 size={12} /> Datasets</span>
                  {datasets.filter(d => report.relatedDatasets.includes(d.id)).map(d => (
                    <div key={d.id} className="related-item">{d.title}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="rd-sidebar-card">
              <h4>Actions</h4>
              <div className="rd-actions">
                <Link href={`/outreach?source=${resource.id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                  Create Outreach Package
                </Link>
                <Link href={`/learning?source=${resource.id}`} className="btn btn-ghost" style={{ width: '100%' }}>
                  Generate Quiz
                </Link>
              </div>
            </div>
          </aside>
        </div>

        
      </div>
    </AppLayout>
  );
}
