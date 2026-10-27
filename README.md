# 🎓 Golden Skills — Learning Management System

A full-stack learning management platform with course management, task assignments, team verification, fraud detection, promotion system with rank badges, and a complete admin dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Deployment](#-deployment)
- [Mobile App](#-mobile-app)

---

## ✨ Features

### **For Users**
- 🎓 Course enrollment and management
- 📝 Task submissions and tracking
- 🏆 Promotion system with rewards
- 🏅 Rank / Badge system (Gold, Silver, Diamond, Platinum, etc.)
- 👥 Referral program with automatic progress tracking
- ✅ Team member verification (fraud prevention)
- 📜 Manual certificate upload by admin (PDF)
- 📱 Mobile app download (APK)
- 📊 Personal dashboard

### **For Admins**
- 👨‍💼 Complete user management
- 📚 Course and task creation with optional YouTube tutorial links
- 📤 Send task to one user OR all approved users at once (bulk send)
- ✅ Submission approval workflow
- 🏅 Rank assignment after promotion reward approval
- 📋 Plan management with tutorial video URLs
- 🔍 Search tracking & suspicious activity detection (dual condition)
- 🚨 Fraud report management
- 👥 Team management & blacklist
- 📊 Analytics dashboard
- ⚙️ Site settings (WhatsApp widget, social links, **NTN number**)
- 📜 Manual certificate PDF upload per user
- 🏛️ **FBR NTN number management** — update NTN number from admin dashboard, shows live in footer

---

## 🛠 Tech Stack

### **Frontend**
- **React 18** — UI library
- **React Router v6** — Client-side routing
- **React Icons** — Icon library
- **Vite** — Build tool & dev server
- **CSS3** — Styling (no UI framework)

### **Backend**
- **Node.js v22** — Runtime environment
- **Express.js** — Web framework
- **MongoDB 8** — Database (local, no Atlas)
- **Mongoose** — ODM
- **Redis** — Caching (optional)
- **JWT** — Authentication
- **Multer** — File uploads (certificate PDFs)
- **Winston** — Logging
- **Joi** — Input validation
- **Helmet** — Security headers
- **Express Rate Limit** — DDoS protection

### **Infrastructure**
- **PM2** — Process management (cluster mode)
- **Nginx** — Reverse proxy + static file serving
- **Let's Encrypt** — SSL certificates
- **UFW** — Firewall

---

## 📦 Prerequisites

- **Node.js** v22+ — [Download](https://nodejs.org/)
- **MongoDB** v8 (local install recommended) — [Download](https://www.mongodb.com/try/download/community)
- **Redis** (optional, for caching) — [Download](https://redis.io/download)
- **Git** — [Download](https://git-scm.com/)

---

## 🚀 Installation

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/golden-skills.git
cd golden-skills
```

### **2. Backend Setup**
```bash
cd backend
npm install
```

### **3. Frontend Setup**
```bash
cd "../Golden skills"
npm install
```

---

## ⚙️ Configuration


### **Frontend `.env.production`**

```env
VITE_API_BASE_URL=https://goldenskills.online
```

---

## 🏃 Running the Application

### **Development**

```bash
# Backend
cd backend
npm run dev   # runs on http://localhost:5000

# Frontend
cd "Golden skills"
npm run dev   # runs on http://localhost:5173
```

### **Production (PM2 + Nginx)**

```bash
# Backend
cd backend
npm install --production
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup

# Frontend
cd "Golden skills"
npm run build
# Output: dist/ — serve via Nginx
```

---

## 📁 Project Structure

```
golden-skills/
├── backend/
│   ├── certificates/         # Uploaded certificate PDFs
│   ├── config/               # Redis config
│   ├── controllers/          # Route handlers
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── planController.js
│   │   ├── userTaskController.js          # includes assignTaskToAll
│   │   ├── userPromotionController.js     # includes assignRank
│   │   ├── userCourseCompletionController.js  # manual cert upload
│   │   └── ...
│   ├── middleware/            # Auth, rate limiter
│   ├── models/
│   │   ├── User.js            # includes rank/badge fields
│   │   ├── Task.js            # includes tutorialVideoUrl
│   │   ├── Plan.js            # includes tutorialVideoUrl
│   │   ├── UserTask.js
│   │   ├── UserPromotion.js
│   │   └── ...
│   ├── routes/
│   ├── utils/
│   │   ├── logger.js
│   │   └── certificateGenerator.js
│   ├── validators/
│   ├── logs/
│   ├── server.js
│   ├── ecosystem.config.cjs
│   └── package.json
│
├── Golden skills/             # Frontend (React + Vite)
│   ├── public/
│   │   └── goldenskills.apk   # Mobile app APK
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin Panel/
│   │   │   │   ├── AssignTask/       # Send to one / Send to All
│   │   │   │   ├── Tasks/            # PlansModal with video URL
│   │   │   │   ├── SubmittedPromotions/  # Rank modal
│   │   │   │   ├── CourseCompletions/    # Certificate upload
│   │   │   │   └── ...
│   │   │   ├── Navbar.jsx        # Download App button → APK
│   │   │   ├── Footer.jsx        # App Store / Google Play → APK
│   │   │   └── WhatsAppWidget/
│   │   ├── pages/
│   │   │   ├── UserTaskSubmission.jsx  # Plan cards with tutorial video
│   │   │   └── ...
│   │   ├── config/
│   │   │   └── apiConfig.js
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

## 📡 API Documentation

### **Base URL**
```
Production: https://goldenskills.online/api
```

### **Authentication**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Admin login | No |
| POST | `/auth/user/login` | User login | No |
| POST | `/auth/user/register` | User registration | No |
| GET | `/auth/users` | Get all users | Admin |

### **Tasks**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/user-tasks/assign` | Assign task to one user | Admin |
| POST | `/user-tasks/assign-all` | **Bulk: send task to ALL approved users** | Admin |
| GET | `/user-tasks/my-tasks` | Get my tasks | User JWT |
| POST | `/user-tasks/:id/submit` | Submit task | User JWT |
| POST | `/user-tasks/:id/sync-referral-progress` | Sync referral count | User JWT |

### **Plans**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/plans` | Get all active plans | No |
| POST | `/plans` | Create plan (with optional tutorialVideoUrl) | Admin |
| PUT | `/plans/:id` | Update plan | Admin |
| DELETE | `/plans/:id` | Delete plan | Admin |

### **Promotions**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/user-promotions/submit` | Submit promotion application | No |
| GET | `/user-promotions` | Get all promotions | Admin |
| PUT | `/user-promotions/:id/payment` | Approve/reject payment | Admin |
| POST | `/user-promotions/:id/tasks` | Assign tasks | Admin |
| PUT | `/user-promotions/:id/reward` | Approve reward | Admin |
| POST | `/user-promotions/:id/rank` | **Assign rank/badge to user** | Admin |

### **Course Completions**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/user-course-completions/submit` | Mark course complete | No |
| PUT | `/user-course-completions/:id/status` | **Approve + upload certificate PDF** | Admin + Multer |

### **Team Verification**
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/team/verify` | Verify team member | Tracked |
| POST | `/team/blacklist/add` | Add to blacklist | Admin |
| GET | `/team/search-tracking` | View suspicious searches | Admin |

### **Settings**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/settings/whatsapp` | Get WhatsApp settings | No |
| PUT | `/settings/whatsapp` | Update WhatsApp settings | Admin |
| GET | `/settings/social-links` | Get social media links | No |
| PUT | `/settings/social-links` | Update social media links | Admin |
| GET | `/settings/ntn` | Get FBR NTN number | No |
| PUT | `/settings/ntn` | Update FBR NTN number | Admin |

### **Fraud Reports**
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/fraud/report` | Submit fraud report | 7/hour |
| GET | `/fraud/reports` | Get all reports | Admin |

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| Authentication | JWT tokens |
| Rate Limiting | express-rate-limit |
| Input Validation | Joi schemas |
| Security Headers | Helmet.js |
| CORS | Configured for goldenskills.online only |
| XSS Prevention | HTML sanitization in admin views |
| File Uploads | Multer with PDF-only filter, 5MB limit |
| Logging | Winston (combined + error logs) |

### **Rate Limits**
| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 200 requests | 1 min |
| Auth | 20 attempts | 1 min |
| Fraud Reports | 7 submissions | 1 hour |
| Admin | 200 requests | 15 min |

---

## 🚢 Deployment

### **Server: KVM2 Hostinger VPS**
- **IP:** `<SERVER_IP>`
- **Domain:** goldenskills.online
- **OS:** Ubuntu 24.04.5 LTS
- **Node.js:** v22.23.3
- **MongoDB:** 8.0.32 (local, no Atlas)


### **Nginx Config**
```nginx
server {
    listen 80;
    server_name goldenskills.online www.goldenskills.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name goldenskills.online www.goldenskills.online;

    root /var/www/golden-skills-main/frontend/dist;
    index index.html;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /certificates/ {
        alias /var/www/golden-skills-main/backend/certificates/;
        autoindex off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### **SSL**
```bash
certbot --nginx -d goldenskills.online -d www.goldenskills.online \
  --email your@email.com --agree-tos --non-interactive
```

---

## 📱 Mobile App

The Golden Skills Android app (APK) is hosted directly on the website.

- **Download URL:** `https://goldenskills.online/goldenskills.apk`
- **Location on server:** `/var/www/golden-skills-main/frontend/dist/goldenskills.apk`
- **Download buttons:** Navbar "Download App" + Footer App Store / Google Play buttons

To update the APK:
```bash
scp new-version.apk root@<SERVER_IP>:/var/www/golden-skills-main/frontend/dist/goldenskills.apk
```

---

## 🏅 Rank / Badge System

Admin assigns a custom rank to a user after approving their promotion reward.

**Flow:**
1. User completes all promotion tasks
2. Admin approves reward payment → rank modal opens automatically
3. Admin types any rank name (Gold, Silver, Platinum, Diamond, etc.)
4. Admin sets start date + optional expiry date (or permanent)
5. Rank is saved to `User.rank` field
6. Mobile app reads rank via `GET /api/auth/user/:id` and shows badge on profile

**User model rank fields:**
```js
rank: String           // "Gold", "Platinum", etc.
rankAssignedAt: Date   // when assigned
rankExpiresAt: Date    // expiry (null = permanent)
rankAssignedBy: String // always "admin"
```

---

## 📊 Monitoring

```bash
# PM2 status
pm2 status
pm2 logs golden-skills-api

# App logs
tail -f /var/www/golden-skills-main/backend/logs/combined.log
tail -f /var/www/golden-skills-main/backend/logs/error.log

# Nginx
systemctl status nginx
tail -f /var/log/nginx/error.log

# MongoDB
systemctl status mongod
```

---

## ✅ Production Checklist

- [x] Node.js v22 installed
- [x] MongoDB 8 local install with authentication
- [x] PM2 cluster mode (auto-restart + startup)
- [x] Nginx reverse proxy configured
- [x] SSL certificate (Let's Encrypt, auto-renewal)
- [x] UFW firewall (Nginx Full + OpenSSH)
- [x] Environment variables configured
- [x] Redis optional caching
- [x] Winston logging
- [x] Rate limiting active
- [x] XSS sanitization in admin views
- [x] Multer file upload (PDFs only, 5MB limit)
- [x] APK hosted at /goldenskills.apk

---

## 🆕 Changelog

### **Latest Updates**
- ✅ **FBR NTN Number Feature** — Admin can now manage NTN number from Site Settings in the admin dashboard sidebar. NTN number is fetched dynamically and displayed in the footer's FBR Registered Company badge instead of being hardcoded.
- ✅ **CORS Fix** — Both `localhost:5173` (development) and `goldenskills.online` (production) are now allowed.
- ✅ **Admin Login UX** — Removed browser `alert()` popups; errors now shown inline in the login form.
- ✅ **Rate Limiter Relaxed** — Auth rate limit changed from 5 attempts/15min to 20 attempts/1min for better usability.
- ✅ **Email Updated** — OTP and notification emails updated (configured via `.env`).
- ✅ **MongoDB Atlas Support** — Application now supports both local MongoDB and Atlas cloud connection.

---

**Built with ❤️ **
