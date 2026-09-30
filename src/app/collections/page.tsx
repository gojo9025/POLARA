'use client';
import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { researchAreas } from '@/lib/data';
import { Layers, ArrowRight } from 'lucide-react';

export default function CollectionsPage() {
  return (
    <AppLayout>
      <div style={{ padding: 'var(--space-8)', maxWidth: 'var(--content-max-width)' }}>
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Home</Link> / <span>Collections</span>
        </div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Layers size={28} /> Knowledge Collections
        </h1>
        <p style={{ marginBottom: '32px' }}>Curated research areas and scientific disciplines</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {researchAreas.map((area, i) => (
            <Link href={`/explore?area=${encodeURIComponent(area.name)}`} key={area.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-lg)', padding: '24px', textDecoration: 'none',
              animation: `fadeIn 0.4s ease-out ${i * 60}ms forwards`, opacity: 0,
              transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
            }}
            className="hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-1"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', 
                  background: `${area.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {area.icon}
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', background: 'var(--bg-surface)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                  {area.resourceCount} items
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{area.name}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', flex: 1 }}>{area.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', color: area.color, fontSize: '0.875rem', fontWeight: 500, gap: '4px', marginTop: 'auto' }}>
                Explore Collection <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
