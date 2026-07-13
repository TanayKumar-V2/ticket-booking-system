const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function fetcher<T = any>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data.message || `Request failed with status ${response.status}`,
      response.status,
      data,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ── Auth API ────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; role?: string }) =>
    fetcher('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetcher('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refresh: () =>
    fetcher('/auth/refresh', { method: 'POST' }),

  logout: (token: string) =>
    fetcher('/auth/logout', { method: 'POST', token }),
};

// ── Events API ──────────────────────────────────────────────
export const eventsApi = {
  list: () =>
    fetcher('/events'),

  get: (id: string) =>
    fetcher(`/events/${id}`),

  create: (token: string, data: { title: string; description: string; eventDate: string }) =>
    fetcher('/events', { method: 'POST', token, body: JSON.stringify(data) }),

  update: (token: string, id: string, data: any) =>
    fetcher(`/events/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),

  delete: (token: string, id: string) =>
    fetcher(`/events/${id}`, { method: 'DELETE', token }),

  myEvents: (token: string) =>
    fetcher('/events/my-events', { token }),
};

// ── Seats API ───────────────────────────────────────────────
export const seatsApi = {
  getEventSeats: (eventId: string) =>
    fetcher(`/seats/event/${eventId}`),

  createBulk: (token: string, data: { eventId: string; count: number; price: number; prefix?: string }) =>
    fetcher('/seats', { method: 'POST', token, body: JSON.stringify(data) }),
};

// ── Bookings API ────────────────────────────────────────────
export const bookingsApi = {
  hold: (token: string, data: { eventId: string; quantity: number }) =>
    fetcher('/bookings/hold', { method: 'POST', token, body: JSON.stringify(data) }),

  confirm: (token: string, data: { eventId: string }, idempotencyKey?: string) => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['x-idempotency-key'] = idempotencyKey;
    }
    return fetcher('/bookings/confirm', {
      method: 'POST',
      token,
      headers,
      body: JSON.stringify(data),
    });
  },

  myBookings: (token: string) =>
    fetcher('/bookings/my-bookings', { token }),
};

export { ApiError };
export default fetcher;
