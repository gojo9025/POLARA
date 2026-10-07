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
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('researcher');
  const [regInstitution, setRegInstitution] = useState('');

  const { login, loginDemo, loginOAuth, register } = useAuth();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    setError('');
    try {
      await new Promise(r => setTimeout(r, 450));
      const res = await loginOAuth(provider);
      if (res.success) {
        success(
          `${provider === 'google' ? 'Google' : 'GitHub'} Verified`,
          `Welcome, ${provider === 'google' ? 'Goushik S' : 'gojo9025'}! Accessing POLARA scientific network.`
        );
        router.push('/');
      } else {
        setError(res.error || `Failed to sign in with ${provider}`);
        showError('Authentication Failed', res.error || `Could not sign in with ${provider}`);
      }
    } finally {
      setOauthLoading(null);
    }
  };

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
          <div style={{ display: 'flex', background: 'var(--navy-900)', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
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

          {/* 1-Click Fast OAuth SSO */}
          <div className="oauth-container">
            <button
              type="button"
              className="oauth-btn oauth-btn-google"
              onClick={() => handleOAuth('google')}
              disabled={isSubmitting || oauthLoading !== null}
              id="login-oauth-google"
              title="Sign in with your Google account"
            >
              {oauthLoading === 'google' ? (
                <span className="oauth-spinner" />
              ) : (
                <svg className="oauth-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              )}
              <span>
                {oauthLoading === 'google'
                  ? 'Connecting Google...'
                  : (tab === 'signin' ? 'Continue with Google' : 'Sign up with Google')}
              </span>
            </button>

            <button
              type="button"
              className="oauth-btn oauth-btn-github"
              onClick={() => handleOAuth('github')}
              disabled={isSubmitting || oauthLoading !== null}
              id="login-oauth-github"
              title="Sign in with your GitHub account"
            >
              {oauthLoading === 'github' ? (
                <span className="oauth-spinner" />
              ) : (
                <svg className="oauth-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              )}
              <span>
                {oauthLoading === 'github'
                  ? 'Connecting GitHub...'
                  : (tab === 'signin' ? 'Continue with GitHub' : 'Sign up with GitHub')}
              </span>
            </button>
          </div>

          <div className="oauth-divider">
            <span>Or continue with email</span>
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


          <p className="login-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            <ShieldCheck size={14} color="var(--aurora-400)" />
            <span>Secure salted SHA-256 cryptographic auth with persistent local storage.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
