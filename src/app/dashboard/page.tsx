'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { Shield, Bookmark, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';
import { useBookmarks } from '@/lib/bookmarks';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { bookmarkedItems } = useBookmarks();

  if (!isAuthenticated || !user) {
    return (
      <AppLayout>
        <div style={{ maxWidth: '600px', margin: '60px auto', padding: '32px', textAlign: 'center', background: 'var(--navy-800)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(30, 62, 98, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--ice-400)' }}>
            <LayoutDashboard size={32} />
          </div>
          <h2 style={{ marginBottom: '8px' }}>Sign In Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Please authenticate to view your dashboard.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg">
            Sign In to POLARA
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--ice-500)' }} />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--ice-500), var(--aurora-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 800,
              fontSize: '2rem',
              boxShadow: '0 8px 24px rgba(30, 62, 98, 0.3)',
            }}>
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(90deg, #fff, var(--ice-400))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '8px 0 0 0' }}>
              Your POLARA Researcher Dashboard
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Quick Actions */}
          <div style={{ background: 'var(--navy-850)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="var(--ice-400)" /> Profile & Security
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Logged in via {user.provider === 'google' ? 'Google' : user.provider === 'github' ? 'GitHub' : 'Email'}.<br />
              Role: <span style={{ textTransform: 'capitalize', color: 'var(--ice-300)' }}>{user.role}</span>
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/profile" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <UserIcon size={16} /> View Profile
              </Link>
            </div>
          </div>

          {/* Bookmarks */}
          <div style={{ background: 'var(--navy-850)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bookmark size={20} color="var(--aurora-400)" /> Recent Bookmarks
            </h3>
            {bookmarkedItems.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                No bookmarks yet. Explore the repository to save research papers and datasets.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bookmarkedItems.slice(0, 3).map(bm => (
                  <Link key={bm.id} href={`/repository/${bm.id}`} style={{
                    display: 'block',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--navy-900)',
                    textDecoration: 'none',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {bm.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      {bm.type}
                    </span>
                  </Link>
                ))}
                {bookmarkedItems.length > 3 && (
                  <Link href="/profile" style={{ fontSize: '0.85rem', color: 'var(--ice-400)', textAlign: 'center', display: 'block', marginTop: '8px' }}>
                    View all {bookmarkedItems.length} bookmarks
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
