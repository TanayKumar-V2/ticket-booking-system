'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ORGANIZER'>('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, role);
      router.push('/events');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['auth-page']}>
      <div className={styles['auth-card']}>
        <div className={styles['auth-header']}>
          <div className={styles['auth-logo']}>⚡</div>
          <h1 className={styles['auth-title']}>Create your account</h1>
          <p className={styles['auth-subtitle']}>Start booking or hosting events in seconds</p>
        </div>

        <form className={styles['auth-form']} onSubmit={handleSubmit}>
          {error && <div className={styles['auth-error']}>{error}</div>}

          <div className={styles['auth-field']}>
            <label className={styles['auth-label']} htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles['auth-field']}>
            <label className={styles['auth-label']} htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="input"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles['auth-field']}>
            <label className={styles['auth-label']} htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              className="input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className={styles['auth-field']}>
            <label className={styles['auth-label']}>I want to</label>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className={`btn ${role === 'USER' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setRole('USER')}
                style={{ flex: 1 }}
              >
                Book tickets
              </button>
              <button
                type="button"
                className={`btn ${role === 'ORGANIZER' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setRole('ORGANIZER')}
                style={{ flex: 1 }}
              >
                Host events
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg ${styles['auth-submit']}`}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <div className={styles['auth-footer']}>
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
