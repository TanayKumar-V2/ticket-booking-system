import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles['hero-grid']} />
        <div className={styles['hero-content']}>
          <div className={styles['hero-badge']}>
            <span className={styles['hero-badge-dot']} />
            Now accepting bookings
          </div>
          <h1 className={styles['hero-title']}>
            The future of{' '}
            <span className={styles['hero-title-gradient']}>event ticketing</span>
            {' '}is here
          </h1>
          <p className={styles['hero-subtitle']}>
            Discover unforgettable experiences. Book seats in milliseconds with 
            military-grade concurrency protection — no overselling, ever.
          </p>
          <div className={styles['hero-actions']}>
            <Link href="/events" className="btn btn-primary btn-lg">
              Browse Events
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              Create an account
            </Link>
          </div>

          <div className={styles['hero-stats']}>
            <div className={styles['hero-stat']}>
              <div className={styles['hero-stat-value']}>50K+</div>
              <div className={styles['hero-stat-label']}>Tickets Sold</div>
            </div>
            <div className={styles['hero-stat']}>
              <div className={styles['hero-stat-value']}>99.9%</div>
              <div className={styles['hero-stat-label']}>Uptime</div>
            </div>
            <div className={styles['hero-stat']}>
              <div className={styles['hero-stat-value']}>&lt;50ms</div>
              <div className={styles['hero-stat-label']}>Avg Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles['features-inner']}>
          <div className={styles['features-header']}>
            <div className={styles['features-label']}>Why Eventrix</div>
            <h2 className={styles['features-title']}>
              Built for scale. Designed for humans.
            </h2>
          </div>

          <div className={styles['features-grid']}>
            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🔒</div>
              <h3 className={styles['feature-title']}>Zero Overselling</h3>
              <p className={styles['feature-desc']}>
                Pessimistic row-level locks with SKIP LOCKED ensure every seat is 
                allocated exactly once, even under extreme concurrency.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>⚡</div>
              <h3 className={styles['feature-title']}>Lightning Fast</h3>
              <p className={styles['feature-desc']}>
                Sub-50ms booking latency powered by Neon serverless Postgres 
                and Redis-backed BullMQ for background processing.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🛡️</div>
              <h3 className={styles['feature-title']}>Idempotent Payments</h3>
              <p className={styles['feature-desc']}>
                Replay-safe booking confirmations with cryptographic idempotency 
                keys prevent double charges on flaky networks.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🎯</div>
              <h3 className={styles['feature-title']}>Smart Seat Holds</h3>
              <p className={styles['feature-desc']}>
                10-minute automatic hold expiry with BullMQ delayed jobs ensures 
                abandoned carts release seats back to the pool.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>👥</div>
              <h3 className={styles['feature-title']}>Role-Based Access</h3>
              <p className={styles['feature-desc']}>
                Fine-grained RBAC with JWT rotation and refresh token family 
                reuse detection for bulletproof auth.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>📊</div>
              <h3 className={styles['feature-title']}>Organizer Dashboard</h3>
              <p className={styles['feature-desc']}>
                Create events, manage inventory, and track bookings in real-time 
                with a premium organizer experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className={styles.cta}>
        <h2 className={styles['cta-title']}>Ready to get started?</h2>
        <p className={styles['cta-desc']}>
          Join thousands of organizers who trust Eventrix for their events.
        </p>
        <Link href="/register" className="btn btn-primary btn-lg">
          Create your free account
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Eventrix. Built with NestJS, Next.js, and Drizzle.
      </footer>
    </>
  );
}
