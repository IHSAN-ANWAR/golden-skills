# Course Link API — Mobile Developer Guide
## Golden Skills Backend

**Base URL:** `http://192.168.18.5:5000`

---

## 📌 Overview — Flow Kaise Kaam Karta Hai

```
User course purchase karta hai
        ↓
User payment proof submit karta hai (mobile app)
        ↓
Admin panel mein submission dikhti hai
        ↓
Admin submission approve karta hai
        ↓
Admin course link send karta hai (Admin Panel se)
        ↓
Mobile app pe user ko course link mil jaata hai ✅
```

---

## 📱 MOBILE APP KE LIYE APIs

### API 1 — User ka Complete Course Dashboard
> Yahi **main API** hai. Ek hi call mein user ka sara data aata hai.

**Endpoint:**
```
GET /api/user-course-dashboard/{email}/{userId}
```

**Parameters (URL mein):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | User ka email (URL encode karo) |
| userId | string | ✅ | User ka ID |

**Example Request:**
```
GET http://192.168.18.5:5000/api/user-course-dashboard/john%40gmail.com/user123
```

**Successful Response — JSON:**
```json
{
  "success": true,
  "email": "john@gmail.com",
  "userId": "user123",

  "summary": {
    "hasPendingApplication": false,
    "inProgressCount": 1,
    "completedCount": 0
  },

  "pending": null,

  "inProgress": [
    {
      "assignmentId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "courseLink": "https://www.udemy.com/course/example-course/",
      "category": "premium",
      "sentAt": "2026-06-05T10:30:00.000Z",
      "planDetails": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
        "title": "Premium Course Plan",
        "category": "premium",
        "price": "Rs 4999"
      },
      "quizSubmitted": false,
      "quizSubmission": null
    }
  ],

  "completed": []
}
```

**Response Fields Explanation:**

| Field | Description |
|-------|-------------|
| `pending` | Agar user ne apply kiya hai lekin admin ne approve nahi kiya — null hoga agar koi pending nahi |
| `inProgress` | Array — Admin ne course link send kar diya hai, course chal raha hai |
| `inProgress[].courseLink` | **Yahi woh link hai jo admin ne bheja** — mobile app mein dikhao |
| `inProgress[].category` | `premium` / `pro` / `lite` |
| `inProgress[].sentAt` | Kab admin ne link bheja |
| `inProgress[].quizSubmitted` | User ne quiz submit kiya hai ya nahi |
| `completed` | Array — Course complete ho gaye |

---

### API 2 — Specific Course Ka Status Check Karo

**Endpoint:**
```
GET /api/user-course-dashboard/course-status/{userId}/{coursePlanId}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | ✅ | User ka ID |
| coursePlanId | string | ✅ | Course Plan ka MongoDB ID |

**Example Request:**
```
GET http://192.168.18.5:5000/api/user-course-dashboard/course-status/user123/64f1a2b3c4d5e6f7a8b9c0d2
```

**Response — 3 Possible States:**

**State 1: Payment Review Mein**
```json
{
  "success": true,
  "status": "payment_under_review",
  "displayMessage": "Your payment is under review. Please wait for admin approval.",
  "displayColor": "orange",
  "planTitle": "Premium Course Plan",
  "planCategory": "premium",
  "planPrice": "Rs 4999",
  "submittedAt": "2026-06-01T08:00:00.000Z"
}
```

**State 2: Course In Progress (Link Mil Gaya)**
```json
{
  "success": true,
  "status": "in_progress",
  "displayMessage": "Your course is in progress. Keep learning!",
  "displayColor": "blue",
  "courseLink": "https://www.udemy.com/course/example-course/",
  "sentAt": "2026-06-05T10:30:00.000Z",
  "planTitle": "Premium Course Plan",
  "planCategory": "premium",
  "planPrice": "Rs 4999",
  "submittedAt": "2026-06-01T08:00:00.000Z"
}
```

**State 3: Course Completed**
```json
{
  "success": true,
  "status": "completed",
  "displayMessage": "Congratulations! You have successfully completed this course.",
  "displayColor": "green",
  "courseLink": "https://www.udemy.com/course/example-course/",
  "completedAt": "2026-06-10T14:00:00.000Z",
  "score": 8,
  "totalQuestions": 10,
  "planTitle": "Premium Course Plan",
  "planCategory": "premium",
  "planPrice": "Rs 4999",
  "submittedAt": "2026-06-01T08:00:00.000Z"
}
```

---

### API 3 — Course Purchase Submit Karo (Payment Proof)

**Endpoint:**
```
POST /api/course-plan-submissions/submit
```

**Request Body — JSON:**
```json
{
  "userId": "user123",
  "coursePlanId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "userName": "Ali Hassan",
  "userEmail": "ali@gmail.com",
  "userPhone": "03001234567",
  "userImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "additionalData": {
    "transactionId": "TXN987654"
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | ✅ | User ka unique ID |
| coursePlanId | string | ✅ | Plan ka ID (plans list se milega) |
| userName | string | ✅ | User ka naam |
| userEmail | string | ✅ | User ka email |
| userPhone | string | ❌ | Phone number |
| userImage | string | ✅ | Payment proof — Base64 encoded image |
| additionalData | object | ❌ | Extra info jaise transaction ID |

**Success Response:**
```json
{
  "success": true,
  "message": "Course plan application submitted successfully",
  "submission": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "userId": "user123",
    "status": "pending",
    "submittedAt": "2026-06-06T09:00:00.000Z"
  }
}
```

---

### API 4 — Available Course Plans List

**Endpoint:**
```
GET /api/course-plans
```

**No parameters required**

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "title": "Premium Course Plan",
      "category": "premium",
      "price": "Rs 4999",
      "description": "Complete course with certification",
      "features": ["Feature 1", "Feature 2"],
      "isActive": true
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
      "title": "Pro Course Plan",
      "category": "pro",
      "price": "Rs 2999",
      "description": "Pro level access",
      "features": ["Feature A", "Feature B"],
      "isActive": true
    }
  ]
}
```

---

## ❌ Error Responses

Har API mein error aise aayega:

```json
{
  "success": false,
  "message": "Error ka description yahan hoga"
}
```

| HTTP Code | Matlab |
|-----------|--------|
| 400 | Request mein koi field missing ya galat |
| 404 | Data nahi mila (user / submission nahi mili) |
| 500 | Server error |

---

## 🔄 Complete Mobile App Flow — Step by Step

```
STEP 1: Plans fetch karo
GET /api/course-plans
→ Plans list user ko dikhao

