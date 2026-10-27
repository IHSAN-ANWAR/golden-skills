# 🔧 Environment Configuration Guide

## 📦 What's Configured

### ✅ Frontend Environment Files Created
- `.env` - Development (uses localhost:5000)
- `.env.production` - Production (uses goldenskills.online)
- `.env.example` - Template file

### ✅ Backend Environment Files Updated
- `.env` - Production-ready configuration with goldenskills.online
- `.env.example` - Updated template with clear instructions

---

## 🚀 Quick Setup

### **Backend Setup**

Your backend `.env` is already configured with:
- ✅ Production JWT Secret (128 characters)
- ✅ MongoDB Atlas connection (your existing database)
- ✅ Domain set to `goldenskills.online`
- ✅ Security configurations

**⚠️ ACTION REQUIRED:** Update these two values in `backend/.env`:
```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication (if not enabled)
3. Create new App Password → Select "Mail" → Copy 16-character password
4. Paste in `EMAIL_PASS` (remove spaces)

---

### **Frontend Setup**

Your frontend has 3 environment files:

**1. Development (`.env`)** - Already set up
```env
VITE_API_BASE_URL=http://localhost:5000
```
Use this when running: `npm run dev`

**2. Production (`.env.production`)** - Already set up
```env
VITE_API_BASE_URL=https://goldenskills.online
```
Use this when building: `npm run build`

**3. Example (`.env.example`)** - Template for team members

---

## 🏗️ Development Workflow

### **Running Locally (Development)**

```bash
# Backend
cd backend
npm install
npm start
# Backend runs on: http://localhost:5000

# Frontend (new terminal)
cd "Golden skills"
npm install
npm run dev
# Frontend runs on: http://localhost:5173
```

The frontend `.env` will automatically use `http://localhost:5000` ✅

---

## 🚀 Production Deployment

### **Step 1: Build Frontend**
```bash
cd "Golden skills"
npm run build
# This automatically uses .env.production (goldenskills.online)
```

### **Step 2: Upload to Server**
```bash
# Upload backend folder
# Upload Golden skills/dist folder (built frontend)
```

### **Step 3: Server Configuration**

**Backend (runs on port 5000):**
```bash
cd backend
npm install --production
npm start
# Or use PM2:
pm2 start npm --name "golden-skills-backend" -- start
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name goldenskills.online www.goldenskills.online;

    # Frontend (React build)
    location / {
        root /path/to/Golden skills/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL Certificate (HTTPS):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d goldenskills.online -d www.goldenskills.online
```

---

## 🔍 Environment Variables Reference

### **Backend (.env)**
| Variable | Purpose | Example |
|----------|---------|---------|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | Database connection | Already configured ✅ |
| `JWT_SECRET` | JWT token signing | Already configured ✅ |
| `FRONTEND_URL` | CORS whitelist | `https://goldenskills.online` ✅ |
| `EMAIL_USER` | Gmail for OTP | **⚠️ UPDATE THIS** |
| `EMAIL_PASS` | Gmail app password | **⚠️ UPDATE THIS** |
| `ADMIN_USERNAME` | Admin login username | `admin` ✅ |
| `ADMIN_PASSWORD` | Admin login password | `<YOUR_ADMIN_PASSWORD>` |

### **Frontend (.env)**
| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API URL | Development: `http://localhost:5000`<br>Production: `https://goldenskills.online` |

---

## ✅ Pre-Deployment Checklist

- [x] Backend `.env` configured with production values
- [x] Frontend `.env.production` set to goldenskills.online
- [x] JWT Secret is 128 characters (secure)
- [x] MongoDB connection string is correct
- [ ] **Update EMAIL_USER and EMAIL_PASS** ⚠️
- [ ] Test backend locally: `cd backend && npm start`
- [ ] Test frontend locally: `cd "Golden skills" && npm run dev`
- [ ] Build frontend: `npm run build`
- [ ] Upload to server
- [ ] Configure Nginx
- [ ] Set up SSL certificate
- [ ] Test production site

---

## 🆘 Troubleshooting

### **"API calls failing in production"**
✅ Check that backend is running on port 5000
✅ Check Nginx proxy_pass configuration
✅ Check CORS: `FRONTEND_URL=https://goldenskills.online`

### **"Email OTP not sending"**
✅ Update `EMAIL_USER` and `EMAIL_PASS` in backend/.env
✅ Generate Gmail App Password (not regular password)
✅ Enable 2FA on Gmail account first

### **"JWT token invalid"**
✅ Make sure JWT_SECRET is the same on server
✅ Check if environment variables loaded: `console.log(process.env.JWT_SECRET)`

### **"CORS errors in browser"**
✅ Backend `.env`: `FRONTEND_URL=https://goldenskills.online`
✅ No trailing slash in URL
✅ Restart backend after changing .env

---

## 📞 Need Help?

Your environment files are now production-ready! 🎉

**Next steps:**
1. Update EMAIL_USER and EMAIL_PASS in `backend/.env`
2. Test locally
3. Build frontend: `npm run build`
4. Deploy to server following DEPLOYMENT_GUIDE.md

**Domain Configuration:**
- Frontend: `https://goldenskills.online`
- Backend API: `https://goldenskills.online/api/*`
- Both served from same domain (no CORS issues!)
