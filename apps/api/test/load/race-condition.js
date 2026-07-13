import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 }, // Ramp up to 50 concurrent users
    { duration: '20s', target: 50 }, // Hold
    { duration: '10s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const url = 'http://localhost:3000/bookings/hold'; // Replace with actual URL
  const payload = JSON.stringify({
    eventId: __ENV.EVENT_ID, // Passed via CLI
    quantity: 1,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.TOKEN}`, // A valid token for the test
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201 or 400': (r) => r.status === 201 || r.status === 400,
  });
  sleep(1);
}
