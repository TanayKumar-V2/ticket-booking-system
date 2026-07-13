"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingSeatsRelations = exports.bookingsRelations = exports.seatsRelations = exports.eventsRelations = exports.usersRelations = exports.idempotencyKeys = exports.refreshTokens = exports.bookingSeats = exports.bookings = exports.seats = exports.events = exports.users = exports.bookingStatusEnum = exports.seatStatusEnum = exports.eventStatusEnum = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.roleEnum = (0, pg_core_1.pgEnum)('role', ['ADMIN', 'ORGANIZER', 'USER']);
exports.eventStatusEnum = (0, pg_core_1.pgEnum)('event_status', ['DRAFT', 'PUBLISHED']);
exports.seatStatusEnum = (0, pg_core_1.pgEnum)('seat_status', ['AVAILABLE', 'HELD', 'BOOKED']);
exports.bookingStatusEnum = (0, pg_core_1.pgEnum)('booking_status', ['PENDING', 'CONFIRMED', 'CANCELLED']);
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    role: (0, exports.roleEnum)('role').notNull().default('USER'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.events = (0, pg_core_1.pgTable)('events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    organizerId: (0, pg_core_1.uuid)('organizer_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    status: (0, exports.eventStatusEnum)('status').notNull().default('DRAFT'),
    eventDate: (0, pg_core_1.timestamp)('event_date').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.seats = (0, pg_core_1.pgTable)('seats', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    eventId: (0, pg_core_1.uuid)('event_id')
        .notNull()
        .references(() => exports.events.id, { onDelete: 'cascade' }),
    seatIdentifier: (0, pg_core_1.varchar)('seat_identifier', { length: 50 }).notNull(),
    status: (0, exports.seatStatusEnum)('status').notNull().default('AVAILABLE'),
    price: (0, pg_core_1.integer)('price').notNull(),
    heldUntil: (0, pg_core_1.timestamp)('held_until'),
    heldByUserId: (0, pg_core_1.uuid)('held_by_user_id').references(() => exports.users.id, { onDelete: 'set null' }),
}, (table) => [
    (0, pg_core_1.uniqueIndex)('unique_event_seat').on(table.eventId, table.seatIdentifier)
]);
exports.bookings = (0, pg_core_1.pgTable)('bookings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    eventId: (0, pg_core_1.uuid)('event_id')
        .notNull()
        .references(() => exports.events.id, { onDelete: 'cascade' }),
    status: (0, exports.bookingStatusEnum)('status').notNull().default('PENDING'),
    totalAmount: (0, pg_core_1.integer)('total_amount').notNull(),
    idempotencyKey: (0, pg_core_1.varchar)('idempotency_key', { length: 255 }).unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.bookingSeats = (0, pg_core_1.pgTable)('booking_seats', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    bookingId: (0, pg_core_1.uuid)('booking_id')
        .notNull()
        .references(() => exports.bookings.id, { onDelete: 'cascade' }),
    seatId: (0, pg_core_1.uuid)('seat_id')
        .notNull()
        .references(() => exports.seats.id, { onDelete: 'cascade' }),
});
exports.refreshTokens = (0, pg_core_1.pgTable)('refresh_tokens', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    tokenHash: (0, pg_core_1.varchar)('token_hash', { length: 255 }).notNull().unique(),
    familyId: (0, pg_core_1.uuid)('family_id').notNull(),
    isRevoked: (0, pg_core_1.boolean)('is_revoked').default(false).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.idempotencyKeys = (0, pg_core_1.pgTable)('idempotency_keys', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    key: (0, pg_core_1.varchar)('key', { length: 255 }).notNull().unique(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    requestPath: (0, pg_core_1.varchar)('request_path', { length: 255 }).notNull(),
    responseBody: (0, pg_core_1.text)('response_body'),
    responseStatus: (0, pg_core_1.integer)('response_status'),
    lockedAt: (0, pg_core_1.timestamp)('locked_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    events: many(exports.events),
    bookings: many(exports.bookings),
    refreshTokens: many(exports.refreshTokens),
}));
exports.eventsRelations = (0, drizzle_orm_1.relations)(exports.events, ({ one, many }) => ({
    organizer: one(exports.users, {
        fields: [exports.events.organizerId],
        references: [exports.users.id],
    }),
    seats: many(exports.seats),
    bookings: many(exports.bookings),
}));
exports.seatsRelations = (0, drizzle_orm_1.relations)(exports.seats, ({ one, many }) => ({
    event: one(exports.events, {
        fields: [exports.seats.eventId],
        references: [exports.events.id],
    }),
    heldByUser: one(exports.users, {
        fields: [exports.seats.heldByUserId],
        references: [exports.users.id],
    }),
    bookingSeats: many(exports.bookingSeats),
}));
exports.bookingsRelations = (0, drizzle_orm_1.relations)(exports.bookings, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.bookings.userId],
        references: [exports.users.id],
    }),
    event: one(exports.events, {
        fields: [exports.bookings.eventId],
        references: [exports.events.id],
    }),
    bookingSeats: many(exports.bookingSeats),
}));
exports.bookingSeatsRelations = (0, drizzle_orm_1.relations)(exports.bookingSeats, ({ one }) => ({
    booking: one(exports.bookings, {
        fields: [exports.bookingSeats.bookingId],
        references: [exports.bookings.id],
    }),
    seat: one(exports.seats, {
        fields: [exports.bookingSeats.seatId],
        references: [exports.seats.id],
    }),
}));
//# sourceMappingURL=schema.js.map