'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import styles from './events.module.css';

interface Event {
  id: string;
  title: string;
  description: string;
  status: string;
  eventDate: string;
  organizerId: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate().toString(),
    full: d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

function SkeletonCard() {
  return (
    <div className={`${styles['events-skeleton-card']} card`}>
      <div className={`${styles['events-skeleton-banner']} skeleton`} />
      <div className={styles['events-skeleton-body']}>
        <div className={`${styles['events-skeleton-title']} skeleton`} />
        <div className={`${styles['events-skeleton-desc']} skeleton`} />
        <div className={`${styles['events-skeleton-desc-short']} skeleton`} />
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.list()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles['events-page']}>
      <div className={styles['events-inner']}>
        <div className={styles['events-header']}>
          <h1 className={styles['events-title']}>
            Upcoming Events
            {!loading && (
              <span className={styles['events-count']}>
                ({events.length})
              </span>
            )}
          </h1>
        </div>

        {loading ? (
          <div className={styles['events-grid']}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className={styles['events-empty']}>
            <div className={styles['events-empty-icon']}>🎭</div>
            <h2 className={styles['events-empty-title']}>No events yet</h2>
            <p className={styles['events-empty-desc']}>
              Be the first to create an event and start selling tickets.
            </p>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get started
            </Link>
          </div>
        ) : (
          <div className={styles['events-grid']}>
            {events.map((event) => {
              const date = formatDate(event.eventDate);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className={styles['event-card']}
                >
                  <div className={styles['event-card-banner']}>
                    <div className={styles['event-card-banner-pattern']} />
                    <div className={styles['event-card-date-badge']}>
                      <div className={styles['event-card-date-month']}>{date.month}</div>
                      <div className={styles['event-card-date-day']}>{date.day}</div>
                    </div>
                  </div>
                  <div className={styles['event-card-body']}>
                    <div className={styles['event-card-status']}>
                      <span className={`badge ${event.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                        {event.status}
                      </span>
                    </div>
                    <h3 className={styles['event-card-title']}>{event.title}</h3>
                    <p className={styles['event-card-desc']}>{event.description}</p>
                    <div className={styles['event-card-footer']}>
                      <span className={styles['event-card-meta']}>
                        📅 {date.full}
                      </span>
                      <span className={styles['event-card-action']}>
                        View details →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
