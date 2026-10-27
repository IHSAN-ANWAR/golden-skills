# 🚀 Production Deployment Guide - Golden Skills

Complete step-by-step guide to deploy Golden Skills on KVM2/Hostinger or any VPS.

---

## 📋 Pre-Deployment Checklist

### **Required:**
- [ ] VPS/Server access (SSH)
- [ ] Domain name
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] MongoDB database (Atlas or self-hosted)
- [ ] Strong JWT secret generated
- [ ] All sensitive data in .env
- [ ] Git repository access

---

## 🔧 Step 1: Server Setup

### **1.1 Initial Server Configuration**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### **1.2 Create Application User**

```bash
# Create user for app
sudo adduser goldenskills
sudo usermod -aG sudo goldenskills

# Switch to new user
su - goldenskills
```

---

## 📂 Step 2: Clone & Setup Application

### **2.1 Clone Repository**

```bash
cd /home/goldenskills
git clone https://github.com/yourusername/golden-skills.git
cd golden-skills
```

### **2.2 Backend Setup**

```bash
cd backend

# Install dependencies
npm install --production

# Create .env file
cp .env.example .env
nano .env
```

**Important `.env` settings:**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/golden-skills
JWT_SECRET=<GENERATE_64_CHAR_SECRET>
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=info
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to JWT_SECRET in .env
```

### **2.3 Frontend Setup**

```bash
cd ../Golden\ skills

# Install dependencies
npm install

# Create .env
nano .env
```

Add:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

**Build for production:**
```bash
npm run build
# Output: dist/ folder
```

---

## 🗄️ Step 3: Database Setup

### **Option A: MongoDB Atlas (Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist your server IP
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### **Option B: Self-Hosted MongoDB**

```bash
# Install MongoDB
sudo apt install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
> use golden-skills
> db.createUser({
  user: "goldenskills_user",
  pwd: "strong_password_here",
  roles: ["readWrite"]
})
```

Update `.env`:
```env
MONGODB_URI=mongodb://goldenskills_user:strong_password_here@localhost:27017/golden-skills
```

---

## 🔴 Step 4: Redis Setup (Optional but Recommended)

```bash
# Install Redis
sudo apt install -y redis-server

# Configure
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: bind 127.0.0.1

# Start service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test
redis-cli ping
# Should return: PONG
```

---

## 🚀 Step 5: PM2 Configuration

### **5.1 Create PM2 Config**

Create `backend/ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'golden-skills-api',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-err.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
```

### **5.2 Start Application**

```bash
cd /home/goldenskills/golden-skills/backend

# Start with PM2
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup systemd
# Run the command it outputs

# Check status
pm2 status
pm2 logs golden-skills-api --lines 50
```

---

## 🌐 Step 6: Nginx Configuration

### **6.1 Create Nginx Config**

```bash
sudo nano /etc/nginx/sites-available/goldenskills
```

Add:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Frontend - Serve React build
    location / {
        root /home/goldenskills/golden-skills/Golden\ skills/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Certificate files
    location /certificates {
        alias /home/goldenskills/golden-skills/backend/certificates;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

### **6.2 Enable Site**

```bash
# Enable configuration
sudo ln -s /etc/nginx/sites-available/goldenskills /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔒 Step 7: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Auto-renewal is setup automatically
```

---

## 🔥 Step 8: Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT!)
sudo ufw allow OpenSSH

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

## 📊 Step 9: Monitoring & Logging

### **9.1 Setup Log Rotation**

```bash
sudo nano /etc/logrotate.d/goldenskills
```

Add:
```
/home/goldenskills/golden-skills/backend/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 goldenskills goldenskills
    sharedscripts
}
```

### **9.2 PM2 Monitoring**

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Web dashboard (optional)
pm2 web
```

---

## 🔧 Step 10: Post-Deployment

### **10.1 Test Everything**

```bash
# Test backend
curl https://api.yourdomain.com/api/health

# Test frontend
curl https://yourdomain.com

# Check SSL
curl -I https://yourdomain.com

# Test API endpoints
curl -X POST https://api.yourdomain.com/api/team/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"03001234567"}'
```

### **10.2 Create Admin Account**

```bash
cd /home/goldenskills/golden-skills/backend
node
```

In Node REPL:
```javascript
// Connect to MongoDB and create admin
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.js').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = await User.create({
    username: 'admin',
    email: 'admin@goldenskills.com',
    password: 'YourStrongPassword123!',
    phoneNumber: '03001234567',
    isAdmin: true
  });
  console.log('Admin created:', admin.email);
  process.exit(0);
});
```

---

## 📱 Step 11: Testing Checklist

- [ ] Website loads (https://yourdomain.com)
- [ ] API health check works
- [ ] Login works (admin panel)
- [ ] User registration works
- [ ] Team verification works
- [ ] Fraud report submission works
- [ ] SSL certificate valid
- [ ] Rate limiting works
- [ ] Logs are being written
- [ ] PM2 auto-restart works (test: `pm2 restart all`)
- [ ] MongoDB connection stable
- [ ] Redis connection works
- [ ] WhatsApp widget shows on frontend
- [ ] Social links in footer work

---

## 🔄 Updating Application

```bash
# Pull latest code
cd /home/goldenskills/golden-skills
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart golden-skills-api

# Update frontend
cd ../Golden\ skills
npm install
npm run build
sudo systemctl reload nginx
```

---

## 🆘 Troubleshooting

### **Backend not starting**
```bash
# Check logs
pm2 logs golden-skills-api --lines 100

# Check .env file
cat backend/.env

# Test MongoDB connection
mongosh "mongodb+srv://..."
```

### **Frontend shows 404**
```bash
# Check Nginx config
sudo nginx -t

# Check build directory
ls -la /home/goldenskills/golden-skills/Golden\ skills/dist

# Reload Nginx
sudo systemctl reload nginx
```

### **API CORS errors**
```bash
# Check FRONTEND_URL in backend/.env
# Should match your domain exactly
```

### **Rate limit not working**
```bash
# Test with curl
for i in {1..10}; do
  curl https://api.yourdomain.com/api/auth/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}'
done
```

---

## 📞 Support

If you face issues during deployment:
- Check application logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check system logs: `sudo journalctl -u nginx -f`

---

**🎉 Congratulations! Your Golden Skills application is now live in production!**
