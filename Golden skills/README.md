# 🎨 Golden Skills — Frontend

React + Vite se bana frontend. Public website + Admin Panel dono isi mein hain.

---

## ⚡ Quick Start

```bash
cd "Golden skills"
npm install
npm run dev
```

Opens at: `http://localhost:5173`

Backend bhi chalna chahiye: `http://localhost:5000`

---

## 🔗 Backend Connection

`src/config/apiConfig.js` mein base URL set hota hai:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

**Development:** Automatically `localhost:5000` use karta hai — koi `.env` file nahi chahiye.

**Production build ke liye** `.env` file banao:
```env
VITE_API_BASE_URL=https://goldenskills.online
```

> ⚠️ `.env` change karne ke baad `npm run build` dobara run karo.

---

## 📁 Project Structure

```
Golden skills/
├── public/
│   └── goldenskills.apk        # Android app download
├── src/
│   ├── config/
│   │   └── apiConfig.js        # ← Saari API URLs yahan hain
│   ├── pages/                  # Public pages
│   │   ├── Home.jsx
│   │   ├── BankDetails.jsx     # Payment account details
│   │   ├── UserTaskSubmission.jsx   # /submit-task
│   │   ├── UserTaskData.jsx    # /my-tasks
│   │   ├── UserCourseData.jsx  # /my-courses
│   │   ├── TeamVerification.jsx  # /verify-team
│   │   ├── UserPromotion.jsx   # Promotion apply
│   │   └── ReportFraud.jsx     # /report-fraud
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx          # NTN number dynamically fetch hota hai
│   │   ├── AlertBanner.jsx     # Top banner (public pages)
│   │   ├── About.jsx
│   │   ├── CoursesSection.jsx
│   │   ├── Tasks.jsx           # Public tasks list
│   │   ├── Contact.jsx
│   │   ├── WhatsAppWidget/     # Floating WhatsApp button
│   │   └── Admin Panel/        # ← Admin dashboard components
│   │       ├── Login/
│   │       ├── Dashboard/
│   │       ├── Users/
│   │       ├── TasksManager/
│   │       ├── Courses/
│   │       ├── PromotionsManager/
│   │       ├── AccountDetails/
│   │       ├── ReferralSystem/
│   │       ├── TeamManagement/
│   │       ├── FraudReports/
│   │       ├── SiteSettings/   # WhatsApp + Social Links + NTN Number
│   │       ├── SearchTracking/
│   │       ├── AdminLayout.jsx
│   │       └── AdminSidebar.jsx
│   └── App.jsx                 # All routes yahan hain
```

---

## 🌐 Routes

### Public Routes

| URL | Component | Description |
|-----|-----------|-------------|
| `/` | `Home.jsx` | Landing page |
| `/about` | `About.jsx` | About section |
| `/courses` | `CoursesSection.jsx` | Courses list |
| `/tasks` | `Tasks.jsx` | Public tasks |
| `/contact` | `Contact.jsx` | Contact form |
| `/submit-task` | `UserTaskSubmission.jsx` | Task submit form |
| `/my-tasks` | `UserTaskData.jsx` | User tasks history |
| `/my-courses` | `UserCourseData.jsx` | User course status |
| `/verify-team` | `TeamVerification.jsx` | Team member verify |
| `/report-fraud` | `ReportFraud.jsx` | Fraud report form |

### Admin Routes

| URL | Component | Description |
|-----|-----------|-------------|
| `/login` | `Login.jsx` | Admin login |
| `/admin/dashboard` | `Dashboard.jsx` | Stats overview |
| `/admin/users` | `Users.jsx` | User management |
| `/admin/tasks` | `TasksManager.jsx` | Task create/assign |
| `/admin/courses` | `Courses.jsx` | Course management |
| `/admin/promotions` | `PromotionsManager.jsx` | Promotions |
| `/admin/account-details` | `AccountDetails.jsx` | Payment accounts |
| `/admin/referrals` | `ReferralSystem.jsx` | Referral tree |
| `/admin/team-management` | `TeamManagement.jsx` | Team + blacklist |
| `/admin/fraud-reports` | `FraudReports.jsx` | Fraud reports |
| `/admin/site-settings` | `SiteSettings.jsx` | WhatsApp, Social, NTN |
| `/admin/search-tracking` | `SearchTracking.jsx` | Search logs |

---

## 🔑 Admin Login

```
URL:      http://localhost:5173/login
Username: admin
Password: (backend .env mein ADMIN_PASSWORD dekho)
```

Admin login database se nahi hota — sirf backend `.env` credentials se match karta hai.

---

## 🆕 Recent Changes

### NTN Number (Footer)
- Footer mein NTN number ab `GET /api/settings/ntn` se fetch hota hai
- Hardcoded `[NTN-Number]` hata diya
- Admin → Site Settings → FBR NTN Number section se update karo

### Admin Login UX
- Browser `alert()` remove — errors ab form mein dikhte hain
- Login successful hone pe seedha `/admin/dashboard` redirect

### CORS Fix
- Development (`localhost:5173`) aur production (`goldenskills.online`) dono work karte hain

---

## 🛠️ Build & Deploy

```bash
# Production build
npm run build
# Output: dist/ folder

# Server pe upload (PowerShell)
scp -r "dist/." root@<SERVER_IP>:/var/www/golden-skills-main/frontend/dist/

# Server pe permissions fix (SSH mein)
chmod -R 755 /var/www/golden-skills-main/frontend/dist
chown -R www-data:www-data /var/www/golden-skills-main/frontend/dist
sudo systemctl reload nginx
```

---

## 📦 Tech Stack

| Tool | Version | Use |
|------|---------|-----|
| React | 18+ | UI library |
| Vite | 7+ | Build tool |
| React Router | v6 | Routing |
| Axios | latest | API calls |
| Bootstrap | 5 | Admin panel styling |
| React Icons | latest | Icons |

---

## ⚠️ Common Issues

**Backend connect nahi ho raha:**
- Backend chal raha hai? `npm start` backend folder mein
- `apiConfig.js` mein `API_BASE_URL` check karo

**Build ke baad changes nahi dikh rahe:**
- Browser hard refresh: `Ctrl + Shift + R`
- Server pe `chmod` aur `chown` commands run karo (upar deploy section mein hai)

**Admin login fail:**
- Backend connected hai? `http://localhost:5000/api/health` check karo
- Username: `admin`, Password: backend `.env` mein dekho

---

*Last updated: October 2026*
