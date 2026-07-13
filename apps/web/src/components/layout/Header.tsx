'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={styles.header}>
      <div className={styles['header-inner']}>
        <Link href="/" className={styles['header-logo']}>
          <div className={styles['header-logo-icon']}>⚡</div>
          <div className={styles['header-logo-text']}>
            <span>Eventrix</span>
          </div>
        </Link>

        <nav className={styles['header-nav']}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles['header-nav-link']} ${isActive(link.href) ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {user && (user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
            <Link
              href="/events/my-events"
              className={`${styles['header-nav-link']} ${isActive('/events/my-events') ? styles.active : ''}`}
            >
              My Events
            </Link>
          )}
          {user && (
            <Link
              href="/bookings"
              className={`${styles['header-nav-link']} ${isActive('/bookings') ? styles.active : ''}`}
            >
              My Bookings
            </Link>
          )}
        </nav>

        <div className={styles['header-actions']}>
          <button
            className={styles['header-theme-toggle']}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className={styles['header-user']}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className={styles['header-avatar']}>
                  {user.email[0].toUpperCase()}
                </div>
                <div>
                  <div className={styles['header-username']}>{user.email.split('@')[0]}</div>
                  <div className={styles['header-role']}>{user.role}</div>
                </div>
              </button>

              {dropdownOpen && (
                <div className={styles['header-dropdown']}>
                  <button
                    className={`${styles['header-dropdown-item']} ${styles.danger}`}
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
