# 🔒 Security Policy - Golden Skills

This document outlines the security measures implemented in the Golden Skills application and best practices for maintaining security.

---

## 📋 Security Measures Implemented

### ✅ **1. Authentication & Authorization**
- JWT-based authentication with secure token generation
- Password hashing using bcrypt (10 rounds)
- Role-based access control (Admin/User)
- Session management with Redis
- Token expiration (7 days default)

### ✅ **2. Rate Limiting**
| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| General API | 100 requests | 15 min | DDoS prevention |
| Authentication | 5 attempts | 15 min | Brute force protection |
| Fraud Reports | 7 submissions | 1 hour | Spam prevention |
| Admin Operations | 200 requests | 15 min | Higher limit for admins |

### ✅ **3. Input Validation**
- **Joi** schema validation on all inputs
- Phone number format validation (10-15 digits)
- Email format validation
- String length limits (prevents buffer overflow)
- SQL/NoSQL injection prevention via Mongoose ODM

### ✅ **4. Security Headers (Helmet.js)**
```javascript
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: (configured)
```

### ✅ **5. CORS Configuration**
- Whitelist-based origin validation
- Credentials support enabled
- Specific methods allowed: GET, POST, PUT, DELETE, PATCH
- Allowed headers: Content-Type, Authorization

### ✅ **6. Error Handling**
- Centralized error handler
- Sensitive data not exposed in production errors
- Comprehensive logging with Winston
- Stack traces only in development

### ✅ **7. Data Protection**
- Environment variables for sensitive data
- .env files excluded from version control
- Secure JWT secret (64+ character requirement)
- MongoDB connection with authentication

### ✅ **8. Logging & Monitoring**
- Winston logger for all operations
- Separate error and combined logs
- Log rotation (14 days retention)
- PM2 process monitoring
- Suspicious activity tracking in database

---

## 🚨 Known Security Considerations

### **Fraud Detection System**
- **Search Tracking**: All team verification searches are logged with IP and timestamp
- **Suspicious Pattern Detection**: 
  - Total 3+ searches for same number (any IPs) = Suspicious
  - Same IP searches same number 3+ times = Suspicious
- **No Rate Limit on Verification**: Intentional design to allow legitimate public verification

### **Team Verification**
- Public endpoint (no authentication required)
- Designed for fraud prevention
- Database-level tracking instead of rate limiting
- Admin can review all suspicious searches

---

## 🔐 Best Practices for Deployment

### **1. Environment Variables**
```bash
# NEVER commit .env files
# Always use .env.example as template
# Use strong JWT secrets (64+ characters)

# Generate strong secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **2. Database Security**
```bash
# Use MongoDB authentication
# Enable IP whitelist
# Use SSL/TLS connections
# Regular backups
# Restrict user permissions
```

### **3. SSL/TLS**
```bash
# Always use HTTPS in production
# Use Let's Encrypt for free SSL
# Enforce HTTPS redirects
# HSTS header enabled
```

### **4. Server Hardening**
```bash
# Keep system updated
sudo apt update && sudo apt upgrade

# Enable firewall
sudo ufw enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Use SSH keys instead of passwords
```

### **5. Regular Security Audits**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

---

## 🔍 Security Monitoring

### **What to Monitor**
1. **Failed login attempts** - Check for brute force attacks
2. **Rate limit violations** - DDoS indicators
3. **Suspicious search patterns** - Fraud attempt detection
4. **Error logs** - Application issues
5. **Database queries** - Performance & injection attempts

### **Log Locations**
```bash
# Application logs
backend/logs/combined.log
backend/logs/error.log

# PM2 logs
pm2 logs golden-skills-api

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log

# System logs
journalctl -u nginx
```

---

## 🛡️ Security Checklist

### **Pre-Deployment**
- [ ] Strong JWT secret generated (64+ chars)
- [ ] `.env` file not in git repository
- [ ] All inputs validated with Joi schemas
- [ ] Rate limiting configured
- [ ] CORS restricted to production domain
- [ ] Error messages don't expose sensitive data
- [ ] SSL certificate obtained
- [ ] Database authentication enabled
- [ ] Firewall configured

### **Post-Deployment**
- [ ] HTTPS working correctly
- [ ] Rate limiting tested
- [ ] Authentication flow tested
- [ ] CORS tested from frontend
- [ ] Error handling tested
- [ ] Logs being written correctly
- [ ] SSL certificate auto-renewal setup
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured

---

## 🚨 Incident Response

### **If Security Breach Suspected**

1. **Immediate Actions:**
   ```bash
   # Stop the application
   pm2 stop golden-skills-api
   
   # Block suspicious IPs
   sudo ufw deny from <IP_ADDRESS>
   
   # Check logs
   tail -f backend/logs/error.log
   pm2 logs --lines 1000
   ```

2. **Investigation:**
   - Review access logs
   - Check database for unauthorized changes
   - Identify entry point
   - Document findings

3. **Recovery:**
   - Restore from backup if needed
   - Change all credentials
   - Update dependencies
   - Patch vulnerabilities
   - Restart application

4. **Post-Incident:**
   - Update security measures
   - Notify affected users if needed
   - Document lessons learned
   - Implement additional monitoring

---

## 📞 Reporting Security Issues

If you discover a security vulnerability:

**DO NOT** open a public issue

**Instead:**
1. Email: security@goldenskills.com
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

---

## 🔄 Security Updates

### **Dependency Updates**
```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Major version updates (check breaking changes first)
npm install package@latest
```

### **Regular Maintenance Schedule**
- **Daily**: Monitor logs for anomalies
- **Weekly**: Review rate limit violations
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Full penetration test

---

## 📚 Security Resources

### **Tools Used**
- **Helmet.js** - Security headers
- **Express Rate Limit** - DDoS protection
- **Joi** - Input validation
- **Winston** - Logging
- **bcrypt** - Password hashing
- **JWT** - Authentication

### **Additional Resources**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

## ⚖️ Compliance

### **Data Protection**
- User passwords are hashed (never stored in plain text)
- JWT tokens expire after 7 days
- IP addresses logged for fraud prevention (legitimate interest)
- Logs rotated and purged after 14 days

### **Privacy**
- Minimal data collection
- Clear purpose for data usage
- User consent for tracking
- Right to data deletion (admin can remove records)

---

## ✅ Security Validation

### **Testing Security**

**Test Rate Limiting:**
```bash
# Should be blocked after 5 attempts
for i in {1..10}; do
  curl -X POST https://api.yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}'
done
```

**Test HTTPS:**
```bash
# Should redirect to HTTPS
curl -I http://yourdomain.com

# Check SSL rating
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

**Test CORS:**
```bash
# Should be blocked from unauthorized origin
curl -H "Origin: https://malicious-site.com" \
  https://api.yourdomain.com/api/health
```

**Test Input Validation:**
```bash
# Should return validation error
curl -X POST https://api.yourdomain.com/api/team/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"abc"}'
```

---

**Last Updated**: January 2024
**Version**: 1.0.0

**🔒 Stay secure, stay vigilant!**
