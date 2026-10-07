'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Search, Bell, User, Command, Check, Eye, AlertCircle, Sparkles, ExternalLink, LogOut, ChevronRight, Menu, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { notifications } from '@/lib/data';
import SoundscapeToggle from '@/components/SoundscapeToggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifList, setNotifList] = useState(notifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const openCommandPalette = () => {
    window.dispatchEvent(new Event('open-command-palette'));
  };

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifList.filter((n) => !n.read).length;

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((seg, idx, arr) => {
      const url = '/' + arr.slice(0, idx + 1).join('/');
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
      return { url, label };
    });

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="app-main-wrapper">
        {/* Global Command Topbar */}
        <header className="global-topbar">
          {/* Institutional Masthead / Breadcrumbs */}
          {breadcrumbs.length === 0 ? (
            <div className="topbar-institution-tag" title="National Centre for Polar and Ocean Research • MoES, Govt. of India">
              <span className="inst-badge">MoES • NCPOR</span>
              <span className="inst-sep">/</span>
              <span className="inst-title">National Polar Science Portal</span>
            </div>
          ) : (
            <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">POLARA</Link>
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={b.url}>
                  <ChevronRight size={13} className="breadcrumb-sep" />
                  {i === breadcrumbs.length - 1 ? (
                    <span className="breadcrumb-current">{b.label}</span>
                  ) : (
                    <Link href={b.url} className="breadcrumb-link">{b.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          
          {/* Center Search Trigger & Live Polar Telemetry Badge */}
          <div className="topbar-center-group">
            <div className="topbar-search-trigger" onClick={openCommandPalette} role="button" tabIndex={0} title="Press Ctrl+K to search">
              <Search size={15} className="search-trigger-icon" />
              <span className="search-trigger-text">Search polar science, datasets, telemetry...</span>
              <div className="search-trigger-kbd">
                <Command size={11} />
                <span>K</span>
              </div>
            </div>

            <div className="topbar-telemetry-badge" title="NCPOR Real-Time Polar Network Feed">
              <span className="telemetry-live-dot" />
              <span className="telemetry-badge-text">ISEA-44 ACTIVE</span>
              <span className="telemetry-badge-sep">•</span>
              <span className="telemetry-badge-sub">IndARC -1.4°C</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="topbar-actions">
            {/* Arctic Soundscape Atmosphere */}
            <SoundscapeToggle />

            {/* Notifications Popover */}
            <div className="popover-anchor" ref={notifRef}>
              <button
                className={`topbar-icon-btn ${notifOpen ? 'active' : ''}`}
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="View notifications"
                aria-expanded={notifOpen}
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="dropdown-header">
                    <div>
                      <div className="dropdown-title">Telemetry Alerts</div>
                      <div className="dropdown-subtitle">{unreadCount} unread operational alerts</div>
                    </div>
                    {unreadCount > 0 && (
                      <button className="mark-read-btn" onClick={markAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="dropdown-list">
                    {notifList.map((n) => (
                      <div key={n.id} className={`dropdown-item ${n.read ? 'read' : 'unread'}`}>
                        <div className={`dropdown-item-icon ${n.type}`}>
                          {n.type === 'upload_complete' ? <Check size={14} /> :
                           n.type === 'review_required' ? <Eye size={14} /> :
                           n.type === 'approval_required' ? <AlertCircle size={14} /> :
                           <Sparkles size={14} />}
                        </div>
                        <div className="dropdown-item-content">
                          <div className="item-title">{n.title}</div>
                          <div className="item-msg">{n.message}</div>
                        </div>
                        {!n.read && <div className="unread-pip" />}
                      </div>
                    ))}
                  </div>

                  <div className="dropdown-footer">
                    <Link href="/admin" onClick={() => setNotifOpen(false)} className="dropdown-footer-link">
                      Open Mission Control Logs <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Popover */}
            <div className="popover-anchor" ref={profileRef}>
              <button
                className="topbar-user-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="User profile menu"
                aria-expanded={profileOpen}
              >
                <div className="user-text-col">
                  <div className="user-name">{user ? user.name : 'Dr. A. Frost'}</div>
                  <div className="user-sub">{user ? user.role.toUpperCase() : 'LEAD SCIENTIST'}</div>
                </div>
                <div className="user-avatar-pip">
                  <User size={15} />
                </div>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-head">
                    <div className="profile-head-name">{user ? user.name : 'Dr. A. Frost'}</div>
                    <div className="profile-head-email">{user ? user.email : 'frost.polar@ncpor.gov.in'}</div>
                    <span className="badge badge-ice" style={{ marginTop: '6px' }}>
                      {user ? user.institution || 'NCPOR Goa' : 'National Centre for Polar and Ocean Research'}
                    </span>
                  </div>

                  <div className="profile-menu">
                    <Link href="/dashboard" className="profile-link" onClick={() => setProfileOpen(false)}>
                      My Dashboard
                    </Link>
                    <Link href="/collections" className="profile-link" onClick={() => setProfileOpen(false)}>
                      My Saved Research Dossiers
                    </Link>
                    <Link href="/explore" className="profile-link" onClick={() => setProfileOpen(false)}>
                      Scientific Explorations
                    </Link>
                    <Link href="/admin" className="profile-link" onClick={() => setProfileOpen(false)}>
                      Observatory Settings
                    </Link>
                  </div>

                  <div className="profile-foot">
                    {isAuthenticated ? (
                      <button className="profile-logout-btn" onClick={() => { logout(); setProfileOpen(false); }}>
                        <LogOut size={14} /> Sign Out of Platform
                      </button>
                    ) : (
                      <Link href="/login" className="profile-login-link" onClick={() => setProfileOpen(false)}>
                        Sign In for Full Clearance
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
