'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import {
  Snowflake, Mail, Lock, ArrowRight, User as UserIcon,
  Building, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/lib/toast';
import './page.css';

export default function LoginPage() {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  
  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('researcher');
  const [regInstitution, setRegInstitution] = useState('');

  const { login, loginDemo, register } = useAuth();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      success('Authentication Successful', 'Welcome to the POLARA scientific network.');
      router.push('/');
    } else {
      setError(res.error || 'Failed to authenticate');
      showError('Authentication Failed', res.error || 'Invalid credentials');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      institution: regInstitution || 'Polar Science Network',
    });
    setIsSubmitting(false);

    if (res.success) {
      success('Account Created', 'Welcome aboard! Your session is now active.');
      router.push('/');
    } else {
      setError(res.error || 'Failed to register account');
      showError('Registration Failed', res.error || 'Could not complete registration');
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setIsSubmitting(true);
    setError('');
    const res = await loginDemo(demoEmail);
    setIsSubmitting(false);

    if (res.success) {
      success('Access Granted', `Signed in as ${demoEmail}`);
      router.push('/');
    } else {
      setError(res.error || 'Failed to sign in');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-gradient-1" />
        <div className="login-gradient-2" />
      </div>

      <div className="login-container" style={{ maxWidth: '480px' }}>
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <Snowflake size={28} />
            </div>
            <h1>POLARA</h1>
            <p>Polar Outreach, Learning & Research Archive</p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: 'var(--navy-900)', padding: '4px', borderRadius: '10px', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: tab === 'signin' ? 'var(--ice-500)' : 'transparent',
                color: tab === 'signin' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: tab === 'register' ? 'var(--ice-500)' : 'transparent',
                color: tab === 'register' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Create Account
            </button>
          </div>

          {tab === 'signin' ? (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Scientist / Member Email</label>
                <div className="input-wrapper">
                  <Mail size={16} />
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="e.g. researcher@ncpor.res.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password">Security Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="input-wrapper">
                  <Lock size={16} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to POLARA'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="login-form">
              <div className="form-group">
                <label htmlFor="regName">Full Legal / Academic Name</label>
                <div className="input-wrapper">
                  <UserIcon size={16} />
                  <input
                    id="regName"
                    type="text"
                    className="input"
                    placeholder="e.g. Dr. Priya Sharma"
                    value={regName}
                    onChange={(e) => { setRegName(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regEmail">Academic / Institutional Email</label>
                <div className="input-wrapper">
                  <Mail size={16} />
                  <input
                    id="regEmail"
                    type="email"
                    className="input"
                    placeholder="e.g. psharma@ncpor.res.in"
                    value={regEmail}
                    onChange={(e) => { setRegEmail(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regInstitution">Affiliation / Institution</label>
                <div className="input-wrapper">
                  <Building size={16} />
                  <input
                    id="regInstitution"
                    type="text"
                    className="input"
                    placeholder="e.g. NCPOR, Goa / IIT Bombay"
                    value={regInstitution}
                    onChange={(e) => { setRegInstitution(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="regRole">Primary Research Role</label>
                <select
                  id="regRole"
                  className="input"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  style={{ width: '100%' }}
                >
                  <option value="researcher">Lead Researcher / Scientist</option>
                  <option value="student">Graduate / University Student</option>
                  <option value="educator">Academic Faculty / Educator</option>
                  <option value="public">Science Enthusiast / Public</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="regPassword">Account Password</label>
                <div className="input-wrapper">
                  <Lock size={16} />
                  <input
                    id="regPassword"
                    type="password"
                    className="input"
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Register Secure Account'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="login-divider">
            <span>Instant Pre-Configured Researcher Accounts</span>
          </div>

          <div className="demo-accounts">
            {[
              { email: 'admin@polara.demo', role: 'Administrator', desc: 'Dr. Priya Sharma • Lead Admin' },
              { email: 'researcher@polara.demo', role: 'Researcher', desc: 'Dr. Arjun Mehta • Oceanography' },
              { email: 'educator@polara.demo', role: 'Educator', desc: 'Prof. Kavita Nair • IIT Bombay' },
              { email: 'student@polara.demo', role: 'Student', desc: 'Rohan Patel • Polar Biology' },
            ].map(account => (
              <button
                key={account.email}
                className="demo-account-btn"
                onClick={() => quickLogin(account.email)}
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}
              >
                <div className="demo-account-info" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="demo-account-role">{account.role}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>• Instant Demo Access</span>
                  </div>
                  <span className="demo-account-email" style={{ fontSize: '0.75rem', color: 'var(--ice-300)' }}>{account.desc}</span>
                </div>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>

          <p className="login-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            <ShieldCheck size={14} color="var(--aurora-400)" />
            <span>Secure salted SHA-256 cryptographic auth with persistent local storage.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
