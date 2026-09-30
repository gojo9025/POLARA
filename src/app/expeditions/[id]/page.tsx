'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { getExpeditionById, getRelatedResources, reports, datasets, publications, photographs, videos } from '@/lib/data';
import './page.css';
import {
  MapPin, Calendar, Users, Compass, FileText, BarChart3,
  BookOpen, Image as ImageIcon, Play, GraduationCap,
  ArrowRight, ExternalLink, MessageCircle, Sparkles
} from 'lucide-react';

export default function ExpeditionDetailPage() {
  const params = useParams();
  const expedition = getExpeditionById(params.id as string);

  if (!expedition) {
    return (
      <AppLayout>
        <div className="page" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <h2>Expedition not found</h2>
          <p>The requested expedition does not exist.</p>
          <Link href="/expeditions" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Browse Expeditions
          </Link>
        </div>
      </AppLayout>
    );
  }

  const relatedReports = reports.filter(r => r.expeditionId === expedition.id);
  const relatedDatasets = datasets.filter(d => d.expeditionId === expedition.id);
  const relatedPubs = publications.filter(p => p.relatedExpedition === expedition.id);
  const relatedPhotos = photographs.filter(p => p.expeditionId === expedition.id);
  const relatedVideos = videos.filter(v => v.expeditionId === expedition.id);

  return (
    <AppLayout>
      <div className="detail-page">
        {/* Hero */}
        <div className="detail-hero">
          <div className="detail-hero-bg" />
          <div className="detail-hero-content">
            <div className="page-breadcrumb">
              <Link href="/">Home</Link> / <Link href="/expeditions">Expeditions</Link> / <span>{expedition.expeditionNumber}</span>
            </div>
            <span className="badge badge-ice">{expedition.region}</span>
            <h1>{expedition.name}</h1>
            <div className="detail-meta">
              <span><MapPin size={16} /> {expedition.location}</span>
              <span><Calendar size={16} /> {expedition.startDate} — {expedition.endDate}</span>
              <span><Users size={16} /> {expedition.participants.length} researchers</span>
              {expedition.vessel && <span><Compass size={16} /> {expedition.vessel}</span>}
            </div>
          </div>
        </div>

        <div className="detail-body">
          {/* Connected Knowledge — Signature Feature */}
          <div className="connected-knowledge">
            <h2>
              <Sparkles size={20} />
              Connected Knowledge
            </h2>
            <p>All resources connected to this expedition</p>

            <div className="ck-grid">
              {[
                { icon: <FileText size={20} />, label: 'Reports', count: expedition.resourceCount.reports, color: 'var(--ice-500)', href: '#reports' },
                { icon: <BarChart3 size={20} />, label: 'Datasets', count: expedition.resourceCount.datasets, color: 'var(--cyan-500)', href: '#datasets' },
                { icon: <BookOpen size={20} />, label: 'Publications', count: expedition.resourceCount.publications, color: 'var(--aurora-500)', href: '#publications' },
                { icon: <ImageIcon size={20} />, label: 'Photographs', count: expedition.resourceCount.photographs, color: 'var(--frost-500)', href: '#photos' },
                { icon: <Play size={20} />, label: 'Videos', count: expedition.resourceCount.videos, color: 'var(--warm-500)', href: '#videos' },
                { icon: <GraduationCap size={20} />, label: 'Learning Modules', count: expedition.resourceCount.learningModules, color: 'var(--danger-400)', href: '#learning' },
              ].map(item => (
                <a href={item.href} key={item.label} className="ck-item">
                  <div className="ck-item-icon" style={{ color: item.color, background: `${item.color}15` }}>
                    {item.icon}
                  </div>
                  <div className="ck-item-count" style={{ color: item.color }}>{item.count}</div>
                  <div className="ck-item-label">{item.label}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Description */}
          <section className="detail-section">
            <h3>Overview</h3>
            <p>{expedition.description}</p>
          </section>

          {/* Objectives */}
          <section className="detail-section">
            <h3>Research Objectives</h3>
            <ul className="objectives-list">
              {expedition.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </section>

          {/* Research Areas */}
          <section className="detail-section">
            <h3>Research Areas</h3>
            <div className="tags-list">
              {expedition.researchAreas.map(area => (
                <Link href={`/explore?area=${encodeURIComponent(area)}`} key={area} className="tag">{area}</Link>
              ))}
            </div>
          </section>

          {/* Participants */}
          <section className="detail-section">
            <h3>Participants</h3>
            <div className="participants-grid">
              {expedition.participants.map(p => (
                <div key={p} className="participant-chip">
                  <div className="participant-avatar"><Users size={14} /></div>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reports */}
          {relatedReports.length > 0 && (
            <section className="detail-section" id="reports">
              <h3><FileText size={18} /> Reports ({relatedReports.length})</h3>
              <div className="resource-list">
                {relatedReports.map(r => (
                  <Link href={`/repository/${r.id}`} key={r.id} className="resource-item">
                    <div className="resource-item-icon"><FileText size={16} /></div>
                    <div className="resource-item-info">
                      <h4>{r.title}</h4>
                      <p className="truncate-2">{r.description}</p>
                      <div className="resource-item-meta">
                        <span className="badge badge-cyan">{r.researchArea}</span>
                        <span>{r.authors?.join(', ')}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="resource-item-arrow" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Datasets */}
          {relatedDatasets.length > 0 && (
            <section className="detail-section" id="datasets">
              <h3><BarChart3 size={18} /> Datasets ({relatedDatasets.length})</h3>
              <div className="resource-list">
                {relatedDatasets.map(d => (
                  <Link href={`/datasets/${d.id}`} key={d.id} className="resource-item">
                    <div className="resource-item-icon" style={{ background: 'rgba(46, 196, 182, 0.1)', color: 'var(--cyan-400)' }}>
                      <BarChart3 size={16} />
                    </div>
                    <div className="resource-item-info">
                      <h4>{d.title}</h4>
                      <p className="truncate-2">{d.description}</p>
                      <div className="resource-item-meta">
                        <span className="badge badge-cyan">{d.researchArea}</span>
                        <span>{d.fileFormat} · {d.rowCount?.toLocaleString()} rows</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="resource-item-arrow" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Publications */}
          {relatedPubs.length > 0 && (
            <section className="detail-section" id="publications">
              <h3><BookOpen size={18} /> Publications ({relatedPubs.length})</h3>
              <div className="resource-list">
                {relatedPubs.map(p => (
                  <div key={p.id} className="resource-item">
                    <div className="resource-item-icon" style={{ background: 'rgba(74, 222, 128, 0.1)', color: 'var(--aurora-400)' }}>
                      <BookOpen size={16} />
                    </div>
                    <div className="resource-item-info">
                      <h4>{p.title}</h4>
                      <p className="truncate-2">{p.abstract}</p>
                      <div className="resource-item-meta">
                        <span className="badge badge-aurora">{p.journal}</span>
                        <span>{p.authors?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Photographs */}
          {relatedPhotos.length > 0 && (
            <section className="detail-section" id="photos">
              <h3><ImageIcon size={18} /> Photographs ({relatedPhotos.length})</h3>
              <div className="photo-grid">
                {relatedPhotos.map(photo => (
                  <div key={photo.id} className="photo-card">
                    <div className="photo-card-image" />
                    <div className="photo-card-info">
                      <h4>{photo.title}</h4>
                      <p>{photo.photographer} · {photo.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ask POLARA about this expedition */}
          <section className="detail-section">
            <div className="ask-polara-banner">
              <div>
                <h3><MessageCircle size={18} /> Ask POLARA about this expedition</h3>
                <p>Get AI-powered answers grounded in the research from this expedition</p>
              </div>
              <Link href={`/ask?context=${expedition.id}`} className="btn btn-primary">
                Ask POLARA <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>

        
      </div>
    </AppLayout>
  );
}
