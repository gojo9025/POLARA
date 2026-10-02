'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Search, Bell, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/explore?q=${encodeURIComponent(search)}`);
    }
  };

  const pathNameDisplay = pathname === '/' ? 'Dashboard' : pathname.replace('/', '').charAt(0).toUpperCase() + pathname.slice(2);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <header className="global-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(6, 10, 20, 0.85)', backdropFilter: 'blur(20px) saturate(1.4)', borderBottom: '1px solid rgba(56, 182, 230, 0.06)', zIndex: 10, flexWrap: 'wrap', gap: '16px' }}>
          <div className="topbar-breadcrumb" style={{ fontSize: '14px', color: '#6b7a9e', fontWeight: 500, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            Dashboard &nbsp; <span style={{color: '#45567a'}}>&gt;</span> &nbsp; <span style={{color: '#e8ecf4'}}>{pathNameDisplay}</span>
          </div>
          
          <form className="topbar-search" onSubmit={handleSearch} style={{ position: 'relative', flex: '1 1 200px', maxWidth: '400px', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#45567a' }} />
            <input 
              type="text" 
              placeholder="Search data..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 16px 8px 36px', borderRadius: '8px', border: '1px solid rgba(56, 182, 230, 0.12)', background: 'rgba(15, 22, 41, 0.8)', color: '#e8ecf4', fontSize: '13px', outline: 'none' }} 
            />
          </form>

          <div className="topbar-user" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#6b7a9e', cursor: 'pointer' }}><Bell size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8ecf4' }}>Dr. A. Frost</div>
                <div style={{ fontSize: '11px', color: '#6b7a9e' }}>Lead Researcher</div>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(56, 182, 230, 0.3), rgba(46, 196, 182, 0.3))', border: '1px solid rgba(56, 182, 230, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5cc9ef' }}>
                <User size={16} />
              </div>
            </div>
          </div>
        </header>
        <main className="app-main" style={{ flex: 1, overflowY: 'auto', background: '#060a14', padding: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
