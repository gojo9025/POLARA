
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import './page.css';
import AppLayout from '@/components/AppLayout';
import { expeditions } from '@/lib/data';
import { 
  Compass, ArrowRight, MapPin, Calendar, Users, Filter, 
  Search, LayoutGrid, List as ListIcon, FileText, Database, 
  BookOpen, Camera, Video
} from 'lucide-react';

export default function ExpeditionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const regions = ['all', 'Antarctica', 'Arctic', 'Southern Ocean', 'Himalayas'];

  const filteredExpeditions = useMemo(() => {
    let result = expeditions;
    
    if (regionFilter !== 'all') {
      result = result.filter(e => e.region === regionFilter);
    }
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q) ||
        e.expeditionNumber.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [regionFilter, searchQuery]);

  return (
    <AppLayout>
      <div className="expeditions-page">
        
        {/* Premium Header */}
        <div className="premium-header">
          <div className="header-background" />
          <div className="header-content">
            <div className="page-breadcrumb">
              <Link href="/">Home</Link> / <span>Expeditions</span>
            </div>
            
            <div className="title-section">
              <div className="title-icon">
                <Compass size={32} />
              </div>
              <div className="title-text">
                <h1>Expedition Explorer</h1>
                <p>Discover India&apos;s pioneering polar research missions, their findings, and the researchers behind them.</p>
              </div>
            </div>
            
            <div className="header-stats">
              <div className="stat-pill">
                <span className="stat-val">{expeditions.length}</span>
                <span className="stat-label">Total Missions</span>
              </div>
              <div className="stat-pill">
                <span className="stat-val">4</span>
                <span className="stat-label">Active Regions</span>
              </div>
              <div className="stat-pill">
                <span className="stat-val">{expeditions.reduce((acc, curr) => acc + curr.participants.length, 0)}</span>
                <span className="stat-label">Researchers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          {/* Controls Bar */}
          <div className="controls-bar">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name, location, or keyword..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters-wrapper">
              <div className="region-filters">
                <Filter size={16} className="filter-icon" />
                <div className="filter-scroll">
                  {regions.map(r => (
                    <button
                      key={r}
                      className={`filter-pill ${regionFilter === r ? 'active' : ''}`}
                      onClick={() => setRegionFilter(r)}
                    >
                      {r === 'all' ? 'All Regions' : r}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="view-toggles">
                <button 
                  className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List View"
                >
                  <ListIcon size={18} />
                </button>
                <button 
                  className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid View"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="results-header">
            <span>Showing {filteredExpeditions.length} expedition{filteredExpeditions.length !== 1 ? 's' : ''}</span>
          </div>

          {filteredExpeditions.length === 0 ? (
            <div className="empty-state">
              <Compass size={48} className="empty-icon" />
              <h3>No expeditions found</h3>
              <p>Try adjusting your search or region filters.</p>
              <button 
                className="btn btn-secondary mt-4"
                onClick={() => { setSearchQuery(''); setRegionFilter('all'); }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={`expedition-${viewMode}`}>
              {filteredExpeditions.map((exp, i) => (
                <Link href={`/expeditions/${exp.id}`} key={exp.id} className="exp-card" style={{ animationDelay: `${i * 60}ms` }}>
                  
                  <div className="exp-image-container">
                    <div className="exp-image-overlay" />
                    <img src={exp.imageUrl} alt={exp.name} className="exp-bg-image" />
                    
                    <div className="exp-badges">
                      <span className="badge badge-ice blur-backdrop">{exp.region}</span>
                      <span className="badge badge-aurora blur-backdrop">{exp.year}</span>
                    </div>
                  </div>

                  <div className="exp-content">
                    <div className="exp-header-meta">
                      <span className="exp-number">{exp.expeditionNumber}</span>
                      <span className="exp-status">
                        <span className="status-dot"></span> Completed
                      </span>
                    </div>

                    <h3 className="exp-title">{exp.name}</h3>

                    <div className="exp-details">
                      <div className="detail-item">
                        <MapPin size={14} /> <span>{exp.location}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={14} /> <span>{exp.startDate} to {exp.endDate}</span>
                      </div>
                      <div className="detail-item">
                        <Users size={14} /> <span>{exp.participants.length} Lead Researchers</span>
                      </div>
                    </div>

                    <p className="exp-desc truncate-2">{exp.description}</p>

                    <div className="exp-areas">
                      {exp.researchAreas.slice(0, 3).map(area => (
                        <span key={area} className="area-tag">{area}</span>
                      ))}
                      {exp.researchAreas.length > 3 && <span className="area-tag">+{exp.researchAreas.length - 3}</span>}
                    </div>

                    <div className="exp-footer">
                      <div className="resource-stats">
                        <div className="r-stat" title="Reports"><FileText size={14} /> {exp.resourceCount.reports}</div>
                        <div className="r-stat" title="Datasets"><Database size={14} /> {exp.resourceCount.datasets}</div>
                        <div className="r-stat" title="Publications"><BookOpen size={14} /> {exp.resourceCount.publications}</div>
                        <div className="r-stat" title="Photos"><Camera size={14} /> {exp.resourceCount.photographs}</div>
                        <div className="r-stat" title="Videos"><Video size={14} /> {exp.resourceCount.videos}</div>
                      </div>
                      <span className="explore-link">
                        Explore <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
