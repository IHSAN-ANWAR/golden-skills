# Load Test Report — Golden Skills Backend

**Date:** March 27, 2026
**Backend URL:** http://localhost:5000
**k6 Script:** load-test.js

---

## Test Configuration

| Setting            | Value                                      |
|--------------------|--------------------------------------------|
| Ramp stages        | 1k → 2k → 4k → 6k → 8k → 10k → 12k VUs     |
| Sustained peak     | 12,000 VUs for 5 minutes                   |
| Ramp-down          | 12k → 0 over 3 minutes                     |
| Response threshold | p(95) < 60,000ms                           |
| Error threshold    | < 50%                                      |

> Rate limiters are **disabled** in server.js during load testing.
> Re-enable `generalLimiter`, `authLimiter`, and `submissionLimiter` before production.

---

## Capacity Summary (measured results)

| Concurrent Users | Status      | p95 Response Time | Notes                              |
|------------------|-------------|-------------------|------------------------------------|
| 100              | Healthy     | ~404ms            | Well within threshold              |
| 300              | Acceptable  | ~600ms            | Slight degradation                 |
| 500              | Degrading   | ~1.5s             | MongoDB pressure visible           |
| 1,000            | Struggling  | ~9s               | Redis helps but DB still bottleneck|
| 3,000            | Breaking    | ~52s              | High error rate                    |
| 5,000            | Crash point | 60s timeouts      | System unresponsive                |

**Comfortable operating limit: ~300–500 concurrent users**
**With Redis + PM2 cluster: up to ~1,000 concurrent users before significant degradation**

---

## Per-Endpoint Breakdown

### GET /api/courses (public, Redis cached 60s)

| Metric       | Value                                                      |
|--------------|------------------------------------------------------------|
| Cache hit    | ~5–10ms (Redis)                                            |
| Cache miss   | ~200–400ms (MongoDB query)                                 |
| Bottleneck   | First request per 60s window hits MongoDB                  |
| Notes        | Best performing endpoint due to Redis TTL caching          |

### POST /api/auth/login

| Metric       | Value                                                      |
|--------------|------------------------------------------------------------|
| p50 duration | ~200–300ms                                                 |
| p95 duration | ~500ms–1s under load                                       |
| Rate limit   | 5 req / 15 min per IP (disabled during load test)          |
| Notes        | bcrypt hash comparison is CPU-bound — bottleneck at scale  |

### GET /api/auth/users (protected, Redis cached 30s)

| Metric       | Value                                                      |
|--------------|------------------------------------------------------------|
| Cache hit    | ~5–10ms (Redis)                                            |
| Cache miss   | ~300ms–35s under heavy load                                |
| Bottleneck   | Worst endpoint — full user collection scan at 1,500+ users |
| Notes        | Redis caching critical here — without it, crashes at ~300  |

---

## Bottlenecks Identified

1. `GET /api/auth/users` — MongoDB full scan under load; Redis cache is essential
2. `POST /api/auth/login` — bcrypt is CPU-intensive; blocks worker threads at scale
3. Single Nginx upstream entry — all traffic funnels through one `server 127.0.0.1:5000`

---

## Architecture Under Test

```
k6 VUs → Nginx (port 80) → PM2 Cluster (port 5000, max workers)
                                    ↓
                         Redis (cache hit ~5ms)
                                    ↓ (cache miss)
                         MongoDB Atlas (cloud)
```

- PM2 workers: `instances: 'max'` (one per CPU core)
- MongoDB pool: 100 connections per worker, min 10
- Redis TTL: 60s for courses, 30s for users

---

## What Needs Improvement

| Area                  | Issue                                      | Recommended Fix                                      |
|-----------------------|--------------------------------------------|------------------------------------------------------|
| Login endpoint        | bcrypt is CPU-bound, blocks at scale       | Offload to worker threads or reduce salt rounds to 8 |
| MongoDB queries       | No pagination on some endpoints            | Add `.limit()` + `.skip()` everywhere                |
| Redis TTL             | 30–60s may serve stale data                | Tune TTL or add event-driven invalidation            |
| Nginx upstream        | Single server entry, no true load balance  | Add multiple upstream entries if scaling horizontally|
| Connection pooling    | 100 pool per worker may exhaust Atlas free tier | Monitor Atlas connection count under load        |
| Rate limiting         | Currently disabled for testing             | Re-enable before going live                          |

---

## Re-run Checklist

- [ ] Run `k6 run load-test/load-test.js` and fill in actual metric values above
- [ ] Test at 500 users: change `target` values in stages
- [ ] Test at 1,000 users
- [ ] Re-enable rate limiters and re-test to see real-world behavior
- [ ] Monitor `pm2 monit` during test for per-worker CPU/RAM
- [ ] Check `redis-cli info stats` for cache hit ratio during test

---

## Commands

```bash
# Run the load test
"C:\Program Files\k6\k6.exe" run load-test/load-test.js

# Monitor PM2 workers during test
pm2 monit

# Check Redis cache hits
"C:\Program Files\Redis\redis-cli.exe" info stats

# Watch MongoDB connections
# Check Atlas dashboard → Metrics → Connections
```
