import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['ADMIN', 'ORGANIZER', 'USER']);
export const eventStatusEnum = pgEnum('event_status', ['DRAFT', 'PUBLISHED']);
export const seatStatusEnum = pgEnum('seat_status', ['AVAILABLE', 'HELD', 'BOOKED']);
export const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'CONFIRMED', 'CANCELLED']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('USER'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizerId: uuid('organizer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: eventStatusEnum('status').notNull().default('DRAFT'),
  eventDate: timestamp('event_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const seats = pgTable('seats', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  seatIdentifier: varchar('seat_identifier', { length: 50 }).notNull(), // e.g., 'A1', 'VIP-1'
  status: seatStatusEnum('status').notNull().default('AVAILABLE'),
  price: integer('price').notNull(), // in cents
  heldUntil: timestamp('held_until'), // NULL if not held
  heldByUserId: uuid('held_by_user_id').references(() => users.id, { onDelete: 'set null' }),
}, (table) => [
  uniqueIndex('unique_event_seat').on(table.eventId, table.seatIdentifier)
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  status: bookingStatusEnum('status').notNull().default('PENDING'),
  totalAmount: integer('total_amount').notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(), // optional, if tracking on booking row directly
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bookingSeats = pgTable('booking_seats', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  seatId: uuid('seat_id')
    .notNull()
    .references(() => seats.id, { onDelete: 'cascade' }),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  familyId: uuid('family_id').notNull(), // to detect reuse and revoke whole session family
  isRevoked: boolean('is_revoked').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const idempotencyKeys = pgTable('idempotency_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  requestPath: varchar('request_path', { length: 255 }).notNull(),
  responseBody: text('response_body'),
  responseStatus: integer('response_status'),
  lockedAt: timestamp('locked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  bookings: many(bookings),
  refreshTokens: many(refreshTokens),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  seats: many(seats),
  bookings: many(bookings),
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
  event: one(events, {
    fields: [seats.eventId],
    references: [events.id],
  }),
  heldByUser: one(users, {
    fields: [seats.heldByUserId],
    references: [users.id],
  }),
  bookingSeats: many(bookingSeats),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
  bookingSeats: many(bookingSeats),
}));

export const bookingSeatsRelations = relations(bookingSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSeats.bookingId],
    references: [bookings.id],
  }),
  seat: one(seats, {
    fields: [bookingSeats.seatId],
    references: [seats.id],
  }),
}));
