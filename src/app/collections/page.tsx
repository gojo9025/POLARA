'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { researchAreas } from '@/lib/data';
import { useBookmarks } from '@/lib/bookmarks';
import { useToast } from '@/lib/toast';
import {
  Layers, ArrowRight, Bookmark, BookmarkCheck, Trash2,
  Download, FileText, BarChart3, BookOpen, Share2, Sparkles
} from 'lucide-react';

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<'dossier' | 'areas'>('dossier');
  const { bookmarkedItems, toggleBookmark, clearBookmarks } = useBookmarks();
  const { success } = useToast();

  const handleExportDossier = () => {
    if (bookmarkedItems.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarkedItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `polara-research-dossier-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    success('Dossier Exported', `${bookmarkedItems.length} research resources exported as JSON`);
  };

  const handleShareDossier = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Dossier Link Copied', 'URL copied to your clipboard');
  };

  return (
    <AppLayout>
      <div style={{ padding: 'var(--space-8)', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link> / <span style={{ color: 'var(--text-primary)' }}>Collections</span>
        </div>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>
              <Layers size={28} style={{ color: 'var(--ice-400)' }} /> Research Collections & Dossier
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Personal research archives, saved scientific dossiers, and curated polar knowledge disciplines
            </p>
          </div>

          {/* Action buttons if in dossier tab */}
          {activeTab === 'dossier' && bookmarkedItems.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleExportDossier}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Export Dossier (.JSON)
              </button>
              <button
                onClick={handleShareDossier}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Share2 size={14} /> Share
              </button>
              <button
                onClick={clearBookmarks}
                className="btn btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger-400)' }}
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(56, 182, 230, 0.1)', paddingBottom: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => setActiveTab('dossier')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'dossier' ? 'linear-gradient(135deg, rgba(56, 182, 230, 0.2), rgba(46, 196, 182, 0.15))' : 'transparent',
              border: activeTab === 'dossier' ? '1px solid var(--ice-400)' : '1px solid transparent',
              color: activeTab === 'dossier' ? 'var(--ice-300)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Bookmark size={15} /> My Saved Dossier
            <span style={{
              fontSize: '0.6875rem',
              background: 'rgba(56, 182, 230, 0.15)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--ice-300)',
              fontFamily: 'var(--font-mono)'
            }}>
              {bookmarkedItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('areas')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'areas' ? 'linear-gradient(135deg, rgba(56, 182, 230, 0.2), rgba(46, 196, 182, 0.15))' : 'transparent',
              border: activeTab === 'areas' ? '1px solid var(--ice-400)' : '1px solid transparent',
              color: activeTab === 'areas' ? 'var(--ice-300)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Layers size={15} /> Curated Disciplines
            <span style={{
              fontSize: '0.6875rem',
              background: 'rgba(56, 182, 230, 0.15)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--ice-300)',
              fontFamily: 'var(--font-mono)'
            }}>
              {researchAreas.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Saved Dossier */}
        {activeTab === 'dossier' && (
          <div>
            {bookmarkedItems.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-16) var(--space-8)',
                background: 'rgba(14, 21, 41, 0.5)',
                border: '1px dashed rgba(56, 182, 230, 0.15)',
                borderRadius: 'var(--radius-2xl)',
              }}>
                <Bookmark size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Your Research Dossier is Empty
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '460px', margin: '0 auto 24px' }}>
                  Save datasets, publications, and expedition reports across POLARA by clicking the bookmark button on any resource card.
                </p>
                <Link href="/explore" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Explore Science Archive <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {bookmarkedItems.map((item, i) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(14, 21, 41, 0.7)',
                      border: '1px solid rgba(56, 182, 230, 0.12)',
                      borderRadius: 'var(--radius-xl)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      backdropFilter: 'blur(12px)',
                      animation: `fadeIn 0.3s ease-out ${i * 50}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="badge badge-ice" style={{ fontSize: '0.6875rem' }}>
                          {item.type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>
                          {item.year}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleBookmark(item)}
                        style={{
                          background: 'rgba(56, 182, 230, 0.1)',
                          border: '1px solid rgba(56, 182, 230, 0.25)',
                          borderRadius: 'var(--radius-md)',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--ice-400)',
                          cursor: 'pointer',
                        }}
                        title="Remove from dossier"
                      >
                        <BookmarkCheck size={15} />
                      </button>
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', flex: 1 }} className="truncate-3">
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(56, 182, 230, 0.08)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.region}
                      </span>
                      <Link
                        href={`/repository/${item.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8125rem',
                          color: 'var(--ice-400)',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Inspect Dossier <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Curated Disciplines */}
        {activeTab === 'areas' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {researchAreas.map((area, i) => (
              <Link
                href={`/explore?area=${encodeURIComponent(area.name)}`}
                key={area.id}
                style={{
                  background: 'rgba(14, 21, 41, 0.7)',
                  border: '1px solid rgba(56, 182, 230, 0.12)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                  textDecoration: 'none',
                  animation: `fadeIn 0.4s ease-out ${i * 60}ms forwards`,
                  opacity: 0,
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  backdropFilter: 'blur(12px)',
                }}
                className="hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-1"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    background: `${area.color}15`,
                    border: `1px solid ${area.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    {area.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: area.color, background: 'rgba(6, 10, 20, 0.6)', border: `1px solid ${area.color}25`, padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                    {area.resourceCount} resources
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {area.name}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', flex: 1, lineHeight: 1.6 }}>
                  {area.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', color: area.color, fontSize: '0.875rem', fontWeight: 600, gap: '4px', marginTop: 'auto' }}>
                  Explore Collection <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
