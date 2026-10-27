x # 📱 Golden Skills — Mobile App API Documentation

**Base URL:** `http://192.168.18.92:5000`  
**Content-Type:** `application/json`  
**Authentication:** Bearer Token (JWT) — header mein bhejo: `Authorization: Bearer <token>`

---

## 📋 Table of Contents

1. [Authentication](#1-authentication)
2. [Courses](#2-courses)
3. [Course Plans](#3-course-plans)
4. [Plans (Earning Plans)](#4-plans-earning-plans)
5. [Plan Submission (Payment Verification)](#5-plan-submission-payment-verification)
6. [User Tasks](#6-user-tasks)
7. [Course Plan Submission](#7-course-plan-submission)
8. [Course Completions](#8-course-completions)
9. [Promotions](#9-promotions)
10. [User Promotions](#10-user-promotions)
11. [Account Details (Payment Info)](#11-account-details-payment-info)
12. [Error Responses](#12-error-responses)
13. [Rate Limits](#13-rate-limits)

---

## 1. Authentication

### 1.1 User Register (New User)
**POST** `/api/auth/user/register`

> ⚠️ Referral code **zaruri** hai — bina referral code ke registration nahi hogi.

**Request Body:**
```json
{
  "firstName": "Ali",
  "lastName": "Ahmed",
  "email": "ali@example.com",
  "city": "Karachi",
  "password": "mypassword123",
  "referralCode": "GS-XXXX"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully!",
  "user": {
    "_id": "64abc...",
    "firstName": "Ali",
    "lastName": "Ahmed",
    "fullName": "Ali Ahmed",
    "email": "ali@example.com",
    "city": "Karachi",
    "referralCode": "GS-XXXX",
    "myReferralCode": "GS-YYYY",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` — Validation failed (missing fields, invalid email, short password)
- `400` — Email already exists
- `400` — Invalid referral code
- `400` — Self-referral not allowed

---

### 1.2 User Login
**POST** `/api/auth/user/login`

**Request Body:**
```json
{
  "email": "ali@example.com",
  "password": "mypassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc...",
    "fullName": "Ali Ahmed",
    "username": "ali_ahmed",
    "email": "ali@example.com",
    "age": 25,
    "city": "Karachi",
    "referralCode": "GS-XXXX",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> 💡 Token 24 ghante valid rehta hai. Isko local storage mein save karo.

**Error Responses:**
- `400` — Email or password missing
- `401` — Invalid credentials

---

### 1.3 Validate Referral Code
**POST** `/api/auth/validate-referral`

> Registration se pehle referral code check karne ke liye use karo.

**Request Body:**
```json
{
  "referralCode": "GS-XXXX"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "valid": true,
  "message": "Valid referral code",
  "referrerName": "Ahmad Khan"
}
```

**Invalid Code Response (200):**
```json
{
  "success": true,
  "valid": false,
  "message": "Invalid referral code"
}
```

---

### 1.4 Get My Referral Info
**GET** `/api/auth/user/referral-info`  
🔒 **Auth Required** (User Token)

**Success Response (200):**
```json
{
  "success": true,
  "myReferralCode": "GS-YYYY",
  "referredUsersCount": 3,
  "fullName": "Ali Ahmed"
}
```

---

### 1.5 Forgot Password
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "ali@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent",
  "resetLink": "http://localhost:5173/reset-password?token=..."
}
```

---

### 1.6 Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful! You can now login with your new password."
}
```

**Error Responses:**
- `400` — Token or new password missing
- `400` — Password must be at least 6 characters
- `401` — Invalid or expired reset token

---

## 2. Courses

### 2.1 Get All Courses
**GET** `/api/courses`

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "courses": [
    {
      "_id": "64abc...",
      "title": "Digital Marketing",
      "icon": "📱",
      "description": "Learn digital marketing basics",
      "quizQuestions": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2.2 Get Single Course
**GET** `/api/courses/:id`

**Success Response (200):**
```json
{
  "success": true,
  "course": {
    "_id": "64abc...",
    "title": "Digital Marketing",
    "icon": "📱",
    "description": "Learn digital marketing basics",
    "quizQuestions": []
  }
}
```

---

### 2.3 Get Course Quiz Questions
**GET** `/api/courses/:id/quiz`

> Correct answers nahi aate by default — sirf questions aur options aate hain.

**Success Response (200):**
```json
{
  "success": true,
  "quizQuestions": [
    {
      "question": "What is SEO?",
      "options": ["Search Engine Optimization", "Social Engine Output", "Search Email Option", "None"]
    }
  ]
}
```

---

## 3. Course Plans

### 3.1 Get All Course Plans
**GET** `/api/course-plans`

**Query Params (optional):**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category (e.g. `graphic`, `digital`) |
| `isActive` | boolean | Filter active plans only (`true`) |

**Success Response (200):**
```json
{
  "success": true,
  "plans": [
    {
      "_id": "64abc...",
      "title": "Graphic Design Basic",
      "category": "graphic",
      "price": 5000,
      "description": "Learn graphic design from scratch",
      "features": ["Adobe Photoshop", "Canva", "Logo Design"],
      "isActive": true
    }
  ]
}
```

---

### 3.2 Get Single Course Plan
**GET** `/api/course-plans/:id`

**Success Response (200):**
```json
{
  "success": true,
  "plan": {
    "_id": "64abc...",
    "title": "Graphic Design Basic",
    "category": "graphic",
    "price": 5000,
    "description": "Learn graphic design from scratch",
    "features": ["Adobe Photoshop", "Canva"],
    "isActive": true
  }
}
```

---

## 4. Plans (Earning Plans)

### 4.1 Get All Active Plans
**GET** `/api/plans`

> ✅ Yeh route **public** hai — koi auth token nahi chahiye.  
> 💡 Fresh data ke liye `?fresh=1` query param lagao (Redis cache bypass hoga).

**Example:** `GET /api/plans`  
**Fresh data:** `GET /api/plans?fresh=1`

**Success Response (200):**
```json
{
  "success": true,
  "plans": [
    {
      "_id": "6a435e9250243fe8f9084c70",
      "title": "Gold Plan",
      "price": "5000 RS",
      "description": "",
      "isActive": true,
      "createdBy": "admin",
      "createdAt": "2026-06-30T06:13:38.697Z",
      "updatedAt": "2026-06-30T06:13:38.697Z"
    },
    {
      "_id": "6a435e9250243fe8f9084c71",
      "title": "Silver Plan",
      "price": "2000 RS",
      "description": "Basic earning plan",
      "isActive": true,
      "createdBy": "admin",
      "createdAt": "2026-06-29T10:00:00.000Z",
      "updatedAt": "2026-06-29T10:00:00.000Z"
    }
  ]
}
```

**Plan Object Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique plan ID (plan submit karte waqt use karo) |
| `title` | string | Plan ka naam |
| `price` | string | Price with currency (e.g. `"5000 RS"`) |
| `description` | string | Plan ki description (empty bhi ho sakti hai) |
| `isActive` | boolean | Hamesha `true` hoga (inactive plans nahi aate) |
| `createdAt` | string | Plan banane ki date/time |

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error fetching plans",
  "error": "Technical error details"
}
```

> 💡 **Mobile App mein use:** Plan select karne ke baad `_id` save karo aur `POST /api/submissions` mein `planId` ke taur par bhejo.

---

## 5. Plan Submission (Payment Verification)

### 5.1 Submit Plan Payment
**POST** `/api/submissions`

> User plan khareedne ke baad payment screenshot ke saath submit karta hai.

**Request Body:**
```json
{
  "planId": "64abc...",
  "userName": "Ali Ahmed",
  "userEmail": "ali@example.com",
  "userPhone": "03001234567",
  "userImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "additionalData": {}
}
```

> 💡 `userImage` — payment screenshot ka Base64 string ya URL bhejo.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Payment verification submitted successfully",
  "submission": {
    "_id": "64abc...",
    "userId": 1,
    "planId": "64abc...",
    "planTitle": "Gold Plan",
    "planPrice": 5000,
    "userName": "Ali Ahmed",
    "userEmail": "ali@example.com",
    "userPhone": "03001234567",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` — Plan ID or user name missing
- `400` — Payment screenshot required
- `404` — Plan not found

---

### 5.2 Get My Submissions
**GET** `/api/submissions/my-submissions`

**Query Params (optional):**
| Param | Type | Description |
|-------|------|-------------|
| `userEmail` | string | Filter by user email |
| `status` | string | `pending`, `approved`, `rejected` |

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "submissions": [
    {
      "_id": "64abc...",
      "planTitle": "Gold Plan",
      "planPrice": 5000,
      "status": "approved",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 6. User Tasks

### 6.1 Get Tasks by User Email
**GET** `/api/user-tasks/user/:email`

**Example:** `GET /api/user-tasks/user/ali@example.com`

**Success Response (200):**
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "64abc...",
      "taskTitle": "Create a Facebook Post",
      "taskDescription": "Create an engaging post for our page",
      "status": "assigned",
      "taskDeadline": "2024-02-01T00:00:00.000Z",
      "taskPoints": 10,
      "isCustomTask": false,
      "isReferralTask": false,
      "assignedAt": "2024-01-15T00:00:00.000Z"
    },
    {
      "_id": "64def...",
      "taskTitle": "Refer 3 People",
      "taskDescription": "Refer 3 people who must activate a package",
      "status": "in-progress",
      "isReferralTask": true,
      "referralTarget": 3,
      "referralProgress": 1,
      "referralReward": "10000",
      "taskDeadline": "2024-02-15T00:00:00.000Z"
    }
  ]
}
```

**Task Status Values:**
| Status | Meaning |
|--------|---------|
| `assigned` | Task assign hua, abhi start nahi |
| `in-progress` | Task chal raha hai |
| `completed` | User ne complete kar diya |
| `approved` | Admin ne approve kar diya |
| `rejected` | Admin ne reject kar diya |
| `overdue` | Deadline guzar gayi |

---

### 6.2 Submit a Task
**POST** `/api/user-tasks/:id/submit`

**Request Body:**
```json
{
  "submissionData": "https://facebook.com/post/123",
  "userNotes": "Maine post create kar di hai"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task submitted successfully",
  "task": {
    "_id": "64abc...",
    "status": "completed",
    "completedAt": "2024-01-20T00:00:00.000Z",
    "submissionData": "https://facebook.com/post/123"
  }
}
```

---

### 6.3 Check Task Eligibility (Promotion ke liye)
**GET** `/api/user-tasks/check-eligibility/:email`

**Example:** `GET /api/user-tasks/check-eligibility/ali@example.com`

**Success Response (200):**
```json
{
  "success": true,
  "completedTasks": 2,
  "requiredTasks": 3,
  "isEligible": false,
  "remaining": 1
}
```

---

## 7. Course Plan Submission

### 7.1 Submit Course Plan Application
**POST** `/api/course-plan-submissions/submit`

> User course plan khareedne ke liye apply karta hai.

**Request Body:**
```json
{
  "userId": "64abc...",
  "coursePlanId": "64def...",
  "userName": "Ali Ahmed",
  "userEmail": "ali@example.com",
  "userPhone": "03001234567",
  "userImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "additionalData": {}
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Course plan application submitted successfully",
  "submission": {
    "_id": "64abc...",
    "userId": "64abc...",
    "coursePlanId": "64def...",
    "planTitle": "Graphic Design Basic",
    "planCategory": "graphic",
    "planPrice": 5000,
    "status": "pending",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` — User ID, Course Plan ID, or User Name missing
- `400` — User already submitted an application
- `404` — Course plan not found

---

### 7.2 Get My Course Plan Submission
**GET** `/api/course-plan-submissions/user/:userId`

**Example:** `GET /api/course-plan-submissions/user/64abc...`

**Success Response (200):**
```json
{
  "success": true,
  "submission": {
    "_id": "64abc...",
    "planTitle": "Graphic Design Basic",
    "status": "approved",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 8. Course Completions

### 8.1 Submit Course Completion (with Quiz)
**POST** `/api/user-course-completions/submit`

> User course complete karne ke baad quiz answers ke saath submit karta hai.

**Request Body:**
```json
{
  "courseLinkAssignmentId": "64abc...",
  "quizAnswers": [
    {
      "question": "What is SEO?",
      "userAnswer": "Search Engine Optimization",
      "correctAnswer": "Search Engine Optimization"
    },
    {
      "question": "What is CPC?",
      "userAnswer": "Cost Per Click",
      "correctAnswer": "Cost Per Click"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Course completion submitted successfully!",
  "completion": {
    "_id": "64abc...",
    "score": 2,
    "totalQuestions": 2,
    "status": "passed"
  }
}
```

> 💡 60% ya usse zyada score pe `passed`, warna `completed` status milta hai.

---

### 8.2 Get My Assigned Courses
**GET** `/api/user-course-completions/user/:userId/assigned`

> Admin ne jo courses assign kiye hain aur abhi complete nahi hue.

**Success Response (200):**
```json
{
  "success": true,
  "courses": [
    {
      "_id": "64abc...",
      "category": "digital",
      "courseLink": "https://youtube.com/watch?v=...",
      "userName": "Ali Ahmed",
      "userEmail": "ali@example.com",
      "sentAt": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

### 8.3 Get My Completed Courses
**GET** `/api/user-course-completions/user/:userId`

**Success Response (200):**
```json
{
  "success": true,
  "completions": [
    {
      "_id": "64abc...",
      "category": "digital",
      "score": 8,
      "totalQuestions": 10,
      "status": "passed",
      "completedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## 9. Promotions

### 9.1 Get Active Promotions with Eligibility
**GET** `/api/promotions/eligibility/:email`

> User ke email se check karo ke woh kaunsi promotions ke liye eligible hai.

**Example:** `GET /api/promotions/eligibility/ali@example.com`

**Success Response (200):**
```json
{
  "success": true,
  "completedTaskCount": 2,
  "promotions": [
    {
      "_id": "64abc...",
      "title": "Gold Promotion",
      "description": "Complete 3 tasks and earn big reward",
      "requiredPlanPrice": "5000",
      "rewardAmount": "15000",
      "requiredTaskCount": 3,
      "completedTaskCount": 2,
      "isEligible": false,
      "tasksRemaining": 1
    },
    {
      "_id": "64def...",
      "title": "Silver Promotion",
      "description": "No task requirement",
      "requiredPlanPrice": "2000",
      "rewardAmount": "5000",
      "requiredTaskCount": 0,
      "isEligible": true,
      "tasksRemaining": 0
    }
  ]
}
```

---

### 9.2 Get All Active Promotions (Public)
**GET** `/api/promotions/public`

**Success Response (200):**
```json
{
  "success": true,
  "promotions": [
    {
      "_id": "64abc...",
      "title": "Gold Promotion",
      "description": "Earn big rewards",
      "requiredPlanPrice": "5000",
      "rewardAmount": "15000",
      "requiredTaskCount": 3,
      "isActive": true
    }
  ]
}
```

---

## 10. User Promotions

### 10.1 Submit Promotion Plan Purchase
**POST** `/api/user-promotions/submit`

> User promotion ke liye plan khareed ke payment screenshot submit karta hai.

**Request Body:**
```json
{
  "planId": "64abc...",
  "promotionId": "64def...",
  "userName": "Ali Ahmed",
  "userEmail": "ali@example.com",
  "userPhone": "03001234567",
  "userImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
}
```

> 💡 `promotionId` optional hai — agar koi specific promotion select ki ho toh bhejo.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Promotion plan purchase submitted successfully. Awaiting admin approval.",
  "userPromotion": {
    "_id": "64abc...",
    "userName": "Ali Ahmed",
    "planTitle": "Gold Plan",
    "planPrice": 5000,
    "promotionTitle": "Gold Promotion",
    "rewardAmount": "15000",
    "paymentStatus": "pending",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` — Plan ID, user name, or email missing
- `400` — Payment screenshot required
- `403` — Not enough completed tasks for this promotion
- `404` — User not found (register first)
- `404` — Plan not found
- `404` — Promotion not found

---

### 10.2 Get My Promotions by Email
**GET** `/api/user-promotions/user/:email`

**Example:** `GET /api/user-promotions/user/ali@example.com`

**Success Response (200):**
```json
{
  "success": true,
  "userPromotions": [
    {
      "_id": "64abc...",
      "planTitle": "Gold Plan",
      "promotionTitle": "Gold Promotion",
      "rewardAmount": "15000",
      "paymentStatus": "approved",
      "status": "active",
      "tasks": [
        {
          "_id": "64task...",
          "taskTitle": "Create 5 Social Media Posts",
          "taskDescription": "Create engaging posts",
          "status": "assigned",
          "taskDeadline": "2024-02-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Promotion Status Values:**
| Status | Meaning |
|--------|---------|
| `pending` | Payment review ho rahi hai |
| `active` | Payment approve, tasks chal rahe hain |
| `completed` | Saare tasks complete |
| `reward-approved` | Reward payment approve ho gayi |
| `rejected` | Reject ho gayi |

---

### 10.3 Submit Promotion Task
**POST** `/api/user-promotions/:id/tasks/:taskId/submit`

**Request Body:**
```json
{
  "submissionData": "https://instagram.com/post/abc123",
  "userNotes": "Maine 5 posts create kar diye hain"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task submitted successfully",
  "task": {
    "_id": "64task...",
    "taskTitle": "Create 5 Social Media Posts",
    "status": "completed",
    "completedAt": "2024-01-20T00:00:00.000Z",
    "submissionData": "https://instagram.com/post/abc123"
  }
}
```

---

## 11. Account Details (Payment Info)

### 11.1 Get Payment Account Details
**GET** `/api/account-details/public`

> Yahan se payment karne ke liye bank/JazzCash/EasyPaisa account details milte hain.

**Success Response (200):**
```json
{
  "success": true,
  "accounts": [
    {
      "_id": "64abc...",
      "accountTitle": "JazzCash Account",
      "bankName": "JazzCash",
      "accountHolderName": "Golden Skills",
      "accountNumber": "03001234567",
      "iban": "",
      "accountType": "jazzcash",
      "instructions": "Payment ke baad screenshot zaroor bhejein",
      "isActive": true,
      "displayOrder": 1
    },
    {
      "_id": "64def...",
      "accountTitle": "Bank Account",
      "bankName": "HBL",
      "accountHolderName": "Golden Skills Pvt Ltd",
      "accountNumber": "1234567890",
      "iban": "PK36HABB0000001234567890",
      "accountType": "bank",
      "instructions": "Transfer ke baad 24 ghante mein confirm hoga",
      "isActive": true,
      "displayOrder": 2
    }
  ]
}
```

---

## 12. Error Responses

Saari APIs same error format use karti hain:

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Technical error details (development only)"
}
```

**Common HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad Request (missing/invalid fields) |
| `401` | Unauthorized (invalid token or credentials) |
| `403` | Forbidden (not eligible) |
| `404` | Not Found |
| `429` | Too Many Requests (rate limit) |
| `500` | Server Error |

---

## 13. Rate Limits

| Route Group | Limit |
|-------------|-------|
| `/api/auth/*` | 5 requests / 15 minutes |
| `/api/submissions/*` | 30 requests / 15 minutes |
| `/api/user-promotions/*` | 30 requests / 15 minutes |
| `/api/course-plan-submissions/*` | 30 requests / 15 minutes |
| Baaki saari APIs | 100 requests / 15 minutes |

---

## 🔄 Typical Mobile App Flow

### New User Registration Flow:
```
1. GET  /api/account-details/public          → Payment account details dikhao
2. POST /api/auth/validate-referral          → Referral code validate karo
3. POST /api/auth/user/register              → User register karo
4. POST /api/auth/user/login                 → Login karo, token save karo
5. GET  /api/plans                           → Available plans dikhao
6. POST /api/submissions                     → Plan payment submit karo
```

### Existing User Dashboard Flow:
```
1. POST /api/auth/user/login                 → Login
2. GET  /api/user-tasks/user/:email          → My tasks dikhao
3. GET  /api/user-course-completions/user/:userId/assigned → Assigned courses
4. GET  /api/promotions/eligibility/:email   → Promotion eligibility check
5. GET  /api/user-promotions/user/:email     → My promotions
6. GET  /api/auth/user/referral-info         → My referral code & stats
```

### Task Submission Flow:
```
1. GET  /api/user-tasks/user/:email          → Tasks list lo
2. POST /api/user-tasks/:id/submit           → Task submit karo
3. GET  /api/user-tasks/check-eligibility/:email → Promotion eligibility check
```

### Course Completion Flow:
```
1. GET  /api/user-course-completions/user/:userId/assigned → Assigned courses lo
2. GET  /api/courses/:id/quiz                → Quiz questions lo
3. POST /api/user-course-completions/submit  → Quiz answers ke saath submit karo
```

---

*Last Updated: May 2026*
