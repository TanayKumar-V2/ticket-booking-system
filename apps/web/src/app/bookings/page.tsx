'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bookingsApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function BookingsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }

    if (token) {
      bookingsApi.myBookings(token)
        .then(setBookings)
        .catch(() => setBookings([]))
        .finally(() => setLoading(false));
    }
  }, [token, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-10) 0' }}>
        <div className="skeleton" style={{ height: 40, width: 250, marginBottom: 'var(--space-8)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: 120 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--space-10) 0', minHeight: 'calc(100dvh - var(--header-height))' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-8)' }}>My Tickets</h1>

      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-6)' }}>
          <div style={{ fontSize: 'var(--text-5xl)', opacity: 0.5, marginBottom: 'var(--space-4)' }}>🎟️</div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>No bookings yet</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>You haven't purchased any tickets yet.</p>
          <Link href="/events" className="btn btn-primary">
            Browse Events
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {bookings.map(booking => {
            const eventDate = new Date(booking.event.eventDate);
            return (
              <div key={booking.id} className="card card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{booking.event.title}</h3>
                    <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : booking.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', display: 'flex', gap: 'var(--space-4)' }}>
                    <span>📅 {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>🎟️ {booking.bookingSeats?.length || 0} Ticket(s)</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Total: ${(booking.totalAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {booking.status === 'CONFIRMED' && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => {
                        alert(`Downloading tickets for ${booking.event.title}...\n(In a real app, this would generate a PDF via a backend endpoint)`);
                      }}
                    >
                      ↓ Download
                    </button>
                    <Link href={`/events/${booking.eventId}`} className="btn btn-secondary btn-sm">
                      View Event
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
