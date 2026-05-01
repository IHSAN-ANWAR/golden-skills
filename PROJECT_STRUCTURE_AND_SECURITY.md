# Golden Skills — Project Structure & Security

A full breakdown of how the project is organized and every security measure implemented.

---

## Project Structure

```
golden-skills/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   └── redis.js                # Redis client + cache helpers
│   ├── controllers/                # Business logic (one file per resource)
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── courseLinkController.js
│   │   ├── coursePlanController.js
│   │   ├── planController.js
│   │   ├── taskController.js
│   │   ├── userCourseCompletionController.js
│   │   ├── userCoursePlanSubmissionController.js
│   │   ├── userPlanSubmissionController.js
│   │   └── userTaskController.js
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification (user + admin)
│   ├── models/                     # Mongoose schemas (one per collection)
│   │   ├── Course.js
│   │   ├── CourseLinkAssignment.js
│   │   ├── CoursePlan.js
│   │   ├── Plan.js
│   │   ├── Task.js
│   │   ├── User.js
│   │   ├── UserCourseCompletion.js
│   │   ├── UserCoursePlanSubmission.js
│   │   ├── UserPlanSubmission.js
│   │   └── UserTask.js
│   ├── routes/                     # Route definitions (one file per resource)
│   │   ├── auth.js
│   │   ├── courseLinks.js
│   │   ├── coursePlans.js
│   │   ├── courses.js
│   │   ├── plans.js
│   │   ├── tasks.js
│   │   ├── userCourseCompletions.js
│   │   ├── userCoursePlanSubmissions.js
│   │   ├── userPlanSubmissions.js
│   │   └── userTasks.js
│   ├── scripts/                    # One-off DB scripts (seeding, indexing)
│   ├── .env                        # Secrets (never committed to git)
│   ├── server.js                   # App entry point
│   └── package.json
│
└── Golden skills/                  # React + Vite frontend
    └── src/
        ├── assets/                 # Images, GIFs
        ├── components/
        │   ├── Admin Panel/        # All admin dashboard components
        │   │   ├── AdminLayout.jsx # Wraps all admin routes
        │   │   ├── AdminSidebar.jsx
        │   │   ├── Dashboard/
        │   │   ├── Courses/
        │   │   ├── CourseManager/
        │   │   ├── CoursePlans/
        │   │   ├── CourseVerifications/
        │   │   ├── CourseHistory/
        │   │   ├── SubmittedCourses/
        │   │   ├── SubmittedTasks/
        │   │   ├── AssignTask/
        │   │   ├── Users/
        │   │   ├── Login/
        │   │   ├── ForgotPassword/
        │   │   └── ResetPassword/
        │   └── (public components — Navbar, Footer, About, etc.)
        ├── config/
        │   └── apiConfig.js        # All API endpoint URLs in one place
        ├── pages/                  # Page-level components
        ├── App.jsx                 # Route definitions
        └── main.jsx                # React entry point
```

---

## Why This Structure

### Backend: MVC Pattern

The backend follows MVC (Model-View-Controller) — a standard pattern that separates concerns:

```
Request → Route → Controller → Model → Database
```

- Routes just map HTTP verbs + URLs to controller functions. No logic here.
- Controllers hold all the business logic — validation, DB queries, cache, response.
- Models define the data shape and talk to MongoDB.

This means if you need to change how users are fetched, you only touch `authController.js`. If you need to change the user schema, you only touch `User.js`. Nothing bleeds into each other.

### Frontend: Feature-Based Components

The admin panel components are grouped by feature (`Dashboard/`, `Courses/`, `Users/`, etc.) rather than by type (all CSS in one folder, all JSX in another). This scales better — when you work on CourseVerifications, everything you need is in one folder.

### `config/apiConfig.js`

All API URLs live in one file. If the backend URL changes (e.g. moving to production), you change one line (`VITE_API_BASE_URL`) and every endpoint updates automatically. No hunting through 20 components.

---

## Security Implementation

### 1. Authentication — JWT (JSON Web Tokens)

Two separate token types, two separate middleware functions:

```
Admin token  → role: "admin" → expires in 2h  → checked by authenticateAdmin
User token   → role: "user"  → expires in 24h → checked by authenticateUser
```

The middleware in `authMiddleware.js`:

```js
// Checks Bearer token in Authorization header
// Verifies signature against JWT_SECRET
// Distinguishes expired vs invalid tokens (different error messages)
// Attaches decoded payload to req.user or req.admin
```

If someone sends a user token to an admin route, they get `403 Forbidden` — not just `401`. The role check is explicit.

### 2. Route-Level Authorization

Every admin route is protected at the route definition level, not inside the controller:

