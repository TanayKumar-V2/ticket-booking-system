'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eventsApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import styles from '../events.module.css';

export default function MyEventsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
      return;
    }

    if (token) {
      eventsApi.myEvents(token)
        .then(setEvents)
        .catch(() => setEvents([]))
        .finally(() => setLoading(false));
    }
  }, [token, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className={styles['events-page']}>
        <div className={styles['events-inner']}>
          <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 'var(--space-8)' }} />
          <div className={styles['events-grid']}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card skeleton" style={{ height: 300 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['events-page']}>
      <div className={styles['events-inner']}>
        <div className={styles['events-header']}>
          <h1 className={styles['events-title']}>My Events</h1>
          <Link href="/events/new" className="btn btn-primary">
            + Create Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className={styles['events-empty']}>
            <div className={styles['events-empty-icon']}>🎭</div>
            <h2 className={styles['events-empty-title']}>No events hosted yet</h2>
            <p className={styles['events-empty-desc']}>
              Create your first event to start selling tickets.
            </p>
            <Link href="/events/new" className="btn btn-primary btn-lg">
              Create Event
            </Link>
          </div>
        ) : (
          <div className={styles['events-grid']}>
            {events.map((event) => {
              const d = new Date(event.eventDate);
              return (
                <div key={event.id} className={styles['event-card']}>
                  <div className={styles['event-card-banner']}>
                    <div className={styles['event-card-banner-pattern']} />
                  </div>
                  <div className={styles['event-card-body']}>
                    <div className={styles['event-card-status']}>
                      <span className={`badge ${event.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                        {event.status}
                      </span>
                    </div>
                    <h3 className={styles['event-card-title']}>{event.title}</h3>
                    <p className={styles['event-card-desc']}>{event.description}</p>
                    <div className={styles['event-card-footer']} style={{ justifyContent: 'space-between' }}>
                      <span className={styles['event-card-meta']}>
                        📅 {d.toLocaleDateString()}
                      </span>
                      <Link href={`/events/${event.id}`} className={styles['event-card-action']}>
                        Manage →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
