import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const loginDuration = new Trend('login_duration');
const coursesDuration = new Trend('courses_duration');
const plansDuration = new Trend('plans_duration');

const BASE_URL = 'http://localhost:5000';

// Admin creds — uses /api/auth/login so token has role:admin for /api/plans
const ADMIN_CREDS = {
  username: 'admin',
  password: 'SecureAdminPass123!',
};

// ─── 1400 users within 20s ───────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '8s',  target: 1400 },  // ramp to 1400
    { duration: '8s',  target: 1400 },  // hold at 1400
    { duration: '4s',  target: 0    },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    error_rate:        ['rate<0.10'],
  },
  // print live summary every 5s for instant feedback
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// ─── SETUP: login once, share token ──────────────────────────────────────────
export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(ADMIN_CREDS),
    { headers: { 'Content-Type': 'application/json' } }
  );

  loginDuration.add(res.timings.duration);

  if (res.status !== 200) {
    console.error(`Login failed: ${res.status} — ${res.body}`);
    return { token: null };
  }

  let token = null;
  try { token = JSON.parse(res.body).token; } catch (e) {}

  console.log(token ? '✅ Token acquired' : '❌ No token in response');
  return { token };
}

// ─── VIRTUAL USER FLOW ────────────────────────────────────────────────────────
export default function (data) {
  const { token } = data;

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  // 1. GET /api/courses
  const coursesRes = http.get(`${BASE_URL}/api/courses`, authHeaders);
  coursesDuration.add(coursesRes.timings.duration);
  check(coursesRes, {
    '[courses] status 200': (r) => r.status === 200,
    '[courses] under 2s':   (r) => r.timings.duration < 2000,
  });
  errorRate.add(coursesRes.status !== 200);

  sleep(0.3);

  // 2. GET /api/plans
  const plansRes = http.get(`${BASE_URL}/api/plans`, authHeaders);
  plansDuration.add(plansRes.timings.duration);
  check(plansRes, {
    '[plans] status 200': (r) => r.status === 200,
    '[plans] under 2s':   (r) => r.timings.duration < 2000,
  });
  errorRate.add(plansRes.status !== 200);

  sleep(0.3);
}
