# Task Section — Mobile App API Guide

> **Base URL:** `https://your-domain.com/api/user-tasks`
> **Auth:** `Authorization: Bearer <JWT_TOKEN>`

---

## Task ka Poora Flow

```
Admin assigns task
       |
status: "assigned"         <- user ko task mila
       |
User task start kare
PUT /:id { status: "in-progress" }
       |
status: "in-progress"      <- user ne kaam shuru kiya
       |
User "Submit Task" button dabaye
POST /:id/submit
       |
Backend check karta hai:
  Normal task  -> status "in-progress" hai? -> submit
  Referral task -> target poora hai?        -> submit
  Koi bhi      -> condition fail?           -> BLOCK + message
       |
status: "completed"        <- admin ke paas review ke liye
       |
Admin approve / reject kare
status: "approved" / "rejected"
```

---

## APIs

---

### 1. Meri Tasks Fetch Karo

**GET /api/user-tasks/my-tasks**

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "email": "user@example.com",
  "currentPlan": {
    "submissionId": "abc123",
    "planTitle": "Premium Plan",
    "planPrice": "5000"
  },
  "counts": {
    "active": 2,
    "pendingReview": 1,
    "history": 3,
    "total": 6
  },
  "activeTasks": [
    {
      "_id": "task_id_here",
      "taskTitle": "Watch Course Video",
      "taskDescription": "Watch the assigned course.",
      "status": "assigned",
      "taskDeadline": "2026-08-01T00:00:00.000Z",
      "taskPoints": 10,
      "isReferralTask": false
    }
  ],
  "pendingReview": [],
  "history": []
}
```

| Category | Status | Matlab |
|---|---|---|
| activeTasks | assigned, in-progress | User action kar sakta hai |
| pendingReview | completed | Submit ho gayi, admin ka wait |
| history | approved, rejected | Closed |

Referral task mein ye extra fields aate hain:
```json
{
  "isReferralTask": true,
  "referralTarget": 4,
  "referralProgress": 2,
  "remaining": 2,
  "referralReward": "10000",
  "referralPackagePrice": "4000"
}
```

---

### 2. Task Start Karo

**PUT /api/user-tasks/:taskId**

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Body:
```json
{ "status": "in-progress" }
```

Response:
```json
{
  "success": true,
  "message": "User task status updated successfully",
  "userTask": {
    "_id": "task_id_here",
    "status": "in-progress",
    "startedAt": "2026-07-10T12:00:00.000Z"
  }
}
```

---

### 3. Referral Task Progress Check Karo

**POST /api/user-tasks/:taskId/sync-referral-progress**

> Sirf referral tasks ke liye. "Check My Progress" button pe lagao.
> YE SUBMIT NAHI KARTA — sirf count update karta hai.

Headers:
```
Authorization: Bearer <token>
```

Body: (empty)
```json
{}
```

Response — target incomplete:
```json
{
  "success": true,
  "message": "Progress updated: 2/4 referrals done. 2 baaki hain.",
  "referralProgress": 2,
  "referralTarget": 4,
  "remaining": 2,
  "readyToSubmit": false
}
```

Response — target complete:
```json
{
  "success": true,
  "message": "Target complete! 4/4 referrals done. Ab Submit button dabao.",
  "referralProgress": 4,
  "referralTarget": 4,
  "remaining": 0,
  "readyToSubmit": true
}
```

---

### 4. Task Submit Karo (Smart Submit Button)

**POST /api/user-tasks/:taskId/submit**

> SIRF YAHI EK ENDPOINT "Submit Task" button pe lagao.
>
> Ye andar se khud check karta hai:
> - Normal task: kya "in-progress" mein hai? Nahi to block.
> - Referral task: kya referral target poora hua? Nahi to block.
> - Poora hua to submit ho jaata hai.

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Body: (optional)
```json
{
  "submissionData": "Maine kaam kar liya",
  "userNotes": "Koi note"
}
```

---

**SUCCESS — Task submit ho gaya:**
```json
{
  "success": true,
  "canSubmit": true,
  "message": "Task submitted successfully. Admin review karega.",
  "task": {
    "status": "completed",
    "completedAt": "2026-07-10T15:30:00.000Z"
  }
}
```

---

**BLOCKED — Normal task start nahi kiya (status: assigned):**
```json
{
  "success": false,
  "canSubmit": false,
  "reason": "task_not_started",
  "message": "Pehle task complete karo, phir submit karo."
}
```
Mobile app toast: "Pehle task shuru karo aur complete karo"

---

**BLOCKED — Referral target poora nahi:**
```json
{
  "success": false,
  "canSubmit": false,
  "reason": "referral_incomplete",
  "message": "Pehle task complete karo. 2 aur log refer karo jo package purchase karein.",
  "referralProgress": 2,
  "referralTarget": 4,
  "remaining": 2
}
```
Mobile app toast: "2 referrals baaki hain"

---

**BLOCKED — Already submitted:**
```json
{
  "success": false,
  "canSubmit": false,
  "reason": "already_submitted",
  "message": "Task already submitted. Admin review ka wait karo."
}
```

---

**BLOCKED — Already approved:**
```json
{
  "success": false,
  "canSubmit": false,
  "reason": "already_approved",
  "message": "Task already approved by admin."
}
```

---

Mobile app `reason` field se handle karo:
```
reason: "task_not_started"    -> "Pehle task complete karo" dikhao
reason: "referral_incomplete" -> "X referrals baaki hain" dikhao
reason: "already_submitted"   -> "Admin review mein hai" dikhao
reason: "already_approved"    -> "Task approved ho chuki hai" dikhao
```

---

### 5. Leaderboard

**GET /api/user-tasks/leaderboard**

No auth required.

Query params (optional): `?limit=10` (default 5)

Response:
```json
{
  "success": true,
  "total": 5,
  "leaderboard": [
    {
      "rank": 1,
      "userName": "Ali Hassan",
      "completedTasks": 8,
      "totalPoints": 80
    }
  ]
}
```

---

### 6. Promotion Eligibility Check

**GET /api/user-tasks/check-eligibility/:email**

No auth required.

Response:
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

## Referral Task — Button UI Logic

```
readyToSubmit = false:
  [Check My Progress]    <- /sync-referral-progress
  [Submit Task] GRAY     <- disabled

readyToSubmit = true:
  [Check My Progress]    <- /sync-referral-progress
  [Submit Task] GREEN    <- /submit (enabled)
```

---

## Status Colors

| Status | Color | Action |
|---|---|---|
| assigned | Blue | Start Task |
| in-progress | Yellow | Submit Task |
| completed | Orange | Waiting admin |
| approved | Green | Done |
| rejected | Red | Re-do karo |

---

## Quick Reference

| Action | Method | Endpoint | Auth |
|---|---|---|---|
| Meri tasks | GET | /api/user-tasks/my-tasks | Token |
| Task start | PUT | /api/user-tasks/:id | Token |
| Referral progress | POST | /api/user-tasks/:id/sync-referral-progress | Token |
| Task submit | POST | /api/user-tasks/:id/submit | Token |
| Leaderboard | GET | /api/user-tasks/leaderboard | No |
| Eligibility | GET | /api/user-tasks/check-eligibility/:email | No |
