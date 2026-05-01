# Golden Skills — Tech Deep Dive

A full breakdown of every technology used in this project, why it was chosen over alternatives, and the best practices applied.

---

## Backend

### Node.js + Express

**What it is:** Node.js is a JavaScript runtime built on Chrome's V8 engine. Express is a minimal web framework on top of it.

**Why this over alternatives:**

| Option | Reason not chosen |
|---|---|
| Django (Python) | Heavier, slower startup, different language from frontend |
| Spring Boot (Java) | Very verbose, overkill for this scale |
| FastAPI (Python) | Great but team is JS-focused |
| NestJS | More structured but adds complexity we don't need yet |

**Why Express fits here:**
- Lightweight — you only add what you need
- Huge ecosystem, easy to find solutions
- Non-blocking I/O — handles many concurrent requests well (important for a learning platform with many users)
- Same language as frontend (JavaScript) — one mental model for the whole team

**Best practices applied in this project:**
- Routes are split by resource (`/api/auth`, `/api/courses`, `/api/plans`, etc.) — not everything in one file
- Controllers are separated from routes — routes just map URLs, controllers hold the logic
- `dotenv` used for all secrets — nothing hardcoded

---

### MongoDB + Mongoose

**What it is:** MongoDB is a NoSQL document database. Mongoose is an ODM (Object Document Mapper) that adds schema validation and query helpers on top of it.

**Why MongoDB over alternatives:**

| Option | Reason not chosen |
|---|---|
| PostgreSQL | Relational, requires fixed schema — harder to iterate fast |
| MySQL | Same as above |
| SQLite | Not suitable for production multi-user apps |
| Firebase Firestore | Vendor lock-in, less control, costs scale badly |

**Why MongoDB fits here:**
- Flexible schema — user data, course data, submissions all have different shapes
- JSON-like documents map naturally to JavaScript objects
- Easy to scale horizontally
- Mongoose adds schema validation so you still get structure where you need it

**Best practices applied:**
- `.lean()` used on read queries — returns plain JS objects instead of full Mongoose documents, roughly 2x faster and uses less memory
- `maxPoolSize: 200` — connection pooling configured to handle load
- `select('-password')` — password field explicitly excluded from user queries
- Indexes used (see `scripts/rebuildIndexes.js`) — queries don't do full collection scans

---

### Redis (via ioredis)

**What it is:** Redis is an in-memory key-value store used here as a caching layer between the API and MongoDB.

**Why Redis over alternatives:**

| Option | Why Redis wins |
|---|---|
| Memcached | Redis supports more data types (lists, sets, hashes), has persistence, pub/sub, and better client support. Memcached is just a simple string cache — Redis does everything Memcached does and more |
| In-memory JS object (e.g. a plain `{}`) | Dies on server restart, not shared across multiple processes/workers, no TTL support |
| Database query cache (MongoDB built-in) | Less control, can't invalidate specific keys, not as fast |
| Varnish / CDN cache | Works at HTTP level, not suitable for authenticated/dynamic API responses |

**Why Redis specifically fits this project:**
- Login responses are cached per email for 30s — absorbs burst traffic without hitting bcrypt + DB every time
- User list pages are cached with pagination keys (`users:page1:limit10:search`) — admin dashboard loads instantly
- Course/plan data cached for 60s — this data rarely changes
- `deleteCachePattern('users:*')` — when a user is created, all paginated user caches are busted at once
- Graceful fallback — if Redis is down, the app still works, just slower

**ioredis vs redis (the other npm client):**

| | ioredis | redis (node-redis) |
|---|---|---|
| Performance | Slightly faster | Slightly slower |
| API | Promise-based, clean | Also promise-based now |
| Cluster support | Built-in | Requires extra config |
| Community | Widely used in production | Also popular |

ioredis is the more battle-tested choice for production Node.js apps.

**Best practices applied:**
- `retryStrategy` — stops retrying after 3 attempts, logs a warning, doesn't crash the app
- `lazyConnect: true` — doesn't connect until `.connect()` is explicitly called
- All cache helpers (`getCache`, `setCache`, `deleteCache`) wrapped in try/catch — cache failures never break the API
- Short TTLs (30s for user data, 60s for courses) — stale data window is small
- Cache invalidation on every write — data never stays stale after a mutation

---

### JWT (jsonwebtoken)

**What it is:** JSON Web Tokens — a stateless way to authenticate requests.

**Why JWT over alternatives:**

| Option | Reason not chosen |
|---|---|
| Sessions + cookies | Requires server-side session store, harder to scale across multiple servers |
| OAuth only | Overkill for internal auth, adds complexity |
| API keys | Fine for server-to-server, not great for user auth |

