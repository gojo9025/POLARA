'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { reports, datasets, publications } from '@/lib/data';
import './page.css';
import {
  Database, FileText, BarChart3, BookOpen, ArrowRight, Sparkles
} from 'lucide-react';

export default function RepositoryPage() {
  return (
    <AppLayout>
      <div className="repo-page">
        <div className="page-header">
          <h1><Database size={28} /> Knowledge Repository</h1>
          <p>Browse the structured polar science knowledge base</p>
        </div>

        <div className="repo-categories">
          {[
            { title: 'Research Reports', icon: <FileText size={24} />, count: reports.length, items: reports, href: '/explore?type=report', color: 'var(--ice-500)' },
            { title: 'Datasets', icon: <BarChart3 size={24} />, count: datasets.length, items: datasets, href: '/explore?type=dataset', color: 'var(--cyan-500)' },
            { title: 'Publications', icon: <BookOpen size={24} />, count: publications.length, items: publications, href: '/explore?type=publication', color: 'var(--aurora-500)' },
          ].map((cat, i) => (
            <div key={cat.title} className="repo-cat" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="repo-cat-header">
                <div className="repo-cat-icon" style={{ color: cat.color, background: `${cat.color}12` }}>
                  {cat.icon}
                </div>
                <div>
                  <h2>{cat.title}</h2>
                  <span>{cat.count} resources</span>
                </div>
                <Link href={cat.href} className="btn btn-ghost">View all <ArrowRight size={16} /></Link>
              </div>

              <div className="repo-cat-list">
                {cat.items.slice(0, 3).map((item: any) => (
                  <Link href={`/repository/${item.id}`} key={item.id} className="repo-item">
                    <h4>{item.title}</h4>
                    <p className="truncate-2">{item.description || item.abstract}</p>
                    <div className="repo-item-meta">
                      <span className="badge badge-ice">{item.researchArea}</span>
                      <span>{item.year}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="repo-cta">
          <Sparkles size={20} />
          <p>Need help finding something? Use the AI-powered search or ask POLARA directly.</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link href="/explore" className="btn btn-primary">Search Repository</Link>
            <Link href="/ask" className="btn btn-secondary">Ask POLARA</Link>
          </div>
        </div>

        
      </div>
    </AppLayout>
  );
}
