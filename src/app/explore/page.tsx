'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { getAllResources, researchAreas, photographs } from '@/lib/data';
import { Photograph } from '@/lib/types';
import './page.css';
import {
  Search, Filter, FileText, BarChart3, BookOpen,
  Image as ImageIcon, Play, Compass, ArrowRight, X, Sparkles,
  Bookmark, BookmarkCheck, Volume2, Camera, Eye
} from 'lucide-react';
import { useBookmarks } from '@/lib/bookmarks';
import PhotoLightbox from '@/components/PhotoLightbox';

const typeIcons: Record<string, React.ReactNode> = {
  report: <FileText size={16} />,
  dataset: <BarChart3 size={16} />,
  publication: <BookOpen size={16} />,
  photograph: <ImageIcon size={16} />,
  video: <Play size={16} />,
  audio: <Volume2 size={16} />,
  expedition: <Compass size={16} />,
};

const typeColors: Record<string, string> = {
  report: 'badge-ochre',
  dataset: 'badge-cyan',
  publication: 'badge-sand',
  photograph: 'badge-frost',
  video: 'badge-warm',
  audio: 'badge-tundra',
};

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialArea = searchParams.get('area') || '';
  const initialType = searchParams.get('type') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<string>(initialType);
  const [areaFilter, setAreaFilter] = useState(initialArea);
  const [yearFilter, setYearFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Lightbox state
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const allResources = getAllResources();

  const filtered = useMemo(() => {
    let results = allResources;

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.keywords.some(k => k.toLowerCase().includes(q)) ||
        r.researchArea.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      if (typeFilter === 'media') {
        results = results.filter(r => r.type === 'photograph' || r.type === 'video' || r.type === 'audio');
      } else {
        results = results.filter(r => r.type === typeFilter);
      }
    }

    if (areaFilter) {
      results = results.filter(r => r.researchArea === areaFilter);
    }

    if (yearFilter !== 'all') {
      results = results.filter(r => r.year === parseInt(yearFilter));
    }

    if (regionFilter !== 'all') {
      results = results.filter(r => r.region === regionFilter);
    }

    return results;
  }, [query, typeFilter, areaFilter, yearFilter, regionFilter, allResources]);

  const clearFilters = () => {
    setTypeFilter('all');
    setAreaFilter('');
    setYearFilter('all');
    setRegionFilter('all');
  };

  const hasFilters = typeFilter !== 'all' || areaFilter || yearFilter !== 'all' || regionFilter !== 'all';

  // Extract photos for lightbox
  const photoList = useMemo(() => {
    return photographs;
  }, []);

  const openLightboxForPhoto = (photoId: string) => {
    const idx = photoList.findIndex(p => p.id === photoId);
    if (idx !== -1) {
      setSelectedPhotoIndex(idx);
    }
  };

  return (
    <AppLayout>
      <div className="explore-page">
        <div className="explore-header">
          <h1>Explore Polar Science</h1>
          <p>Search and discover across expeditions, reports, datasets, publications, and multimedia archives</p>

          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              className="input input-lg"
              placeholder="Search polar science... (e.g., sea ice, Bharati station, hydrophone, glaciology)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '48px' }}
            />
          </div>

          <div className="explore-quick-tags">
            <span className="quick-label">Trending topics:</span>
            {[
              'Antarctic Sea Ice',
              'Bharati Station',
              'Himadri Arctic Base',
              'Humpback Whale Song',
              'CTD Salinity',
              'Weddell Seal',
              'IndARC Mooring'
            ].map(tag => (
              <button
                key={tag}
                className="quick-tag-btn"
                onClick={() => setQuery(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="explore-body">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filters-header">
              <h3><Filter size={16} /> Filters</h3>
              {hasFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            <div className="filter-group">
              <label>Content Type</label>
              {[
                { id: 'all', label: 'All Resources' },
                { id: 'media', label: 'All Multimedia' },
                { id: 'report', label: 'Expedition Reports' },
                { id: 'dataset', label: 'Scientific Datasets' },
                { id: 'publication', label: 'Publications' },
                { id: 'photograph', label: 'Photographs' },
                { id: 'video', label: 'Polar Videos' },
                { id: 'audio', label: 'Hydrophone Audios' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`filter-option ${typeFilter === t.id ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t.id)}
                >
                  {typeIcons[t.id] || <Sparkles size={16} />}
                  <span>{t.label}</span>
                  <span className="filter-count">
                    {t.id === 'all'
                      ? allResources.length
                      : t.id === 'media'
                      ? allResources.filter(r => r.type === 'photograph' || r.type === 'video' || r.type === 'audio').length
                      : allResources.filter(r => r.type === t.id).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="filter-group">
              <label>Research Area</label>
              <button
                className={`filter-option ${!areaFilter ? 'active' : ''}`}
                onClick={() => setAreaFilter('')}
              >
                <span>All Areas</span>
              </button>
              {researchAreas.map(area => (
                <button
                  key={area.id}
                  className={`filter-option ${areaFilter === area.name ? 'active' : ''}`}
                  onClick={() => setAreaFilter(areaFilter === area.name ? '' : area.name)}
                >
                  <span>{area.icon} {area.name}</span>
                </button>
              ))}
            </div>

            <div className="filter-group">
              <label>Region</label>
              {['all', 'Antarctica', 'Arctic', 'Southern Ocean', 'Himalayas'].map(r => (
                <button
                  key={r}
                  className={`filter-option ${regionFilter === r ? 'active' : ''}`}
                  onClick={() => setRegionFilter(r)}
                >
                  <span>{r === 'all' ? 'All Regions' : r}</span>
                </button>
              ))}
            </div>

            <div className="filter-group">
              <label>Year</label>
              {['all', '2025', '2024', '2023'].map(y => (
                <button
                  key={y}
                  className={`filter-option ${yearFilter === y ? 'active' : ''}`}
                  onClick={() => setYearFilter(y)}
                >
                  <span>{y === 'all' ? 'All Years' : y}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="results-area">
            <div className="results-header">
              <span className="results-count">
                Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'resource' : 'resources'}
                {query && <span> for &ldquo;{query}&rdquo;</span>}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-results">
                <Search size={32} />
                <h3>No results found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button className="btn btn-secondary" onClick={() => { setQuery(''); clearFilters(); }}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="results-list">
                {filtered.map((resource, i) => {
                  const isPhoto = resource.type === 'photograph';
                  const isVideo = resource.type === 'video';
                  const isAudio = resource.type === 'audio';

                  return (
                    <div
                      key={resource.id}
                      className="result-card"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* Media Thumbnail or Icon */}
                      {isPhoto && resource.imageUrl ? (
                        <div
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            position: 'relative',
                            cursor: 'pointer',
                            background: '#000',
                          }}
                          onClick={() => openLightboxForPhoto(resource.id)}
                          title="Open photo lightbox"
                        >
                          <img
                            src={resource.imageUrl}
                            alt={resource.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                          >
                            <Eye size={18} />
                          </div>
                        </div>
                      ) : isVideo && resource.imageUrl ? (
                        <div
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            position: 'relative',
                            background: '#000',
                          }}
                        >
                          <img
                            src={resource.imageUrl}
                            alt={resource.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                          />
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,0.6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--warm-400)',
                            }}>
                              <Play size={14} style={{ marginLeft: '2px' }} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="result-card-icon" style={{
                          background: resource.type === 'report' ? 'rgba(30, 62, 98, 0.1)' :
                            resource.type === 'dataset' ? 'rgba(30, 62, 98, 0.1)' :
                            resource.type === 'publication' ? 'rgba(74, 222, 128, 0.1)' :
                            resource.type === 'photograph' ? 'rgba(11, 25, 44, 0.1)' :
                            resource.type === 'audio' ? 'rgba(30, 62, 98, 0.15)' :
                            'rgba(245, 158, 11, 0.1)',
                          color: resource.type === 'report' ? 'var(--ice-400)' :
                            resource.type === 'dataset' ? 'var(--cyan-400)' :
                            resource.type === 'publication' ? 'var(--aurora-400)' :
                            resource.type === 'photograph' ? 'var(--frost-400)' :
                            resource.type === 'audio' ? 'var(--ice-300)' :
                            'var(--warm-400)',
                        }}>
                          {typeIcons[resource.type] || <Sparkles size={16} />}
                        </div>
                      )}

                      <div className="result-card-content">
                        <div className="result-card-header">
                          <span className={`badge ${typeColors[resource.type] || 'badge-ice'}`}>
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </span>
                          <span className={`badge ${
                            resource.researchArea.toLowerCase().includes('biology') ? 'badge-tundra' :
                            resource.researchArea.toLowerCase().includes('climate') ? 'badge-sand' :
                            'badge-cyan'
                          }`}>
                            {resource.researchArea}
                          </span>
                          <span className={`badge ${
                            resource.region.toLowerCase().includes('antarctica') ? 'badge-ochre' :
                            resource.region.toLowerCase().includes('himalaya') ? 'badge-tundra' :
                            'badge-aurora'
                          }`}>
                            {resource.region}
                          </span>
                          <span className="result-year">{resource.year}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleBookmark(resource);
                            }}
                            className="result-bookmark-btn"
                            title={isBookmarked(resource.id) ? 'Remove from dossier' : 'Save to dossier'}
                            style={{
                              marginLeft: 'auto',
                              background: 'transparent',
                              border: 'none',
                              color: isBookmarked(resource.id) ? 'var(--ice-400)' : 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px',
                            }}
                          >
                            {isBookmarked(resource.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        </div>

                        <Link href={`/repository/${resource.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h4 style={{ margin: '6px 0' }}>{resource.title}</h4>
                        </Link>
                        <p className="truncate-2" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {resource.description}
                        </p>

                        <div className="result-card-footer" style={{ marginTop: '12px' }}>
                          <div className="result-keywords">
                            {resource.keywords.slice(0, 3).map(k => (
                              <span key={k} className="tag">{k}</span>
                            ))}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {isPhoto && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => openLightboxForPhoto(resource.id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Camera size={13} /> View Photo
                              </button>
                            )}
                            <Link href={`/repository/${resource.id}`} className="result-link" style={{ textDecoration: 'none' }}>
                              {isAudio ? 'Listen Audio' : isVideo ? 'Watch Video' : 'Open Dossier'} <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Global Photo Lightbox Modal */}
        {selectedPhotoIndex !== null && (
          <PhotoLightbox
            photos={photoList}
            currentIndex={selectedPhotoIndex}
            isOpen={selectedPhotoIndex !== null}
            onClose={() => setSelectedPhotoIndex(null)}
            onNavigate={(idx) => setSelectedPhotoIndex(idx)}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<AppLayout><div style={{ padding: 'var(--space-8)' }}>Loading explore...</div></AppLayout>}>
      <ExploreContent />
    </Suspense>
  );
}
