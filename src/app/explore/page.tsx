'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { getAllResources, researchAreas } from '@/lib/data';
import './page.css';
import {
  Search, Filter, FileText, BarChart3, BookOpen,
  Image as ImageIcon, Play, Compass, ArrowRight, X, Sparkles,
  Bookmark, BookmarkCheck
} from 'lucide-react';
import { useBookmarks } from '@/lib/bookmarks';

const typeIcons: Record<string, React.ReactNode> = {
  report: <FileText size={16} />,
  dataset: <BarChart3 size={16} />,
  publication: <BookOpen size={16} />,
  photograph: <ImageIcon size={16} />,
  video: <Play size={16} />,
  expedition: <Compass size={16} />,
};

const typeColors: Record<string, string> = {
  report: 'badge-ice',
  dataset: 'badge-cyan',
  publication: 'badge-aurora',
  photograph: 'badge-frost',
  video: 'badge-warm',
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
        results = results.filter(r => r.type === 'photograph' || r.type === 'video');
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

  return (
    <AppLayout>
      <div className="explore-page">
        <div className="explore-header">
          <h1>Explore Polar Science</h1>
          <p>Search and discover across expeditions, reports, datasets, publications, and media</p>

          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              className="input input-lg"
              placeholder="Search polar science... (e.g., sea ice, Arctic climate, glaciology)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '48px' }}
            />
          </div>
        </div>

        <div className="explore-body">
          {/* Filters Sidebar */}
          <aside className="filter-sidebar">
            <div className="filter-header">
              <h3><Filter size={16} /> Filters</h3>
              {hasFilters && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            <div className="filter-group">
              <label>Content Type</label>
              {['all', 'report', 'dataset', 'publication', 'photograph', 'video'].map(t => (
                <button
                  key={t}
                  className={`filter-option ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t !== 'all' && typeIcons[t]}
                  <span>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}</span>
                  <span className="filter-count">
                    {t === 'all' ? allResources.length : allResources.filter(r => r.type === t).length}
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
          </aside>

          {/* Results */}
          <div className="results-area">
            <div className="results-header">
              <span>{filtered.length} results{query && ` for "${query}"`}</span>
              {query && (
                <div className="results-context">
                  <Sparkles size={14} />
                  <span>Showing keyword matches. Semantic search available for deeper discovery.</span>
                </div>
              )}
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
                {filtered.map((resource, i) => (
                  <Link
                    href={`/repository/${resource.id}`}
                    key={resource.id}
                    className="result-card"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="result-card-icon" style={{
                      background: resource.type === 'report' ? 'rgba(56, 182, 230, 0.1)' :
                        resource.type === 'dataset' ? 'rgba(46, 196, 182, 0.1)' :
                        resource.type === 'publication' ? 'rgba(74, 222, 128, 0.1)' :
                        resource.type === 'photograph' ? 'rgba(192, 132, 252, 0.1)' :
                        'rgba(245, 158, 11, 0.1)',
                      color: resource.type === 'report' ? 'var(--ice-400)' :
                        resource.type === 'dataset' ? 'var(--cyan-400)' :
                        resource.type === 'publication' ? 'var(--aurora-400)' :
                        resource.type === 'photograph' ? 'var(--frost-400)' :
                        'var(--warm-400)',
                    }}>
                      {typeIcons[resource.type]}
                    </div>

                    <div className="result-card-content">
                      <div className="result-card-header">
                        <span className={`badge ${typeColors[resource.type] || 'badge-ice'}`}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </span>
                        <span className="badge badge-cyan">{resource.researchArea}</span>
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
                            transition: 'color var(--transition-fast)',
                          }}
                        >
                          {isBookmarked(resource.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                      </div>
                      <h4>{resource.title}</h4>
                      <p className="truncate-2">{resource.description}</p>
                      <div className="result-card-footer">
                        <div className="result-keywords">
                          {resource.keywords.slice(0, 3).map(k => (
                            <span key={k} className="tag">{k}</span>
                          ))}
                        </div>
                        <span className="result-link">
                          Open <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        
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
