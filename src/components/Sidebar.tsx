'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Home, Compass, Database, Navigation, BookOpenCheck, FileText,
  BarChart3, Film, GraduationCap, Sparkles,
  Megaphone, Bookmark, ShieldCheck, Settings, LogOut, ChevronLeft,
  ChevronRight, User, Bell, Globe, Snowflake, Menu, X, PlayCircle
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home size={18} /> },
  { label: 'Dashboard', href: '/dashboard', icon: <User size={18} />, roles: ['researcher', 'educator', 'student', 'admin', 'public'] },
  { label: 'Explore', href: '/explore', icon: <Compass size={18} /> },
  { label: 'Repository', href: '/repository', icon: <Database size={18} /> },
  { label: 'Expeditions', href: '/expeditions', icon: <Navigation size={18} /> },
  { label: 'Publications', href: '/explore?type=publication', icon: <FileText size={18} /> },
  { label: 'Datasets', href: '/explore?type=dataset', icon: <BarChart3 size={18} /> },
  { label: 'Media', href: '/explore?type=media', icon: <Film size={18} /> },
  { label: 'Learning Hub', href: '/learning', icon: <BookOpenCheck size={18} /> },
  { label: 'Ask POLARA', href: '/ask', icon: <Sparkles size={18} /> },
  { label: 'Outreach Studio', href: '/outreach', icon: <Megaphone size={18} />, roles: ['admin', 'researcher'] },
  { label: 'Collections', href: '/collections', icon: <Bookmark size={18} /> },
  { label: 'Admin', href: '/admin', icon: <ShieldCheck size={18} />, roles: ['admin'] },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ collapsed: propCollapsed, onToggleCollapse }: SidebarProps = {}) {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isControlled = propCollapsed !== undefined;
  const collapsed = isControlled ? propCollapsed : localCollapsed;
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(prev => !prev);
    }
  };

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo" onClick={() => setMobileOpen(false)}>
            <div className="sidebar-logo-icon">
              <Snowflake size={20} />
            </div>
            {!collapsed && (
              <div className="sidebar-logo-text">
                <span className="sidebar-logo-name">POLARA</span>
                <span className="sidebar-logo-subtitle">Polar Science Archive</span>
              </div>
            )}
          </Link>
          <button
            className="sidebar-collapse-btn"
            onClick={handleToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {!collapsed && <span className="sidebar-section-label">Navigation</span>}
            {filteredItems.slice(0, 4).map(item => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href}
                collapsed={collapsed}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>

          <div className="sidebar-section">
            {!collapsed && <span className="sidebar-section-label">Research</span>}
            {filteredItems.slice(4, 7).map(item => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href}
                collapsed={collapsed}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>

          <div className="sidebar-section">
            {!collapsed && <span className="sidebar-section-label">Knowledge</span>}
            {filteredItems.slice(7).map(item => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href || pathname.startsWith(item.href + '/')}
                collapsed={collapsed}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          {isAuthenticated && user ? (
            <div className="sidebar-user">
              <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit', flex: 1, overflow: 'hidden' }}>
                <div className="sidebar-user-avatar">
                  <User size={16} />
                </div>
                {!collapsed && (
                  <div className="sidebar-user-info">
                    <span className="sidebar-user-name">{user.name}</span>
                    <span className="sidebar-user-role">{user.role}</span>
                  </div>
                )}
              </Link>
              {!collapsed && (
                <button className="sidebar-logout" onClick={logout} aria-label="Sign out">
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ) : (
            <Link href="/login" className="sidebar-login-btn" onClick={() => setMobileOpen(false)}>
              <Globe size={18} />
              {!collapsed && <span>Sign In for Access</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

function NavLink({ item, active, collapsed, onClick }: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`nav-link-wrapper ${active ? 'active' : ''}`}
      title={collapsed ? item.label : undefined}
    >
      <span className="icon-wrap">{item.icon}</span>
      {!collapsed && <span className="nav-label">{item.label}</span>}
    </Link>
  );
}