STEP 2: User plan select kare, payment kare, proof upload kare
POST /api/course-plan-submissions/submit
→ "Pending" status aayega

STEP 3: Dashboard check karo (polling ya screen open pe)
GET /api/user-course-dashboard/{email}/{userId}
→ pending.status == "pending" → "Application review mein hai"

STEP 4: Admin approve kare aur link send kare (Admin Panel se hoga)
GET /api/user-course-dashboard/{email}/{userId}
→ inProgress[0].courseLink == "https://..." → Course link mil gaya ✅
→ Is link ko user ko dikhao ya WebView mein kholo

STEP 5: User course complete kare, quiz submit kare
POST /api/user-course-completions/submit

STEP 6: Admin quiz approve kare
GET /api/user-course-dashboard/{email}/{userId}
→ completed[0] mein data aayega ✅
```

---

## 💻 Code Examples

### React Native — Dashboard Fetch
```javascript
const BASE_URL = 'http://192.168.18.5:5000';

async function getUserDashboard(userId, userEmail) {
  const encodedEmail = encodeURIComponent(userEmail);
  
  const response = await fetch(
    `${BASE_URL}/api/user-course-dashboard/${encodedEmail}/${userId}`
  );
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message);
  }
  
  return data;
}

// Usage:
const dashboard = await getUserDashboard('user123', 'ali@gmail.com');

// Course link dikhana:
if (dashboard.inProgress.length > 0) {
  const courseLink = dashboard.inProgress[0].courseLink;
  console.log('Course link:', courseLink);
  // WebView mein open karo ya Linking.openURL(courseLink)
}
```

### React Native — Course Purchase Submit
```javascript
async function submitCoursePurchase(formData, paymentImageBase64) {
  const response = await fetch(
    `${BASE_URL}/api/course-plan-submissions/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: formData.userId,
        coursePlanId: formData.selectedPlanId,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        userImage: paymentImageBase64,  // "data:image/jpeg;base64,..."
        additionalData: {
          transactionId: formData.transactionId
        }
      })
    }
  );
  
  return await response.json();
}
```

### React Native — Polling for Course Link
```javascript
// Jab tak course link na mile, har 10 second mein check karo
function startPolling(userId, userEmail, onLinkReceived) {
  const interval = setInterval(async () => {
    const dashboard = await getUserDashboard(userId, userEmail);
    
    if (dashboard.inProgress.length > 0 && dashboard.inProgress[0].courseLink) {
      clearInterval(interval); // Polling band karo
      onLinkReceived(dashboard.inProgress[0].courseLink);
    }
  }, 10000); // 10 seconds
  
  return interval; // Component unmount pe clear karo
}
```

---

## 🌐 Network Info

| Setting | Value |
|---------|-------|
| Server IP | `192.168.18.5` |
| Port | `5000` |
| Protocol | `HTTP` |
| Base URL | `http://192.168.18.5:5000` |

> ⚠️ Mobile device aur server **ek hi WiFi network** pe hone chahiye

---

## ⚡ Rate Limits

| API Type | Limit |
|----------|-------|
| Dashboard, Plans | 100 requests / 15 min |
| Submit APIs | 30 requests / 15 min |

---

*Last Updated: June 6, 2026*
