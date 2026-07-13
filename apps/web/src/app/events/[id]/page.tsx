'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eventsApi, seatsApi, bookingsApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import styles from '../events.module.css';

interface Event {
  id: string;
  title: string;
  description: string;
  status: string;
  eventDate: string;
  organizerId: string;
}

interface Seat {
  id: string;
  seatIdentifier: string;
  status: string;
  price: number;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, token } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [bookingStep, setBookingStep] = useState<'idle' | 'holding' | 'held' | 'confirming' | 'confirmed' | 'error'>('idle');
  const [holdData, setHoldData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      eventsApi.get(id),
      seatsApi.getEventSeats(id),
    ])
      .then(([eventData, seatsData]) => {
        setEvent(eventData);
        setSeats(seatsData);
      })
      .catch(() => router.push('/events'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const availableSeats = seats.filter(s => s.status === 'AVAILABLE');
  const avgPrice = availableSeats.length > 0
    ? availableSeats.reduce((sum, s) => sum + s.price, 0) / availableSeats.length
    : 0;

  const handleHold = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    setError('');
    setBookingStep('holding');
    try {
      const result = await bookingsApi.hold(token, { eventId: id, quantity });
      setHoldData(result);
      setBookingStep('held');
    } catch (err: any) {
      setError(err.message || 'Failed to hold seats');
      setBookingStep('error');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!token) return;
    setError('');
    setBookingStep('confirming');
    const idempotencyKey = `booking-${id}-${user?.id}-${Date.now()}`;
    try {
      const res = await loadRazorpay();
      if (!res) throw new Error('Razorpay SDK failed to load');

      // 1. Create Checkout (Backend creates order)
      const checkoutData = await bookingsApi.checkout(token, { eventId: id }, idempotencyKey);

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock_key_id',
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: 'Eventrix',
        description: `Tickets for ${event?.title}`,
        order_id: checkoutData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // 3. Confirm Booking on success
            await bookingsApi.confirm(token, {
              bookingId: checkoutData.bookingId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            setBookingStep('confirmed');
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setBookingStep('error');
          }
        },
        prefill: {
          email: user?.email,
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed');
        setBookingStep('error');
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize checkout');
      setBookingStep('error');
    }
  };

  if (loading) {
    return (
      <div className={styles['event-detail']}>
        <div className={styles['event-detail-inner']}>
          <div className={`skeleton`} style={{ height: 280, borderRadius: 'var(--radius-2xl)', marginBottom: 'var(--space-8)' }} />
          <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 'var(--space-4)' }} />
          <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 'var(--space-8)' }} />
          <div className="skeleton" style={{ height: 120, marginBottom: 'var(--space-10)' }} />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.eventDate);

  return (
    <div className={styles['event-detail']}>
      <div className={styles['event-detail-inner']}>
        <Link href="/events" className={styles['event-detail-back']}>
          ← Back to events
        </Link>

        <div className={styles['event-detail-banner']}>
          <div className={styles['event-detail-banner-pattern']} />
        </div>

        <h1 className={styles['event-detail-title']}>{event.title}</h1>

        <div className={styles['event-detail-meta']}>
          <div className={styles['event-detail-meta-item']}>
            📅 {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className={styles['event-detail-meta-item']}>
            🕐 {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className={styles['event-detail-meta-item']}>
            <span className={`badge ${event.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
              {event.status}
            </span>
          </div>
          <div className={styles['event-detail-meta-item']}>
            🎫 {availableSeats.length} seats available
          </div>
        </div>

        <p className={styles['event-detail-desc']}>{event.description}</p>

        {/* ── Booking Panel ── */}
        <div className={styles['booking-panel']}>
          <h2 className={styles['booking-panel-title']}>Book your tickets</h2>

          {bookingStep === 'confirmed' ? (
            <div className={styles['booking-success']}>
              ✅ Booking confirmed! Your tickets have been reserved. Check My Bookings for details.
            </div>
          ) : (
            <>
              {bookingStep === 'held' && holdData && (
                <div className={styles['booking-held']}>
                  ⏳ {holdData.heldSeats.length} seat(s) held for 10 minutes. Confirm below to complete your booking.
                </div>
              )}

              {error && (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-danger-subtle)',
                  border: '1px solid hsla(0, 84%, 62%, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-danger)',
                  marginBottom: 'var(--space-4)',
                }}>
                  {error}
                </div>
              )}

              {availableSeats.length === 0 && bookingStep === 'idle' ? (
                <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: 'var(--space-8)' }}>
                  No seats available for this event.
                </p>
              ) : (bookingStep === 'held' || bookingStep === 'confirming') ? (
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={handleCheckout}
                  disabled={bookingStep === 'confirming'}
                >
                  {bookingStep === 'confirming' ? (
                    <><span className="spinner" /> Confirming...</>
                  ) : (
                    'Confirm booking'
                  )}
                </button>
              ) : (
                <>
                  <div className={styles['booking-quantity']}>
                    <span className={styles['booking-quantity-label']}>Quantity</span>
                    <div className={styles['booking-quantity-controls']}>
                      <button
                        className={styles['booking-quantity-btn']}
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span className={styles['booking-quantity-value']}>{quantity}</span>
                      <button
                        className={styles['booking-quantity-btn']}
                        onClick={() => setQuantity(q => Math.min(10, q + 1))}
                        disabled={quantity >= Math.min(10, availableSeats.length)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className={styles['booking-summary']}>
                    <span className={styles['booking-summary-label']}>
                      {quantity} × ${(avgPrice / 100).toFixed(2)}
                    </span>
                    <span className={styles['booking-summary-value']}>
                      ${((avgPrice * quantity) / 100).toFixed(2)}
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={handleHold}
                    disabled={bookingStep === 'holding'}
                  >
                    {bookingStep === 'holding' ? (
                      <><span className="spinner" /> Reserving seats...</>
                    ) : (
                      'Hold seats'
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
