'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/auth';
import { useBookmarks } from '@/lib/bookmarks';
import { useToast } from '@/lib/toast';
import {
  User as UserIcon, Mail, Building, Shield, Bookmark,
  Edit, Save, LogOut, ExternalLink, Calendar, CheckCircle,
  FileText, Sparkles, Key
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile, switchRole } = useAuth();
  const { bookmarkedItems, toggleBookmark } = useBookmarks();
  const { success, error: showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <AppLayout>
        <div style={{ maxWidth: '600px', margin: '60px auto', padding: '32px', textAlign: 'center', background: 'var(--navy-800)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(30, 62, 98, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--ice-400)' }}>
            <UserIcon size={32} />
          </div>
          <h2 style={{ marginBottom: '8px' }}>Sign In Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Please authenticate to view your polar scientific credentials, saved research dossiers, and session telemetry.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg">
            Sign In to POLARA
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateProfile({
      name,
      institution,
      bio,
    });
    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
      success('Profile Updated', 'Your scientist profile details have been saved.');
    } else {
      showError('Update Failed', res.error || 'Could not update profile');
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
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
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{user.name}</h1>
                <span className="badge badge-aurora" style={{ textTransform: 'capitalize' }}>
                  {user.role}
                </span>
                {user.provider && (
                  <span className="badge" style={{
                    background: user.provider === 'google' ? 'rgba(66, 133, 244, 0.15)' : 'rgba(30, 62, 98, 0.35)',
                    border: `1px solid ${user.provider === 'google' ? 'rgba(66, 133, 244, 0.4)' : 'rgba(30, 62, 98, 0.6)'}`,
                    color: user.provider === 'google' ? '#93c5fd' : '#e0e7ff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                  }}>
                    {user.provider === 'google' ? 'Google OAuth' : user.provider === 'github' ? 'GitHub SSO' : 'Email Auth'}
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
                {user.email} • {user.institution || 'Affiliation Pending'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isEditing ? (
              <>
                <button className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                  <Save size={16} /> Save Changes
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => {
                  setName(user.name);
                  setInstitution(user.institution || '');
                  setBio(user.bio || '');
                  setIsEditing(true);
                }}>
                  <Edit size={16} /> Edit Profile
                </button>
                <button className="btn btn-ghost" onClick={logout} style={{ color: 'var(--warm-500)' }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Profile Card */}
          <div style={{ background: 'var(--navy-850)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--ice-400)" /> Scientific Credentials
            </h3>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Full Name</label>
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Affiliation / Institute</label>
                  <input
                    type="text"
                    className="input"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Biography / Research Mission</label>
                  <textarea
                    className="input"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Account ID</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--ice-300)' }}>{user.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Official Email</span>
                  <span>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Institution</span>
                  <span style={{ color: 'var(--ice-200)', fontWeight: 500 }}>{user.institution || 'NCPOR Partner'}</span>
                </div>
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>Research Areas</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(user.researchAreas || ['Cryosphere', 'Climate Science']).map((area, idx) => (
                      <span key={idx} className="badge badge-ice" style={{ fontSize: '0.72rem' }}>
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Biography</span>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {user.bio || 'Active researcher participating in POLARA polar science repository operations.'}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Role Switcher for Testing */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '8px' }}>
                Switch Platform Role:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['admin', 'researcher', 'educator', 'student', 'public'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      success('Role Switched', `Active role is now ${r}`);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: user.role === r ? '1px solid var(--ice-400)' : '1px solid var(--border-subtle)',
                      background: user.role === r ? 'rgba(30, 62, 98, 0.15)' : 'var(--navy-900)',
                      color: user.role === r ? 'var(--ice-300)' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Bookmarks & Research Dossiers */}
          <div style={{ background: 'var(--navy-850)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bookmark size={18} color="var(--aurora-400)" /> Saved Research Dossiers ({bookmarkedItems.length})
              </h3>
              <Link href="/explore" style={{ fontSize: '0.8rem', color: 'var(--ice-400)' }}>
                Browse More
              </Link>
            </div>

            {bookmarkedItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
                <Bookmark size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No bookmarked research documents yet.</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem' }}>Click the bookmark icon on any dataset or report to save it here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bookmarkedItems.map(bm => (
                  <div key={bm.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'var(--navy-900)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ overflow: 'hidden' }}>
                      <Link href={`/repository/${bm.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {bm.title}
                      </Link>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        {bm.type.toUpperCase()} • {bm.researchArea || bm.region} • {bm.year}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <Link href={`/repository/${bm.id}`} className="btn-icon" title="Open resource">
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        onClick={() => toggleBookmark(bm)}
                        className="btn-icon"
                        title="Remove from dossier"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