**Why JWT fits here:**
- Stateless — the server doesn't need to store session data
- Works well for mobile apps (the user-facing side of this project)
- Admin token expires in 2h, user token in 24h — short enough to limit damage if stolen
- Token contains `role` claim — middleware can check `admin` vs `user` without a DB lookup

**Best practices applied:**
- `JWT_SECRET` stored in `.env`, never hardcoded
- Password reset uses a separate short-lived token (1h) with `type: 'password_reset'` claim — can't be reused as a login token
- Reset token stored in DB and checked on use — prevents token reuse after password change

---

### bcryptjs

**What it is:** A library for hashing passwords using the bcrypt algorithm.

**Why bcrypt over alternatives:**

| Option | Why bcrypt wins |
|---|---|
| MD5 / SHA256 | These are fast hashing algorithms — fast is bad for passwords because it makes brute force cheap |
| argon2 | Slightly more modern, but bcrypt is battle-tested and widely supported |
| Plain text | Never. |

**Why bcrypt is the right choice:**
- Intentionally slow — each hash takes ~100ms, making brute force attacks expensive
- Salted automatically — same password hashes differently each time, defeats rainbow tables
- `genSalt(10)` — cost factor of 10 is the standard balance between security and performance

---

### express-rate-limit

**What it is:** Middleware that limits how many requests an IP can make in a time window.

**Why this matters:**
- Without it, a single IP can hammer your login endpoint with thousands of password attempts
- Protects against brute force, credential stuffing, and DDoS

**Three tiers configured in this project:**
- `generalLimiter` — 100 req / 15 min for all API routes
- `authLimiter` — 5 req / 15 min for login/register/reset (strictest)
- `submissionLimiter` — 30 req / 15 min for form submissions

> Note: Rate limiters are currently commented out for load testing. Re-enable before going to production.

---

### compression

**What it is:** Express middleware that gzip-compresses HTTP responses.

**Why it matters:**
- Reduces response payload size by 60-80% for JSON responses
- Faster load times, less bandwidth cost
- One line to add, significant gain — no reason not to use it

---

### nodemon (dev only)

**What it is:** Watches your files and restarts the server automatically on changes.

**Why:** Pure developer experience — no need to manually restart the server during development. Not used in production.

---

## Frontend

### React 19

**What it is:** A JavaScript library for building component-based UIs.

**Why React over alternatives:**

| Option | Reason not chosen |
|---|---|
| Vue | Smaller ecosystem, less job market demand |
| Angular | Heavy, opinionated, steep learning curve |
| Svelte | Smaller community, less tooling |
| Vanilla JS | Doesn't scale well for complex UIs |

**Why React fits here:**
- Component model maps well to a dashboard with many reusable UI pieces
- Huge ecosystem — any UI problem has a solution
- React 19 brings performance improvements and better concurrent rendering

---

### React Router DOM v7

**What it is:** Client-side routing for React apps.

**Why:** Standard choice for React SPAs. v7 brings improved data loading patterns and better TypeScript support. Handles the admin panel routes, user-facing routes, and protected routes cleanly.

---

### Vite

**What it is:** A modern frontend build tool and dev server.

**Why Vite over alternatives:**

| Option | Reason not chosen |
|---|---|
| Create React App (Webpack) | Slow, outdated, officially deprecated |
| Webpack (manual config) | Complex config, slow cold starts |
| Parcel | Less control |

**Why Vite:**
- Near-instant dev server startup (uses native ES modules, no bundling in dev)
- Hot Module Replacement (HMR) is extremely fast
- Production builds use Rollup — well-optimized output

---

### Bootstrap 5

**What it is:** A CSS framework with pre-built components and a grid system.

**Why Bootstrap over alternatives:**

| Option | Reason not chosen |
|---|---|
| Tailwind CSS | Utility-first, more verbose JSX, steeper learning curve |
| Material UI | Heavier, opinionated design system |
| Chakra UI | React-specific, adds JS overhead |
| Plain CSS | More work for standard components |

**Why Bootstrap fits here:**
- Fast to build admin dashboards — tables, modals, forms, grids all ready to use
- No JS overhead for most components (using CSS classes only)
- Familiar to most developers

---

### react-icons

**What it is:** A single package that bundles icons from Font Awesome, Material Icons, Feather, and more.

**Why:** No need to install multiple icon libraries. Import only what you use — tree-shaking keeps bundle size small.

---

## Architecture Summary

```
[React Frontend] 
      ↓ HTTP requests
[Express API]
      ↓ check cache first
[Redis] ← hit → return cached response
      ↓ miss
[MongoDB] → store result in Redis → return response
```

The caching layer means most read-heavy endpoints (courses, plans, user lists) never touch MongoDB on repeat requests within the TTL window. This is the core performance strategy of the backend.