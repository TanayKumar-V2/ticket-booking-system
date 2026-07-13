'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi, seatsApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function CreateEventPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [seatCount, setSeatCount] = useState(100);
  const [seatPrice, setSeatPrice] = useState(50); // in dollars
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setLoading(true);

    try {
      // 1. Create Event
      const event = await eventsApi.create(token, {
        title,
        description,
        eventDate: new Date(eventDate).toISOString(),
      });

      // 2. Generate Seats for the Event
      await seatsApi.createBulk(token, {
        eventId: event.id,
        count: seatCount,
        price: seatPrice * 100, // convert to cents
        prefix: 'GEN-',
      });

      // 3. Optional: Automatically publish the event? (We can leave it as DRAFT for now, but let's assume it's ready)
      // For simplicity, we just redirect back to my-events.
      router.push('/events/my-events');
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-10)' }}>
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)', fontWeight: 800 }}>Create New Event</h1>
        
        {error && (
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-danger-subtle)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-5)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Event Title</label>
            <input 
              className="input" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Summer Music Festival 2026"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Description</label>
            <textarea 
              className="input" 
              required 
              rows={4} 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Event details..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Date & Time</label>
            <input 
              className="input" 
              type="datetime-local" 
              required 
              value={eventDate} 
              onChange={e => setEventDate(e.target.value)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Number of Seats</label>
              <input 
                className="input" 
                type="number" 
                min={1}
                max={5000}
                required 
                value={seatCount} 
                onChange={e => setSeatCount(parseInt(e.target.value))} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Ticket Price ($)</label>
              <input 
                className="input" 
                type="number" 
                min={0}
                step={0.01}
                required 
                value={seatPrice} 
                onChange={e => setSeatPrice(parseFloat(e.target.value))} 
              />
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="spinner" /> : 'Create Event & Generate Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