```js
// auth.js routes
router.get('/users', authenticateAdmin, getAllUsers);         // ✅ protected
router.post('/user/create', authenticateAdmin, createUserManually); // ✅ protected
router.get('/user/:id', authenticateAdmin, getUserById);     // ✅ protected
router.put('/user/:id', authenticateAdmin, updateUser);      // ✅ protected
router.delete('/user/:id', authenticateAdmin, deleteUser);   // ✅ protected

// Public routes (no middleware)
router.post('/user/login', userLogin);    // intentionally open
router.post('/user/register', userRegister); // intentionally open
```

This is the right approach — protection is declared at the routing layer, so it's impossible to accidentally expose a protected endpoint by forgetting to check inside the controller.

### 3. Password Security — bcrypt

Passwords are never stored in plain text. The flow:

```
Register:  plaintext → bcrypt.hash(password, salt=10) → stored hash
Login:     plaintext → bcrypt.compare(password, storedHash) → true/false
```

Cost factor 10 means each hash takes ~100ms. That's intentional — it makes brute force attacks 100ms per attempt instead of microseconds.

Password is also explicitly excluded from every query that returns user data:

```js
User.find(query, { password: 0 })   // excluded in list queries
User.findById(id).select('-password') // excluded in single user queries
```

### 4. Password Reset — Secure Token Flow

The reset flow uses a separate short-lived JWT with a `type` claim:

```
1. User requests reset → JWT signed with { id, type: 'password_reset' } → expires 1h
2. Token stored in user.resetToken + user.resetTokenExpiry in DB
3. On reset: verify JWT signature → check type === 'password_reset' → check DB token matches → check expiry
4. After reset: token cleared from DB → can't be reused
```

Two layers of validation: JWT signature AND database match. Even if someone intercepts a valid JWT, it's invalidated after use.

Also: the forgot-password endpoint always returns the same message whether the email exists or not:

```js
// Don't reveal if email exists or not for security
return res.json({ success: true, message: "If the email exists, a reset link has been sent" });
```

This prevents user enumeration attacks — an attacker can't probe which emails are registered.

### 5. Rate Limiting — Three Tiers

Three rate limiters defined (currently disabled for load testing — re-enable before production):

| Limiter | Routes | Limit |
|---|---|---|
| `authLimiter` | login, register, password reset | 5 req / 15 min |
| `submissionLimiter` | form submissions | 30 req / 15 min |
| `generalLimiter` | all `/api/` routes | 100 req / 15 min |

The auth limiter is the most important — 5 attempts per 15 minutes makes brute force attacks practically impossible.

### 6. Input Validation

Validation happens in controllers before any DB operation:

- Required fields checked explicitly
- Email format validated with regex
- Password minimum length enforced (6 chars)
- Age minimum enforced at schema level (`min: 13`)
- ObjectId format validated before DB queries (`id.match(/^[0-9a-fA-F]{24}$/)`)
- All string inputs `.trim()`-ed and `.toLowerCase()`-ed before storage

### 7. Environment Variables — Secrets Never in Code

All sensitive values live in `.env`:

```
MONGODB_URI=...
JWT_SECRET=...
REDIS_HOST=...
REDIS_PASSWORD=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

The `.env` file is in `.gitignore` — it never gets committed to the repository.

### 8. MongoDB — Schema-Level Protection

The Mongoose schema enforces data integrity at the DB layer:

```js
email: { type: String, required: true, unique: true, trim: true }
age:   { type: Number, min: 13 }
```

`unique: true` on email and username means duplicate accounts are rejected at the database level, not just in application code. Even if validation logic has a bug, the DB won't allow duplicates.

### 9. Duplicate Check Before Write

Before creating a user, the controller explicitly checks for existing email/username:

```js
const existingUser = await User.findOne({
  $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
});
if (existingUser) return res.status(400).json({ message: "User already exists" });
```

This gives a clean error message instead of a raw MongoDB duplicate key error leaking to the client.

### 10. CORS

`cors()` middleware is applied globally. In production this should be configured to only allow your specific frontend domain:

```js
// Current (open — fine for development)
app.use(cors());

// Production recommendation
app.use(cors({ origin: 'https://yourdomain.com' }));
```

### 11. Response Compression

`compression()` middleware gzip-compresses all responses. This is a performance measure but also reduces the attack surface for response-based attacks by minimizing data in transit.

---

## What's Good vs What to Tighten Before Production

| Already done | Action needed before production |
|---|---|
| JWT auth with role separation | Re-enable rate limiters (currently commented out) |
| bcrypt password hashing | Restrict CORS to specific frontend domain |
| Password never returned in responses | Move reset link delivery to actual email (not console.log) |
| User enumeration protection | Add HTTPS enforcement |
| Input validation + trimming | Consider helmet.js for HTTP security headers |
| Secrets in .env | Set NODE_ENV=production |
| DB-level unique constraints | Consider refresh token rotation for longer sessions |
| Cache invalidation on writes | Add request logging (morgan) for audit trail |
| Graceful Redis fallback | |
| ObjectId format validation | |
