'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/lib/auth';
import { platformStats, notifications, reports } from '@/lib/data';
import './page.css';
import {
  Settings, FileText, Compass, BookOpen, BarChart3,
  Image as ImageIcon, GraduationCap, Sparkles, Users, Activity,
  Bell, Check, Eye, AlertCircle, TrendingUp, Search, MessageCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout>
        <div style={{ padding: 'var(--space-16) var(--space-8)', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }} />
          <h2>Admin Access Required</h2>
          <p style={{ marginBottom: 'var(--space-4)' }}>Please sign in as an administrator to access this page.</p>
          <Link href="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1><Settings size={28} /> Admin Dashboard</h1>
            <p>Platform overview and content management</p>
          </div>
          <div className="admin-header-note">
            <Sparkles size={14} />
            <span>Prototype Dataset</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          {[
            { value: platformStats.totalResources.toLocaleString(), label: 'Knowledge Resources', icon: <FileText size={20} />, color: 'var(--ice-500)' },
            { value: platformStats.expeditions.toString(), label: 'Expeditions', icon: <Compass size={20} />, color: 'var(--cyan-500)' },
            { value: platformStats.publications.toString(), label: 'Publications', icon: <BookOpen size={20} />, color: 'var(--aurora-500)' },
            { value: platformStats.datasets.toString(), label: 'Datasets', icon: <BarChart3 size={20} />, color: 'var(--frost-500)' },
            { value: platformStats.mediaAssets.toLocaleString(), label: 'Media Assets', icon: <ImageIcon size={20} />, color: 'var(--warm-500)' },
            { value: platformStats.learningResources.toString(), label: 'Learning Resources', icon: <GraduationCap size={20} />, color: 'var(--danger-400)' },
          ].map(stat => (
            <div key={stat.label} className="kpi-card">
              <div className="kpi-icon" style={{ color: stat.color, background: `${stat.color}12` }}>
                {stat.icon}
              </div>
              <div className="kpi-value">{stat.value}</div>
              <div className="kpi-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="admin-grid">
          {/* Notifications */}
          <div className="admin-panel">
            <h3><Bell size={18} /> Recent Notifications</h3>
            <div className="notif-list">
              {notifications.map(notif => (
                <div key={notif.id} className={`notif-item ${notif.read ? '' : 'unread'}`}>
                  <div className={`notif-icon ${notif.type}`}>
                    {notif.type === 'upload_complete' ? <Check size={14} /> :
                     notif.type === 'review_required' ? <Eye size={14} /> :
                     notif.type === 'approval_required' ? <AlertCircle size={14} /> :
                     <Sparkles size={14} />}
                  </div>
                  <div className="notif-content">
                    <span className="notif-title">{notif.title}</span>
                    <span className="notif-msg">{notif.message}</span>
                  </div>
                  {!notif.read && <div className="notif-dot" />}
                </div>
              ))}
            </div>
          </div>

          {/* AI Processing */}
          <div className="admin-panel">
            <h3><Sparkles size={18} /> AI Processing</h3>
            <div className="ai-stats">
              {[
                { label: 'Documents Processed', value: '847' },
                { label: 'Metadata Extracted', value: '1,203' },
                { label: 'Pending Reviews', value: '12' },
                { label: 'AI-Generated Content', value: '234' },
              ].map(stat => (
                <div key={stat.label} className="ai-stat-item">
                  <span className="ai-stat-value">{stat.value}</span>
                  <span className="ai-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Moderation */}
          <div className="admin-panel">
            <h3><Eye size={18} /> Content Moderation</h3>
            <div className="moderation-list">
              {reports.slice(0, 3).map(report => (
                <div key={report.id} className="moderation-item">
                  <div className="moderation-info">
                    <span className="moderation-title">{report.title.substring(0, 50)}...</span>
                    <div className="moderation-meta">
                      <span className="badge badge-ice">{report.researchArea}</span>
                      <span className="badge badge-aurora">{report.status}</span>
                    </div>
                  </div>
                  <div className="moderation-actions">
                    <button className="btn btn-ghost btn-sm"><Eye size={14} /> Review</button>
                    <button className="btn btn-primary btn-sm"><Check size={14} /> Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Activity */}
          <div className="admin-panel">
            <h3><Activity size={18} /> User Activity</h3>
            <div className="activity-stats">
              {[
                { label: 'Searches Today', value: '342', trend: '+12%', icon: <Search size={14} /> },
                { label: 'Resource Views', value: '1,847', trend: '+8%', icon: <Eye size={14} /> },
                { label: 'AI Questions', value: '156', trend: '+23%', icon: <MessageCircle size={14} /> },
                { label: 'Active Users', value: '89', trend: '+5%', icon: <Users size={14} /> },
              ].map(stat => (
                <div key={stat.label} className="activity-item">
                  <div className="activity-icon">{stat.icon}</div>
                  <div className="activity-info">
                    <span className="activity-value">{stat.value}</span>
                    <span className="activity-label">{stat.label}</span>
                  </div>
                  <span className="activity-trend"><TrendingUp size={12} /> {stat.trend}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outreach */}
          <div className="admin-panel">
            <h3><Sparkles size={18} /> Outreach Pipeline</h3>
            <div className="outreach-stats">
              {[
                { label: 'Drafts', value: 8, color: 'var(--warm-400)' },
                { label: 'Pending Approval', value: 4, color: 'var(--ice-400)' },
                { label: 'Published', value: 23, color: 'var(--aurora-400)' },
              ].map(stat => (
                <div key={stat.label} className="outreach-stat">
                  <div className="outreach-stat-bar">
                    <div className="outreach-stat-fill" style={{
                      width: `${(stat.value / 35) * 100}%`,
                      background: stat.color
                    }} />
                  </div>
                  <div className="outreach-stat-info">
                    <span style={{ color: stat.color }}>{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Topics */}
          <div className="admin-panel">
            <h3><TrendingUp size={18} /> Popular Topics</h3>
            <div className="topics-list">
              {[
                { topic: 'Antarctic sea ice', searches: 234 },
                { topic: 'Arctic climate change', searches: 187 },
                { topic: 'Southern Ocean', searches: 156 },
                { topic: 'Polar biodiversity', searches: 123 },
                { topic: 'Glaciology research', searches: 98 },
                { topic: 'Indian expeditions', searches: 87 },
              ].map((item, i) => (
                <div key={item.topic} className="topic-item">
                  <span className="topic-rank">{i + 1}</span>
                  <span className="topic-name">{item.topic}</span>
                  <span className="topic-count">{item.searches}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        
      </div>
    </AppLayout>
  );
}
