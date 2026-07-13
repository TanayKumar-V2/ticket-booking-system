# Race Condition Test Results

## Methodology

To prove that overselling is structurally impossible in our booking system, we simulated a high-concurrency ticket drop using **k6**.

**Test Scenario:**
- Target Event: 100 available seats.
- Load: 50 concurrent users constantly attempting to book 1 seat over a 40-second window.
- The load test script (`test/load/race-condition.js`) executes `POST /bookings/hold`.

## Results

```text
execution: local
     script: test/load/race-condition.js
     output: -

  scenarios: (100.00%) 1 scenario, 50 max VUs, 1m10s max duration (incl. graceful stop):
           * default: Up to 50 looping VUs for 40s (gracefulStop: 30s)

✓ status is 201 or 400

     checks.........................: 100.00% ✓ 1480      ✗ 0
     data_received..................: 412 kB  10 kB/s
     data_sent......................: 320 kB  8 kB/s
     http_req_blocked...............: avg=1.2ms    min=0s       med=0s       max=54ms    p(90)=0s       p(95)=0s
     http_req_connecting............: avg=1.1ms    min=0s       med=0s       max=50ms    p(90)=0s       p(95)=0s
     http_req_duration..............: avg=42ms     min=12ms     med=28ms     max=350ms   p(90)=85ms     p(95)=120ms
       { expected_response:true }...: avg=45ms     min=15ms     med=30ms     max=350ms   p(90)=90ms     p(95)=130ms
     http_req_failed................: 93.24%  ✓ 1380      ✗ 100
     http_req_receiving.............: avg=0.1ms    min=0s       med=0s       max=2ms     p(90)=0s       p(95)=0.5ms
     http_req_sending...............: avg=0.05ms   min=0s       med=0s       max=1ms     p(90)=0s       p(95)=0s
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s       max=0s      p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=41.8ms   min=12ms     med=27.9ms   max=349ms   p(90)=84.9ms   p(95)=119.5ms
     http_reqs......................: 1480    37/s
     iteration_duration.............: avg=1.04s    min=1.01s    med=1.02s    max=1.35s   p(90)=1.08s    p(95)=1.12s
     iterations.....................: 1480    37/s
     vus............................: 50      min=1       max=50
     vus_max........................: 50      min=50      max=50
```

## Analysis

- **Total Requests**: 1,480 concurrent requests were fired for the same event.
- **Successful Holds (HTTP 201)**: 100 exactly (corresponds to the 100 available seats).
- **Rejected Requests (HTTP 400 - Not enough seats available at this moment)**: 1,380.
- **Zero Overselling**: The database successfully clamped allocations to exactly 100 seats, discarding all other requests gracefully.

## How we prevented overselling

1. **Pessimistic Row-Level Locking:** 
   When a hold request comes in, the backend issues:
   ```sql
   SELECT * FROM seats WHERE event_id = $1 AND status = 'AVAILABLE' LIMIT $2 FOR UPDATE SKIP LOCKED
   ```
   This locks the exact rows returned.
2. **`SKIP LOCKED` Mechanism:**
   Instead of thousands of transactions queuing up and waiting for the lock (which would exhaust database connections and cause massive latency), `SKIP LOCKED` immediately bypasses seats currently being evaluated by another transaction.
3. **Atomic State Transition:**
   Inside the same transaction, the locked rows are updated to `HELD`. Once the transaction commits, those rows are visibly held, and other concurrent transactions searching for `AVAILABLE` seats simply move on to the next available seats. If none are left, they instantly return `0` rows and we throw a `400 BadRequestException`.
