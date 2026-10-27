# 💾 MongoDB Data Backup & Migration Guide

## 🎯 Your Situation
- KVM1: Expired (had Golden Skills running)
- KVM2: New server (want to migrate data)
- Database: MongoDB Atlas (cloud-hosted) ✅

**Good News:** Your data is already in the cloud, not on KVM1!

---

## ✅ **Option 1: Use Same Database (Easiest)**

### **No Migration Needed!**

Your database is on MongoDB Atlas, not on KVM1 server. Just connect KVM2 to the same database:

**On KVM2 `backend/.env`:**
```env
MONGODB_URI=mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.su0j5un.mongodb.net/GoldenSkill
```

✅ All your data is immediately available
✅ Users, courses, tasks - everything intact
✅ Zero downtime, zero migration

---

## 🔄 **Option 2: Copy Database (Safer Testing)**

If you want to test without affecting live data:

### **Method A: Using MongoDB Compass (GUI - Easiest)**

**Step 1: Download MongoDB Compass**
- Download: https://www.mongodb.com/try/download/compass
- Install and open

**Step 2: Connect to Your Database**
```
Connection String: mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.su0j5un.mongodb.net/GoldenSkill
```

**Step 3: Export Each Collection**
1. Select `GoldenSkill` database
2. For each collection (users, courses, tasks, etc.):
   - Click collection name
   - Click "Export Collection"
   - Choose JSON format
   - Save to folder: `Golden-Skills-Backup/`

**Step 4: Create New Database**
1. In MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Create database: `GoldenSkill-Testing`

**Step 5: Import to New Database**
1. Connect Compass to new database
2. For each collection:
   - Create collection
   - Click "Add Data" → "Import File"
   - Select exported JSON
   - Import

---

### **Method B: Using Command Line (Faster)**

**Step 1: Install MongoDB Database Tools**

**Windows:**
```powershell
# Download from: https://www.mongodb.com/try/download/database-tools
# Extract and add to PATH
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-database-tools

# Mac
brew install mongodb-database-tools
```

**Step 2: Backup Database**
```bash
# Export entire database
mongodump --uri="mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.su0j5un.mongodb.net/GoldenSkill" --out="./golden-skills-backup"

# This creates folder structure:
# golden-skills-backup/
#   GoldenSkill/
#     users.bson
#     courses.bson
#     tasks.bson
#     ...
```

**Step 3: Restore to New Database**
```bash
# Create new database and restore
mongorestore --uri="mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.su0j5un.mongodb.net/GoldenSkill-Testing" ./golden-skills-backup/GoldenSkill
```

**Step 4: Update KVM2 .env**
```env
MONGODB_URI=mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.su0j5un.mongodb.net/GoldenSkill-Testing
```

---

## 📦 **What Data Will Be Migrated:**

Your Golden Skills database contains:

### **Collections to Backup:**
- ✅ `users` - All registered users
- ✅ `courses` - All courses
- ✅ `tasks` - All tasks
- ✅ `usertasks` - User task assignments
- ✅ `plans` - Subscription plans
- ✅ `courseplans` - Course plans
- ✅ `userplansubmissions` - Plan purchases
- ✅ `usercourseplanssubmissions` - Course enrollments
- ✅ `promotions` - Promotions
- ✅ `userpromotions` - User promotion participation
- ✅ `accountdetails` - Payment account details
- ✅ `searchtracking` - Team verification searches
- ✅ `blacklist` - Blacklisted numbers
- ✅ `fraudreports` - Fraud reports
- ✅ `sitesettings` - Site configuration

---

## 🚀 **Recommended Workflow:**

### **Scenario 1: KVM1 Still Accessible**
```bash
# 1. SSH into KVM1
ssh user@kvm1-ip

# 2. Backup database (already on Atlas, but good practice)
mongodump --uri="mongodb+srv://..." --out="./backup"

# 3. Download backup to local machine
scp -r user@kvm1-ip:~/backup ./golden-skills-backup

# 4. KVM1 can expire now - data is safe!
```

### **Scenario 2: KVM1 Already Expired** ✅
**No problem!** Your data is on MongoDB Atlas:

```bash
# On your local machine or KVM2:
mongodump --uri="mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.su0j5un.mongodb.net/GoldenSkill" --out="./backup"

# Data backed up from cloud directly
```

---

## 🔒 **Important: MongoDB Atlas Access**

### **Check Your Atlas Access:**
1. Login to MongoDB Atlas: https://cloud.mongodb.com
2. Go to "Database Access" → Verify user: `tik031248_db_user`
3. Go to "Network Access" → Add KVM2 IP address

### **If KVM2 IP is Different:**
```bash
# Find KVM2 public IP
curl ifconfig.me

# Add this IP to MongoDB Atlas:
# Dashboard → Network Access → Add IP Address
```

---

## 🎯 **Final Recommendation:**

### **For Testing on KVM2:**
**Just use the same connection string!**

```env
# KVM2 backend/.env
MONGODB_URI=mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.su0j5un.mongodb.net/GoldenSkill
```

✅ Your data is already safe in MongoDB Atlas
✅ KVM1 expiring doesn't affect your database
✅ KVM2 can connect to same database immediately
✅ No migration needed!

### **For Production (Later):**
Create separate databases:
- `GoldenSkill-Production` - Live site
- `GoldenSkill-Staging` - Testing
- `GoldenSkill-Development` - Development

---

## 📞 **Troubleshooting:**

### **"Can't connect to MongoDB from KVM2"**
✅ Add KVM2 IP to Atlas Network Access
✅ Check connection string is correct
✅ Test connection: `mongosh "your-connection-string"`

### **"Lost access to MongoDB Atlas account"**
⚠️ **CRITICAL:** Backup database NOW if you have access
⚠️ Check email for MongoDB Atlas credentials
⚠️ Use password reset if needed

### **"Want to download all data as JSON"**
```bash
# Export each collection
mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json
mongoexport --uri="mongodb+srv://..." --collection=courses --out=courses.json
# ... repeat for all collections
```

---

## ✅ **Summary:**

**Your situation:**
- KVM1: Expired ❌
- MongoDB: On Atlas Cloud ✅
- Data: **SAFE** ✅

**Action:**
1. Connect KVM2 to same MongoDB Atlas database
2. All data immediately available
3. No migration needed!

**Optional (for safety):**
```bash
# Make a backup anyway
mongodump --uri="mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.su0j5un.mongodb.net/GoldenSkill" --out="./backup-$(date +%Y%m%d)"
```

Your data is safe! 🎉
