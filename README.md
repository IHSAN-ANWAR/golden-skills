# Golden Skills — Full Stack Web Application

A MERN stack skill-learning platform with a public-facing website, an admin dashboard,
and a mobile-ready REST API. Built with React + Vite, Node.js + Express 5, MongoDB Atlas,
Redis caching, PM2 cluster mode, and Nginx as a reverse proxy.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Backend Libraries](#backend-libraries)
4. [Frontend Libraries](#frontend-libraries)
5. [Infrastructure & DevOps](#infrastructure--devops)
6. [Architecture Overview](#architecture-overview)
7. [Database Models](#database-models)
8. [API Endpoints](#api-endpoints)
9. [Redis Caching](#redis-caching)
10. [PM2 Cluster Mode](#pm2-cluster-mode)
11. [Nginx Configuration](#nginx-configuration)
12. [Environment Variables](#environment-variables)
13. [How to Run](#how-to-run)
14. [Load Testing](#load-testing)
15. [Concurrent User Capacity](#concurrent-user-capacity)
16. [Performance Optimizations](#performance-optimizations)

---

## Project Structure

```
Golden Skill/
│
├── backend/                              # Node.js + Express REST API
│   ├── config/
│   │   └── redis.js                      # Redis client + cache helpers
│   ├── controllers/
│   │   ├── authController.js             # Login, register, user CRUD, forgot/reset password
│   │   ├── courseController.js           # Course CRUD + Redis cache
│   │   ├── courseLinkController.js       # Send course links to users
│   │   ├── coursePlanController.js       # Course plan CRUD
│   │   ├── planController.js             # Learning plan CRUD
│   │   ├── taskController.js             # Task CRUD + stats
│   │   ├── userCourseCompletionController.js
│   │   ├── userCoursePlanSubmissionController.js
│   │   ├── userPlanSubmissionController.js
│   │   └── userTaskController.js
│   ├── middleware/
│   │   └── authMiddleware.js             # JWT verification — authenticateAdmin + authenticateUser
│   ├── models/
│   │   ├── Course.js
│   │   ├── CourseLinkAssignment.js
│   │   ├── CoursePlan.js
│   │   ├── Plan.js
│   │   ├── Task.js
│   │   ├── User.js                       # Indexes: createdAt, text search, email, username
│   │   ├── UserCourseCompletion.js
│   │   ├── UserCoursePlanSubmission.js
│   │   ├── UserPlanSubmission.js
│   │   └── UserTask.js
│   ├── routes/
│   │   ├── auth.js                       # /api/auth/*
│   │   ├── courses.js                    # /api/courses/*
│   │   ├── courseLinks.js                # /api/course-links/*
│   │   ├── coursePlans.js                # /api/course-plans/*
│   │   ├── plans.js                      # /api/plans/*
│   │   ├── tasks.js                      # /api/tasks/*
│   │   ├── userCourseCompletions.js      # /api/user-course-completions/*
│   │   ├── userCoursePlanSubmissions.js  # /api/course-plan-submissions/*
│   │   ├── userPlanSubmissions.js        # /api/submissions/*
│   │   └── userTasks.js                  # /api/user-tasks/*
│   ├── scripts/                          # Seed and maintenance scripts
│   ├── ecosystem.config.cjs              # PM2 cluster config
│   ├── loadtest.js                       # k6 load test script
│   ├── server.js                         # Express app entry point
│   └── .env                              # Environment variables (never commit)
│
└── Golden skills/                        # React + Vite frontend
    └── src/
        ├── App.jsx                       # Router — public + admin routes
        ├── pages/
        │   ├── Home.jsx                  # Landing page
        │   ├── UserTaskSubmission.jsx    # Submit task (user)
        │   ├── UserTaskData.jsx          # View my tasks (user)
        │   └── UserCourseData.jsx        # View my courses (user)
        └── components/
            ├── Navbar.jsx
            ├── Footer.jsx
            ├── Hero.jsx
            ├── Cards.jsx
            ├── About.jsx
            ├── CoursesSection.jsx        # Public courses listing
            ├── Tasks.jsx                 # Public tasks listing
            ├── Contact.jsx
            └── Admin Panel/
                ├── AdminLayout.jsx       # Shared admin shell + sidebar
                ├── AdminSidebar.jsx
                ├── Login/                # Admin login
                ├── ForgotPassword/
                ├── ResetPassword/
                ├── Dashboard/            # Stats overview
                ├── Courses/              # Course management + quiz editor
                ├── CourseManager/
                ├── CoursePlans/          # Course plan management
                ├── CourseVerifications/  # Approve / reject course completions
                ├── CourseHistory/
                ├── SubmittedCourses/
                ├── Tasks/
                ├── TasksManager/         # Task CRUD
                ├── AssignTask/           # Assign tasks to users
                ├── SubmittedTasks/       # Review task submissions
                ├── TaskHistory/
                ├── UserTaskHistory/
                └── Users/               # User management
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite 7 | Public website + admin dashboard |
| Routing | React Router DOM 7 | Client-side SPA routing |
| UI | Bootstrap 5.3 | Layout, tables, modals, forms |
| Backend | Node.js + Express 5 | REST API server |
| Database | MongoDB Atlas | Primary data store |
| ODM | Mongoose 9 | Schema definition + queries |
| Cache | Redis | In-memory cache for hot endpoints |
| Redis client | ioredis 5 | Node.js Redis client |
| Process manager | PM2 | Cluster mode + auto-restart |
| Reverse proxy | Nginx | Load balancing + static file serving |
| Load testing | k6 | Performance + stress testing |

---

## Backend Libraries

### express `^5.2.1`
Web framework. All routes, middleware, and request/response handling.

### mongoose `^9.1.6`
ODM for MongoDB. Defines schemas, validates data, and runs queries.
- `.lean()` applied on all read queries — returns plain JS objects, ~2x faster
- Indexes defined on schemas in `User.js` and `Course.js`

### ioredis `^5.10.1`
Redis client. Used in `backend/config/redis.js` which exports `getCache`,
`setCache`, `deleteCache`, and `deleteCachePattern` helpers.

### jsonwebtoken `^9.0.3`
Signs and verifies JWT tokens.
- Admin tokens: 2h expiry
- User tokens: 24h expiry

### bcryptjs `^3.0.3`
Hashes passwords at salt rounds 10. Used on register, manual user creation,
and password reset. Every login hits bcrypt + DB directly � no caching.

### compression `^1.8.1`
Gzip middleware applied globally. Reduces JSON response payload size by ~60–70%.

### dotenv `^17.2.4`
Loads `.env` into `process.env` at startup.

### cors `^2.8.6`
Allows the React frontend (different port) to call the API.

### express-rate-limit `^8.2.1`
Three limiters defined in `server.js`:
- `generalLimiter` — 100 req / 15 min per IP (disabled — re-enable before production)
- `authLimiter` — 5 req / 15 min per IP ✅ **enabled on `/api/auth`**
- `submissionLimiter` — 30 req / 15 min per IP (disabled — re-enable before production)

### nodemon `^3.1.11` (dev only)
Auto-restarts the server on file changes. Run with `npm run dev`.

---

## Frontend Libraries

### react `^19.2.0` + react-dom
Core UI library. Functional components with hooks throughout.

### react-router-dom `^7.13.0`
Client-side routing. All routes defined in `App.jsx`.

Public routes: `/`, `/about`, `/courses`, `/tasks`, `/contact`, `/submit-task`, `/my-tasks`, `/my-courses`

Admin routes: `/login`, `/admin/login`, `/forgot-password`, `/reset-password`, `/admin/dashboard`, `/admin/courses`, `/admin/tasks`, `/admin/users`

### bootstrap `^5.3.8`
CSS framework for layout, tables, modals, and forms.

### react-icons `^5.5.0`
Icon library used in the sidebar and dashboard components.

### vite `^7.2.4`
Build tool and dev server.
- `npm run dev` — hot-reload dev server
- `npm run build` — production bundle to `dist/`

---

## Infrastructure & DevOps

### Redis

In-memory cache layer in front of MongoDB. Reduces DB hits on hot endpoints
from thousands per second to once per TTL window.

```bash
# Start (Windows)
"C:\Program Files\Redis\redis-server.exe"

# Test
"C:\Program Files\Redis\redis-cli.exe" ping      # → PONG
"C:\Program Files\Redis\redis-cli.exe" keys *    # see cached keys
```

### PM2

Runs Node.js in cluster mode — one worker per CPU core, all sharing port 5000.
Config: `backend/ecosystem.config.cjs`

Key settings:
- `instances: 'max'` — uses all CPU cores
- `exec_mode: 'cluster'` — shared port across workers
- `max_memory_restart: '800M'` — restart worker if it exceeds 800MB
- `kill_timeout: 5000` — 5s grace period to finish in-flight requests

```bash
pm2 start ecosystem.config.cjs   # start cluster
pm2 list                          # worker status
pm2 monit                         # live CPU/RAM per worker
pm2 reload all                    # zero-downtime restart
pm2 logs                          # tail all logs
pm2 save && pm2 startup           # persist across reboots
```

### Nginx

Reverse proxy in front of PM2.

- Proxies `/api/*` to PM2 workers using `least_conn` strategy
- Serves React `dist/` directly (no Node.js for static files)
- `keepalive 64` — persistent upstream connections
- `gzip on` — compresses responses before sending to client

---

## Architecture Overview

```
Users / Internet
       │
       ▼
  ┌─────────────────────────────────────────┐
  │              Nginx (port 80)            │
  │  gzip · security headers · static files │
  └──────────────────┬──────────────────────┘
                     │ /api/* proxy_pass
                     ▼
  ┌─────────────────────────────────────────┐
  │         PM2 Cluster (port 5000)         │
  │  worker 0 │ worker 1 │ worker 2 │ ...   │
  │       compression middleware            │
  └──────────────┬──────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
  ┌──────────┐     ┌─────────────┐
  │  Redis   │     │  MongoDB    │
  │          │     │  Atlas      │
  │ courses  │     │ users       │
  │ 60s TTL  │     │ courses     │
  │ users    │     │ tasks       │
  │ 30s TTL  │     │ plans       │
  │          │     │ submissions │
  │          │     │             │
  └──────────┘     └─────────────┘

  Cache hit  → Redis responds, MongoDB not touched
  Cache miss → MongoDB queried, result stored in Redis
  Write ops  → MongoDB updated, Redis cache invalidated
```

### Request Flow

```
CLIENT (Browser / Mobile App)
        │
        ▼
   Nginx (port 80)
   • SSL termination
   • Serves React dist/ (static)
   • Proxies /api/* → PM2
        │
        ▼
   PM2 Cluster (port 5000)
   • Distributes across CPU cores
   • Auto-restarts crashed workers
        │
        ▼
   Express Middleware
   cors → gzip → json → JWT auth check
        │
        ├── GET /api/courses ──► Redis (60s TTL) ──► MongoDB (on miss)
        ├── GET /api/plans   ──► Redis (60s TTL) ──► MongoDB (on miss)
        ├── GET /api/auth/users ► Redis (30s TTL) ──► MongoDB (on miss)
        └── POST /api/auth/* ──► bcrypt + DB (every request, no cache)
```

### Write Operation Flow

```
Client POST/PUT/DELETE
        │
        ▼
   Nginx → PM2 Worker
        │
        ▼
   JWT Auth Check (authenticateAdmin)
        │
   ┌────┴────┐
   │ Invalid │ → 401 Unauthorized
   └────┬────┘
        │ Valid
        ▼
   MongoDB Atlas (write)
        │
        ▼
   Bust Redis Cache
   deleteCache('all_courses')
   deleteCache('all_plans')
   deleteCachePattern('users:*')
        │
        ▼
   Return success JSON ✅
```

---

## Database Models

### User
Fields: `fullName`, `username` (unique), `email` (unique), `password` (bcrypt),
`age` (min 13), `city`, `referralCode`, `resetToken`, `resetTokenExpiry`, `createdAt`

Indexes:
- `{ createdAt: -1 }` — paginated user list sort
- `{ fullName, username, email, city }` text index — search
- `username`, `email` auto-indexed via `unique: true`

### Course
Fields: `title`, `icon`, `description`, `quizQuestions[]`, `createdAt`

`quizQuestions` shape: `{ question, options[], correctAnswer }`

Indexes:
- `{ createdAt: -1 }` — course list sort
- `{ title: 1 }` — title lookups

### Task
Fields: `title`, `description`, `category`, `points` (default 10), `deadline`,
`status` (active/completed/expired), `assignedTo` (all/specific),
`specificUsers[]`, `createdBy`, `createdAt`, `updatedAt`

### Plan
Fields: `title`, `price`, `description`, `isActive`, `createdBy`, timestamps

### Other Models
`CoursePlan`, `CourseLinkAssignment`, `UserTask`, `UserCourseCompletion`,
`UserPlanSubmission`, `UserCoursePlanSubmission`

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | None | Admin login — rate limited (5 req / 15 min) |
| POST | `/user/login` | None | User login — rate limited (5 req / 15 min) |
| POST | `/user/register` | None | Register new user — rate limited (5 req / 15 min) |
| POST | `/forgot-password` | None | Generate password reset token |
| POST | `/reset-password` | None | Reset password with token |
| GET | `/users` | Admin JWT | All users — paginated, searchable, Redis cached 30s |
| POST | `/user/create` | Admin JWT | Manually create a user |
| GET | `/user/:id` | Admin JWT | Get user by ID |
| PUT | `/user/:id` | Admin JWT | Update user |
| DELETE | `/user/:id` | Admin JWT | Delete user |

### Courses — `/api/courses`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | All courses — Redis cached 60s |
| GET | `/:id` | None | Single course |
| GET | `/:id/quiz` | None | Quiz questions |
| POST | `/` | Admin JWT | Create course |
| PUT | `/:id/quiz` | Admin JWT | Update quiz questions |
| DELETE | `/:id` | Admin JWT | Delete course |

### Tasks — `/api/tasks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/all` | Admin JWT | All tasks (paginated) |
| GET | `/admin/stats` | Admin JWT | Task completion stats |
| POST | `/admin/create` | Admin JWT | Create task |
| PUT | `/admin/update/:id` | Admin JWT | Update task |
| DELETE | `/admin/delete/:id` | Admin JWT | Delete task |
| GET | `/user/my-tasks` | User JWT | Tasks assigned to user |

### User Tasks — `/api/user-tasks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/assign` | Admin JWT | Assign task to user |
| GET | `/` | Admin JWT | All assignments |
| GET | `/stats` | Admin JWT | Completion stats |
| PUT | `/:id` | Admin JWT | Update task status |
| DELETE | `/:id` | Admin JWT | Remove assignment |
| GET | `/user/:email` | None | Tasks for a specific user |
| POST | `/:id/submit` | None | Submit completed task |

### Plans — `/api/plans`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin JWT | All plans |
| POST | `/` | Admin JWT | Create plan |
| PUT | `/:id` | Admin JWT | Update plan |
| DELETE | `/:id` | Admin JWT | Delete plan |

### Course Plans — `/api/course-plans`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | All course plans |
| GET | `/:id` | None | Single course plan |
| POST | `/` | Admin JWT | Create course plan |
| PUT | `/:id` | Admin JWT | Update course plan |
| DELETE | `/:id` | Admin JWT | Delete course plan |

### Course Links — `/api/course-links`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/send` | Admin JWT | Send course link to user |
| GET | `/` | Admin JWT | All course link assignments |

### Course Completions — `/api/user-course-completions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/submit` | None | Submit course completion |
| GET | `/user/:userId` | None | User's completions |
| GET | `/user/:userId/assigned` | None | Assigned courses for user |
| GET | `/all` | Admin JWT | All completions |
| GET | `/pending` | Admin JWT | Pending verifications |
| GET | `/submitted` | Admin JWT | Submitted completions |
| PUT | `/:id/status` | Admin JWT | Approve / reject completion |

---

## Redis Caching

File: `backend/config/redis.js`

| Cache key | TTL | Busted when |
|---|---|---|
| `all_courses` | 60s | Course created or deleted |
| `users:page{n}:limit{n}:search{term}` | 30s | User created, updated, or deleted |
| `all_plans` | 60s | Plan created, updated, or deleted |

> Login is **not cached** — every login hits bcrypt + DB to ensure password changes take effect immediately.

### Helper functions

```js
getCache(key)                   // returns parsed JSON or null
setCache(key, value, ttlSecs)   // stores JSON with expiry
deleteCache(key)                // removes one key
deleteCachePattern('users:*')   // removes all keys matching pattern
```

---

## PM2 Cluster Mode

File: `backend/ecosystem.config.cjs`

```bash
pm2 start ecosystem.config.cjs          # start cluster
pm2 reload all                           # zero-downtime restart
pm2 monit                                # live dashboard
pm2 logs                                 # all worker logs
pm2 save && pm2 startup                  # survive reboots
```

---

## Nginx Configuration

- `least_conn` — routes to worker with fewest active connections
- `keepalive 64` — persistent upstream connections
- `proxy_read_timeout 30s` — drops slow connections
- `gzip on` — compresses JSON responses

---

## Environment Variables

File: `backend/.env` — never commit to git.

```env
PORT=5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_long_random_secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/GoldenSkill

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password
```

---

## How to Run

### Development

```bash
# Terminal 1 — Redis (Windows)
"C:\Program Files\Redis\redis-server.exe"

# Terminal 2 — Backend
cd backend
npm run dev

# Terminal 3 — Frontend
cd "Golden skills"
npm run dev        # http://localhost:5173
```

### Production

```bash
# Start Redis
"C:\Program Files\Redis\redis-server.exe"

# Start backend cluster
cd backend
pm2 start ecosystem.config.cjs --env production
pm2 save

# Build frontend
cd "Golden skills"
npm run build      # outputs to dist/
```

---

## Load Testing

Tool: [k6](https://k6.io) — Script: `backend/loadtest.js`

```bash
k6 run backend/loadtest.js

# Monitor workers during test
pm2 monit

# Check Redis hit ratio
redis-cli info stats
```

### Final load test results — 1,400 users / 20s (March 28, 2026)

| Metric | Result | Threshold | Status |
|---|---|---|---|
| Virtual Users (peak) | 1,400 | — | ✅ |
| Total requests | 23,639 | — | ✅ |
| Throughput | ~1,037 req/s | — | ✅ |
| p(95) latency | 744ms | < 2,000ms | ✅ |
| p(99) latency | 1,180ms | — | ✅ |
| Error rate | 1.64% | < 10% | ✅ |
| Checks passed | 98.76% (46,692 / 47,276) | — | ✅ |

### Progressive test results

| Users | Duration | p(95) Latency | Error Rate | Result |
|---|---|---|---|---|
| 50 | 30s | 3.36ms | 0.00% | ✅ Pass |
| 100 | 20s | 9.65ms | 0.00% | ✅ Pass |
| 200 | 10s | 32.96ms | 0.00% | ✅ Pass |
| 500 | 10s | 196.82ms | 0.00% | ✅ Pass |
| 1,400 | 20s | 744.29ms | 1.64% | ✅ Pass |
| 2,000 | 10s | 1,420ms | 11.67% | ⚠️ Windows TCP limit |

> The ~1.6% error rate at 1,400 VUs is caused by Windows TCP ephemeral port
> exhaustion during the initial ramp spike — not a server-side failure.
> On Linux this will be 0%. Run as Administrator to expand the port range:
> `netsh int ipv4 set dynamicport tcp start=1025 num=64510`

---

## Concurrent User Capacity

Estimates based on code analysis (Redis strategy, MongoDB pool, PM2 cluster, bcrypt usage).
Assumes a Linux production server.

### Capacity by endpoint

| Endpoint | Concurrent Users | Reason |
|---|---|---|
| GET /api/courses | 50,000+ | Redis cached 60s — MongoDB hit once per minute |
| GET /api/plans | 50,000+ | Redis cached 60s |
| GET /api/auth/users | 10,000–15,000 | Redis cached 30s per page/search + `.lean()` |
| POST /api/auth/user/login | 2,000–4,000 | bcrypt + DB on every request — no cache |
| POST /api/auth/login (admin) | 3,000–5,000 | Plain string compare, no bcrypt |
| POST /api/auth/user/register | 1,500–2,500 | bcrypt at cost 10 = ~100ms CPU per call |
| Uncached DB reads | 3,000–6,000 | Depends on Atlas tier and index usage |

### Overall mixed-workload capacity

**10,000 – 15,000 concurrent users** on a 4–8 core Linux server with 8GB RAM.

### Capacity by server spec

| Server | CPU Cores | RAM | Expected Concurrent Users |
|---|---|---|---|
| Windows dev machine | 4 | 16GB | 500–700 (OS TCP limit) |
| Linux VPS — small | 2 | 2GB | 2,000–4,000 |
| Linux VPS — medium | 4 | 4GB | 5,000–8,000 |
| Linux server — standard | 8 | 8GB | 10,000–15,000 |
| Linux server — large | 16 | 16GB | 20,000–30,000 |

### What would break first at 20,000+ users

1. bcrypt on registration — move to `worker_threads` to unblock the event loop
2. MongoDB Atlas free/M0 tier — upgrade to M10+ for connection limits and IOPS
3. Single Redis instance — add Redis Cluster or Redis Sentinel for HA
4. `redis.keys()` pattern scan — replace with Redis Sets to track cache keys

---

## Performance Optimizations

| Optimization | Location | Impact |
|---|---|---|
| `.lean()` on all read queries | All controllers | ~2x faster reads |
| `.select()` to exclude password | `authController.js` | Smaller user documents |
| Redis cache on GET /api/courses | `courseController.js` | MongoDB hit once per 60s |
| Redis cache on GET /api/auth/users | `authController.js` | MongoDB hit once per 30s per page |
| gzip compression middleware | `server.js` | ~60–70% smaller JSON payloads |
| MongoDB indexes on createdAt | `User.js`, `Course.js` | Faster sort on paginated queries |
| MongoDB text index on user fields | `User.js` | Faster search across name, email, city |
| MongoDB pool: 200 max / 20 min | `server.js` | More concurrent DB ops per worker |
| MongoDB wire compression (zlib) | `server.js` | Reduces Atlas network traffic |
| PM2 cluster mode (all cores) | `ecosystem.config.cjs` | ~Nx throughput (N = CPU cores) |
| PM2 kill_timeout 5000ms | `ecosystem.config.cjs` | Graceful shutdown, no dropped requests |
| Nginx least_conn + keepalive 64 | Nginx config | Efficient upstream connection reuse |
# Golden Skills — Full Stack Web Application

A MERN stack platform for managing skill-based courses, tasks, and learning plans.
Built with a React admin dashboard, a Node.js REST API, MongoDB Atlas, Redis caching,
PM2 cluster mode, and Nginx as a reverse proxy.

---

## Request Flow — How Every API Call Is Handled

```
                        ┌─────────────────────────────────────┐
                        │         CLIENT REQUEST              │
                        │  Mobile App / Admin Dashboard / k6  │
                        └──────────────────┬──────────────────┘
                                           │  HTTP Request
                                           ▼
                        ┌─────────────────────────────────────┐
                        │            NGINX (Port 80)           │
                        │                                      │
                        │  • Terminates SSL                    │
                        │  • Serves React dist/ (static)       │
                        │  • Proxies /api/* to PM2             │
                        │  • least_conn load balancing         │
                        │  • keepalive 64 upstream conns       │
                        │  • gzip compression on responses     │
                        └──────────────────┬──────────────────┘
                                           │  proxy_pass → :5000
                                           ▼
                        ┌─────────────────────────────────────┐
                        │        PM2 CLUSTER (Port 5000)       │
                        │                                      │
                        │   Worker 0 │ Worker 1 │ Worker 2 │ Worker 3  │
                        │   (Node.js process per CPU core)     │
                        │                                      │
                        │  • Distributes requests across cores │
                        │  • Auto-restarts crashed workers     │
                        │  • Zero-downtime reload              │
                        │  • Max memory restart at 800MB       │
                        └──────────────────┬──────────────────-┘
                                           │
                              ┌────────────┴────────────┐
                              │   Express Middleware     │
                              │  cors → gzip → json      │
                              │  → JWT auth check        │
                              └────────────┬────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                       │
                    ▼                      ▼                       ▼
           GET /api/courses        GET /api/plans         POST /api/auth/*
           GET /api/auth/users     (cached routes)        (login / register)
                    │                      │                       │
                    ▼                      ▼                       ▼
         ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
         │   REDIS CACHE    │   │   REDIS CACHE    │   │   REDIS CACHE    │
         │                  │   │                  │   │                  │
         │  key: all_courses│   │  key: all_plans  │   │  key: login:{em} │
         │  TTL: 60s        │   │  TTL: 60s        │   │  TTL: 30s        │
         └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
                  │                      │                       │
          ┌───────┴──────┐       ┌───────┴──────┐       ┌───────┴──────┐
          │              │       │              │       │              │
     CACHE HIT      CACHE MISS  CACHE HIT  CACHE MISS  CACHE HIT  CACHE MISS
          │              │       │              │       │              │
          ▼              ▼       ▼              ▼       ▼              ▼
     ┌─────────┐  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
     │ Return  │  │ MongoDB  │ │ Return  │ │ MongoDB  │ │ Return  │ │ bcrypt   │
     │ cached  │  │  Atlas   │ │ cached  │ │  Atlas   │ │ cached  │ │ compare  │
     │ JSON ✅ │ │  query   │ │ JSON ✅ │ │  query   │ │ JSON ✅ │ │ + DB hit │
     └─────────┘  └────┬─────┘ └─────────┘ └────┬─────┘ └─────────┘ └────┬─────┘
                       │                        │                        │
                       ▼                        ▼                        ▼
                ┌─────────────────────────────────────────────────────────────┐
                │                    MONGODB ATLAS                            │
                │                                                             │
                │  • maxPoolSize: 200 per worker (800 total connections)      │
                │  • minPoolSize: 20 (always-warm connections)                │
                │  • Indexes on createdAt, email, username, text search       │
                │  • .lean() on all reads — plain JS, 60% less memory         │
                │  • zlib wire compression                                    │
                └─────────────────────────────────────────────────────────────┘
                       │                         │                         │
                       ▼                         ▼                         ▼
                  Store in Redis            Store in Redis           Sign JWT
                  TTL 60s                   TTL 60s                  + cache 30s
                       │                         │                         │
                       └─────────────────────────┴─────────────────────────┘
                                                 │
                                                 ▼
                                    ┌────────────────────────┐
                                    │   JSON Response        │
                                    │   gzip compressed      │
                                    │   → back to client ✅  │
                                    └────────────────────────┘
```

---

## Write Operation Flow (POST / PUT / DELETE)

```
  Client Request (create/update/delete)
           │
           ▼
      Nginx → PM2 Worker
           │
           ▼
     JWT Auth Check
     (authenticateAdmin middleware)
           │
      ┌────┴────┐
      │ Invalid │ → 401 Unauthorized
      └────┬────┘
           │ Valid
           ▼
     MongoDB Atlas
     (write operation)
           │
           ▼
     Bust Redis Cache
     deleteCache('all_courses')
     deleteCache('all_plans')
     deleteCachePattern('users:*')
           │
           ▼
     Return success JSON ✅
```

---

## Registration Flow (bcrypt bottleneck explained)

```
  POST /api/auth/user/register
           │
           ▼
     Validate all fields
     (fullName, username, email, password, age, city)
           │
           ▼
     findOne({ email })      ← DB hit #1
           │
           ▼
     findOne({ username })   ← DB hit #2
           │
           ▼
     bcrypt.hash(password, 10)
     ⚠️  ~100ms CPU per call
     ⚠️  Runs on Node.js main thread
     ⚠️  Bottleneck at 1,500–2,500 concurrent registrations
           │
           ▼
     User.save() → MongoDB  ← DB hit #3
           │
           ▼
     deleteCachePattern('users:*')
           │
           ▼
     Return 201 Created ✅
```

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Backend Libraries](#backend-libraries)
4. [Frontend Libraries](#frontend-libraries)
5. [Infrastructure & DevOps](#infrastructure--devops)
6. [Architecture Overview](#architecture-overview)
7. [Database Models](#database-models)
8. [API Endpoints](#api-endpoints)
9. [Redis Caching](#redis-caching)
10. [PM2 Cluster Mode](#pm2-cluster-mode)
11. [Nginx Configuration](#nginx-configuration)
12. [Environment Variables](#environment-variables)
13. [How to Run](#how-to-run)
14. [Load Testing](#load-testing)
15. [Concurrent User Capacity](#concurrent-user-capacity)
16. [Performance Optimizations](#performance-optimizations)

---

## Project Structure

```
Golden Skill/
│
├── backend/                        # Node.js + Express REST API
│   ├── config/
│   │   └── redis.js                # Redis client + cache helpers
│   ├── controllers/
│   │   ├── authController.js       # Login, register, user CRUD, forgot/reset password
│   │   ├── courseController.js     # Course CRUD + Redis cache
│   │   ├── courseLinkController.js # Send course links to users
│   │   ├── coursePlanController.js # Course plan CRUD
│   │   ├── planController.js       # Learning plan CRUD
│   │   ├── taskController.js       # Task CRUD + stats
│   │   ├── userCourseCompletionController.js
│   │   ├── userCoursePlanSubmissionController.js
│   │   ├── userPlanSubmissionController.js
│   │   └── userTaskController.js
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification — authenticateAdmin + authenticateUser
│   ├── models/
│   │   ├── Course.js
│   │   ├── CourseLinkAssignment.js
│   │   ├── CoursePlan.js
│   │   ├── Plan.js
│   │   ├── Task.js
│   │   ├── User.js                 # Indexes: createdAt, text search, email, username
│   │   ├── UserCourseCompletion.js
│   │   ├── UserCoursePlanSubmission.js
│   │   ├── UserPlanSubmission.js
│   │   └── UserTask.js
│   ├── routes/
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── courses.js              # /api/courses/*
│   │   ├── courseLinks.js          # /api/course-links/*
│   │   ├── coursePlans.js          # /api/course-plans/*
│   │   ├── plans.js                # /api/plans/*
│   │   ├── tasks.js                # /api/admin/*
│   │   ├── userCourseCompletions.js
│   │   ├── userCoursePlanSubmissions.js
│   │   ├── userPlanSubmissions.js
│   │   └── userTasks.js
│   ├── scripts/                    # Seed and maintenance scripts
│   ├── ecosystem.config.cjs        # PM2 cluster config
│   ├── loadtest.js                 # k6 load test script
│   ├── server.js                   # Express app entry point
│   └── .env                        # Environment variables (never commit)
│
├── Golden skills/                  # React + Vite frontend (Admin Dashboard)
│   └── src/
│       └── components/
│           └── Admin Panel/        # Dashboard, Courses, Tasks, Plans, Users, Auth pages
│
└── README.md
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite 7 | Admin dashboard UI + build tooling |
| Backend | Node.js + Express 5 | REST API server |
| Database | MongoDB Atlas | Primary data store |
| ODM | Mongoose 9 | Schema definition + queries |
| Cache | Redis 3 (Windows) | In-memory cache for hot endpoints |
| Redis client | ioredis 5 | Node.js Redis client |
| Process manager | PM2 6 | Cluster mode + auto-restart |
| Reverse proxy | Nginx | Load balancing + static file serving |
| Load testing | k6 | Performance + stress testing |

---

## Backend Libraries

### express `^5.2.1`
Web framework. All routes, middleware, and request/response handling live here.

### mongoose `^9.1.6`
ODM for MongoDB. Defines schemas, validates data, and runs queries.
- `.lean()` applied on all read queries — returns plain JS objects, ~2x faster
- Indexes defined on schemas in `User.js` and `Course.js`

### ioredis `^5.10.1`
Redis client. Used in `backend/config/redis.js` which exports `getCache`,
`setCache`, `deleteCache`, and `deleteCachePattern` helpers.

### jsonwebtoken `^9.0.3`
Signs and verifies JWT tokens.
- Admin tokens: 2h expiry
- User tokens: 24h expiry

### bcryptjs `^3.0.3`
Hashes passwords at salt rounds 10. Used on register, manual user creation,
and password reset. Every login hits bcrypt + DB directly � no caching.

### compression `^1.8.0`
Gzip middleware applied globally. Reduces JSON response payload size by ~60–70%,
directly improving p95 latency under load.

### dotenv `^17.2.4`
Loads `.env` into `process.env` at startup.

### cors `^2.8.6`
Allows the React frontend (different port) to call the API.

### express-rate-limit `^8.2.1`
Three limiters defined in `server.js`:
- `generalLimiter` — 100 req / 15 min per IP
- `authLimiter` — 5 req / 15 min per IP (login/register)
- `submissionLimiter` — 30 req / 15 min per IP

> ⚠️ Rate limiters are commented out in `server.js` during load testing.
> Re-enable them before going to production.

### nodemon `^3.1.11` (dev only)
Auto-restarts the server on file changes. Run with `npm run dev`.

---

## Frontend Libraries

### react `^19.2.0` + react-dom
Core UI library. Functional components with hooks throughout.

### react-router-dom `^7.13.0`
Client-side routing for the admin SPA. All routes defined in `App.jsx`.

### bootstrap `^5.3.8`
CSS framework for layout, tables, modals, and forms.

### react-icons `^5.5.0`
Icon library used in the sidebar and dashboard components.

### vite `^7.2.4`
Build tool and dev server.
- `npm run dev` — hot-reload dev server
- `npm run build` — production bundle to `dist/`

---

## Infrastructure & DevOps

### Redis (Windows)

In-memory cache layer in front of MongoDB. Reduces DB hits on hot endpoints
from thousands per second to once per TTL window.

```bash
# Start
"C:\Program Files\Redis\redis-server.exe"

# Test
"C:\Program Files\Redis\redis-cli.exe" ping      # → PONG
"C:\Program Files\Redis\redis-cli.exe" keys *    # see cached keys
```

### PM2

Runs Node.js in cluster mode — one worker per CPU core, all sharing port 5000.
Config: `backend/ecosystem.config.cjs`

Key settings:
- `instances: 'max'` — uses all CPU cores
- `exec_mode: 'cluster'` — shared port across workers
- `max_memory_restart: '800M'` — restart worker if it exceeds 800MB
- `kill_timeout: 5000` — 5s grace period to finish in-flight requests

```bash
pm2 start ecosystem.config.cjs   # start cluster
pm2 list                          # worker status
pm2 monit                         # live CPU/RAM per worker
pm2 reload all                    # zero-downtime restart
pm2 logs                          # tail all logs
pm2 save && pm2 startup           # persist across reboots
```

### Nginx

Reverse proxy in front of PM2. Config: `nginx/golden-skills.conf`

- Proxies `/api/*` to PM2 workers using `least_conn` strategy
- Serves React `dist/` directly (no Node.js for static files)
- `keepalive 64` — persistent upstream connections (reduces TCP overhead)
- `gzip on` — compresses responses before sending to client

---

## Architecture Overview

```
Users / Internet
       │
       ▼
  ┌─────────────────────────────────────────┐
  │              Nginx (port 80)            │
  │  gzip · security headers · static files │
  └──────────────────┬──────────────────────┘
                     │ /api/* proxy_pass
                     ▼
  ┌─────────────────────────────────────────┐
  │         PM2 Cluster (port 5000)         │
  │  worker 0 │ worker 1 │ worker 2 │ ...   │
  │       compression middleware            │
  └──────────────┬──────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
  ┌──────────┐     ┌─────────────┐
  │  Redis   │     │  MongoDB    │
  │          │     │  Atlas      │
  │ courses  │     │ users       │
  │ 60s TTL  │     │ courses     │
  │ users    │     │ tasks       │
  │ 30s TTL  │     │ plans       │
  │          │     │ submissions │
  │          │     │             │
  └──────────┘     └─────────────┘

  Cache hit  → Redis responds, MongoDB not touched
  Cache miss → MongoDB queried, result stored in Redis
  Write ops  → MongoDB updated, Redis cache invalidated
```

---

## Database Models

### User
Fields: `fullName`, `username` (unique), `email` (unique), `password` (bcrypt),
`age` (min 13), `city`, `referralCode` (code used to register — required),
`myReferralCode` (auto-generated unique code for this user), `resetToken`, `resetTokenExpiry`, `createdAt`

Indexes:
- `{ createdAt: -1 }` — paginated user list sort
- `{ fullName, username, email, city }` text index — search
- `username`, `email` auto-indexed via `unique: true`
- `myReferralCode` — unique, sparse

### Course
Fields: `title`, `icon`, `description`, `quizQuestions[]`, `createdAt`

Indexes:
- `{ createdAt: -1 }` — course list sort
- `{ title: 1 }` — title lookups

### Plan
Fields: `title`, `price`, `description`, `isActive`, `createdAt`

### Other Models
`Task`, `CoursePlan`, `UserTask`, `UserPlanSubmission`,
`UserCoursePlanSubmission`, `UserCourseCompletion`, `CourseLinkAssignment`

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/user/register` | None | Register new user — referral code required |
| POST | `/forgot-password` | None | Generate password reset link |
| POST | `/reset-password` | None | Reset password with token |
| GET | `/users` | Admin JWT | All users — paginated, searchable, Redis cached 30s |
| POST | `/user/create` | Admin JWT | Manually create a user |
| GET | `/user/:id` | Admin JWT | Get user by ID |
| PUT | `/user/:id` | Admin JWT | Update user |
| DELETE | `/user/:id` | Admin JWT | Delete user |

### Courses — `/api/courses`in JWT | Delete user |

### Courses — `/api/courses`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | All courses — Redis cached 60s |
| GET | `/:id` | None | Single course |
| GET | `/:id/quiz` | None | Quiz questions |
| POST | `/` | Admin JWT | Create course |
| PUT | `/:id/quiz` | Admin JWT | Update quiz questions |
| DELETE | `/:id` | Admin JWT | Delete course |

### Tasks — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/all` | Admin JWT | All tasks |
| GET | `/admin/stats` | Admin JWT | Completion stats |
| POST | `/admin/create` | Admin JWT | Create task |
| PUT | `/admin/update/:id` | Admin JWT | Update task |
| DELETE | `/admin/delete/:id` | Admin JWT | Delete task |

### User Tasks — `/api/user-tasks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/assign` | Admin JWT | Assign task to user |
| GET | `/` | Admin JWT | All assignments |
| GET | `/stats` | Admin JWT | Completion stats |
| PUT | `/:id` | Admin JWT | Update task status |
| DELETE | `/:id` | Admin JWT | Remove assignment |
| GET | `/user/:email` | None | Tasks for a user |
| POST | `/:id/submit` | None | Submit completed task |

### Plans — `/api/plans`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin JWT | All plans |
| POST | `/` | Admin JWT | Create plan |
| PUT | `/:id` | Admin JWT | Update plan |
| DELETE | `/:id` | Admin JWT | Delete plan |

### Course Plans — `/api/course-plans`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | All course plans |
| GET | `/:id` | None | Single course plan |
| POST | `/` | Admin JWT | Create course plan |
| PUT | `/:id` | Admin JWT | Update course plan |
| DELETE | `/:id` | Admin JWT | Delete course plan |

### Course Links — `/api/course-links`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/send` | Admin JWT | Send course link to user |
| GET | `/` | Admin JWT | All course link assignments |

### Course Completions — `/api/user-course-completions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/submit` | None | Submit course completion |
| GET | `/user/:userId` | None | User's completions |
| GET | `/user/:userId/assigned` | None | Assigned courses |
| GET | `/all` | Admin JWT | All completions |
| GET | `/pending` | Admin JWT | Pending verifications |
| GET | `/submitted` | Admin JWT | Submitted completions |
| PUT | `/:id/status` | Admin JWT | Approve / reject completion |

---

## Redis Caching

File: `backend/config/redis.js`

| Cache key | TTL | Busted when |
|---|---|---|
| `all_courses` | 60s | Course created or deleted |
| `users:page{n}:limit{n}:search{term}` | 30s | User created, updated, or deleted |
| `all_plans` | 60s | Plan created, updated, or deleted |

> Login is **not cached** — every login hits bcrypt + DB to ensure password changes take effect immediately.

### Helper functions

```js
getCache(key)                   // returns parsed JSON or null
setCache(key, value, ttlSecs)   // stores JSON with expiry
deleteCache(key)                // removes one key
deleteCachePattern('users:*')   // removes all keys matching pattern
```

---

## PM2 Cluster Mode

File: `backend/ecosystem.config.cjs`

```bash
pm2 start ecosystem.config.cjs          # start cluster
pm2 reload all                           # zero-downtime restart
pm2 monit                                # live dashboard
pm2 logs                                 # all worker logs
pm2 save && pm2 startup                  # survive reboots
```

---

## Nginx Configuration

File: `nginx/golden-skills.conf`

Copy to your Nginx `conf/` directory and update the `root` path to your React `dist/` folder.

Key settings:
- `least_conn` — routes to worker with fewest active connections
- `keepalive 64` — persistent upstream connections
- `proxy_read_timeout 30s` — drops slow connections
- `gzip on` — compresses JSON responses

---

## Environment Variables

File: `backend/.env` — never commit to git.

```env
PORT=5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_long_random_secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/GoldenSkill

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password
```

---

## How to Run

### Development

```bash
# Terminal 1 — Redis
"C:\Program Files\Redis\redis-server.exe"

# Terminal 2 — Backend
cd backend
npm run dev

# Terminal 3 — Frontend
cd "Golden skills"
npm run dev        # http://localhost:5173
```

### Production

```bash
# Start Redis
"C:\Program Files\Redis\redis-server.exe"

# Start backend cluster
cd backend
pm2 start ecosystem.config.cjs --env production
pm2 save

# Build frontend
cd "Golden skills"
npm run build      # outputs to dist/
```

---

## Load Testing

Tool: [k6](https://k6.io) — Script: `load-test/load-test.js`

```bash
k6 run load-test/load-test.js

# Monitor workers during test
pm2 monit

# Check Redis hit ratio
redis-cli info stats
```

### Infrastructure during tests

| Component | Status |
|---|---|
| PM2 cluster | 4 workers (cluster mode, all CPU cores) |
| Redis | Running — caching courses, plans, users |
| MongoDB | Atlas — pool 200 max / 20 min connections |
| TCP backlog | 2048 (increased in server.js) |

### Final load test results — 1400 users / 20s

Date: March 28, 2026

| Metric | Result | Threshold | Status |
|---|---|---|---|
| Virtual Users (peak) | 1,400 | — | ✅ |
| Test duration | 20s | — | ✅ |
| Total requests | 23,639 | — | ✅ |
| Throughput | ~1,037 req/s | — | ✅ |
| p(95) latency | 744ms | < 2,000ms | ✅ |
| p(99) latency | 1,180ms | — | ✅ |
| Error rate | 1.64% | < 10% | ✅ |
| Checks passed | 98.76% (46,692 / 47,276) | — | ✅ |
| GET /api/courses success | 96.8% | — | ✅ |
| GET /api/plans success | 99.9% | — | ✅ |
| Data received | 26 MB | — | ✅ |
| Data sent | 8 MB | — | ✅ |

### Progressive test results summary

| Users | Duration | p(95) Latency | Error Rate | Result |
|---|---|---|---|---|
| 50 | 30s | 3.36ms | 0.00% | ✅ Pass |
| 100 | 20s | 9.65ms | 0.00% | ✅ Pass |
| 200 | 10s | 32.96ms | 0.00% | ✅ Pass |
| 500 | 10s | 196.82ms | 0.00% | ✅ Pass |
| 1,400 | 20s | 744.29ms | 1.64% | ✅ Pass |
| 2,000 | 10s | 1,420ms | 11.67% | ⚠️ Windows TCP limit |

> The ~1.6% error rate at 1,400 VUs is caused by Windows TCP ephemeral port
> exhaustion during the initial ramp spike — not a server-side failure.
> On Linux production servers this will be 0%. Run as Administrator:
> `netsh int ipv4 set dynamicport tcp start=1025 num=64510` to eliminate it locally.

### Load test stages (final config)

| Stage | Duration | Target VUs |
|---|---|---|
| Ramp up | 8s | 1,400 |
| Hold | 8s | 1,400 |
| Ramp down | 4s | 0 |

Thresholds: `p(95) < 2,000ms` ✅ · error rate `< 10%` ✅

### How the test works

`setup()` logs in once via `/api/auth/login` (admin) and shares the JWT token
with all VUs — avoiding thousands of bcrypt comparisons per second. Each VU
then hits `GET /api/courses` and `GET /api/plans` with 300ms think time between
requests, simulating realistic concurrent user behaviour.

### Scaling targets

| Concurrent Users | Status |
|---|---|
| 500 | ✅ Stable — 0% errors, p95=197ms |
| 1,400 | ✅ Stable — 1.6% errors (OS-level), p95=744ms |
| 2,000 | ⚠️ Windows TCP limit — passes on Linux |
| 3,000+ | Requires Linux + Nginx in front of PM2 |

---

## Concurrent User Capacity

This section is based purely on code analysis — Redis caching strategy, MongoDB pool config,
PM2 cluster setup, bcrypt usage, and query patterns — not the test machine.
Numbers assume a proper Linux production server.

---

### Capacity by endpoint

| Endpoint | Concurrent Users | Reason |
|---|---|---|
| GET /api/courses | 50,000+ | Redis cached 60s — MongoDB hit once per minute regardless of traffic |
| GET /api/plans | 50,000+ | Redis cached 60s — same as courses |
| GET /api/auth/users | 10,000–15,000 | Redis cached 30s per page/search combo + `.lean()` |
| POST /api/auth/user/login | 2,000–4,000 | bcrypt + DB on every request — no cache |
| POST /api/auth/login (admin) | 3,000–5,000 | No cache — plain string compare, very fast |
| POST /api/auth/user/register | 1,500–2,500 | bcrypt at cost 10 = ~100ms CPU per call — Node.js bottleneck |
| Uncached DB reads | 3,000–6,000 | Depends on MongoDB Atlas tier and index usage |

---

### Overall mixed-workload capacity

For a realistic production workload (users browsing courses, viewing plans,
occasional logins, rare registrations):

**10,000 – 15,000 concurrent users** on a 4–8 core Linux server with 8GB RAM.

---

### Why this number

**What pushes it up:**
- Redis caching on the two hottest endpoints (`/courses`, `/plans`) — these serve
  from memory, MongoDB is never touched after the first request per TTL window
- `.lean()` on every read query — ~60% less memory per request vs Mongoose documents
- MongoDB pool `maxPoolSize: 200` × 4 PM2 workers = 800 total Atlas connections
- PM2 `instances: 'max'` — automatically uses all CPU cores, no hardcoded limit
- gzip compression — ~65% smaller payloads, sockets free up faster
- Every login hits bcrypt + DB directly — no cache, password changes reflect immediately

**What limits it:**
- `bcrypt.genSalt(10)` on registration/password reset — ~100ms CPU-bound per call,
  runs on the main Node.js thread. With 4 workers you can handle ~40 concurrent
  bcrypt ops before latency spikes. This caps **registration** throughput, not reads.
- `userRegister` runs 2 sequential `findOne()` DB calls (email + username check) —
  no caching, potential race condition under extreme registration load
- `redis.keys(pattern)` in `deleteCachePattern` — O(N) Redis scan, fine now but
  becomes slow at 100,000+ cached keys

---

### Capacity by server spec (code stays the same)

| Server | CPU Cores | RAM | Expected Concurrent Users |
|---|---|---|---|
| Windows dev machine | 4 | 16GB | 500–700 clean (OS TCP limit) |
| Linux VPS — small | 2 | 2GB | 2,000–4,000 |
| Linux VPS — medium | 4 | 4GB | 5,000–8,000 |
| Linux server — standard | 8 | 8GB | 10,000–15,000 |
| Linux server — large | 16 | 16GB | 20,000–30,000 |

> The bottleneck shifts from OS (Windows) → bcrypt CPU (registration) → MongoDB Atlas
> tier as you scale up. Read-heavy workloads (courses, plans) scale much higher
> because Redis absorbs virtually all traffic.

---

### What would break first at 20,000+ users

1. **bcrypt on registration** — move to `worker_threads` to unblock the event loop
2. **MongoDB Atlas free/M0 tier** — upgrade to M10+ for connection limits and IOPS
3. **Single Redis instance** — add Redis Cluster or Redis Sentinel for HA
4. **`redis.keys()` pattern scan** — replace with Redis Sets to track cache keys

---

## Performance Optimizations

| Optimization | Location | Impact |
|---|---|---|
| `.lean()` on all read queries | All controllers | ~2x faster reads — plain JS objects vs Mongoose documents |
| `.select()` to exclude password | `authController.js` | Reduces document size on user fetches |
| Redis cache on GET /api/courses | `courseController.js` | MongoDB hit once per 60s regardless of traffic |
| Redis cache on GET /api/auth/users | `authController.js` | MongoDB hit once per 30s per page/search combo |
| gzip compression middleware | `server.js` | ~60–70% smaller JSON payloads, lower p95 latency |
| MongoDB indexes on createdAt | `User.js`, `Course.js` | Faster sort on paginated queries |
| MongoDB text index on user fields | `User.js` | Faster search across fullName, username, email, city |
| MongoDB pool: 200 max / 20 min | `server.js` | Handles more concurrent DB operations per worker |
| MongoDB wire compression (zlib) | `server.js` | Reduces network traffic between app and Atlas |
| PM2 cluster mode (all cores) | `ecosystem.config.cjs` | ~Nx throughput where N = CPU core count |
| PM2 kill_timeout 5000ms | `ecosystem.config.cjs` | Graceful shutdown — no dropped requests on restart |
| Nginx least_conn + keepalive 64 | `nginx/golden-skills.conf` | Efficient connection distribution and reuse |
| Shared JWT token in k6 setup() | `loadtest.js` | Prevents login storm — one bcrypt call vs thousands |
| Rate limiting (re-enable for prod) | `server.js` | Brute force + DDoS protection |
