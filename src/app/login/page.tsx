'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Snowflake, Mail, Lock, ArrowRight } from 'lucide-react';
import './page.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password || 'demo')) {
      router.push('/');
    } else {
      setError('Invalid credentials. Use one of the demo accounts below.');
    }
  };

  const quickLogin = (email: string) => {
    if (login(email, 'demo')) {
      router.push('/');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-gradient-1" />
        <div className="login-gradient-2" />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <Snowflake size={28} />
            </div>
            <h1>POLARA</h1>
            <p>Polar Outreach, Learning & Research Archive</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail size={16} />
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={16} />
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Sign In <ArrowRight size={16} />
            </button>
          </form>

          <div className="login-divider">
            <span>Demo Accounts</span>
          </div>

          <div className="demo-accounts">
            {[
              { email: 'admin@polara.demo', role: 'Administrator', desc: 'Full platform access' },
              { email: 'researcher@polara.demo', role: 'Researcher', desc: 'Upload & manage research' },
              { email: 'educator@polara.demo', role: 'Educator', desc: 'Educational tools access' },
              { email: 'student@polara.demo', role: 'Student', desc: 'Learning & discovery' },
            ].map(account => (
              <button
                key={account.email}
                className="demo-account-btn"
                onClick={() => quickLogin(account.email)}
              >
                <div className="demo-account-info">
                  <span className="demo-account-role">{account.role}</span>
                  <span className="demo-account-email">{account.email}</span>
                </div>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>

          <p className="login-note">
            This is a prototype. Demo accounts use any password.
          </p>
        </div>
      </div>

      
    </div>
  );
}
