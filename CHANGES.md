# Golden Skills — New Features Documentation

---

## Feature 1: Task Reward / Earnings System

### Kya build hua:
Jab admin kisi user ka task approve kare, to wo reward amount enter kare.
Woh amount user ke `/my-tasks` dashboard pe **Total Earnings** card mein show ho.

---

### Nayi Files — Koi nahi (sirf existing files modify hui)

---

### Modified Files

#### Backend

**`backend/models/UserTask.js`**
- Naya field add kiya:
  ```js
  rewardAmount: { type: String, default: '' }
  ```
- Jab admin task approve kare to yeh field mein reward amount save hota hai
- Referral tasks pehle se `referralReward` use karte the — woh same rehta hai

---

**`backend/controllers/userTaskController.js`**
- `updateUserTaskStatus` function mein `rewardAmount` accept karna shuru kiya
- Jab status `approved` ho to `rewardAmount` bhi save hota hai
- Naya export function add kiya: `getUserTaskEarnings`
  - Email se user ke saare `approved` tasks fetch karta hai
  - Regular tasks ka `rewardAmount` + referral tasks ka `referralReward` sum karta hai
  - User ke latest approved plan ka `taxAmount` aur `netAmount` bhi return karta hai

---

**`backend/routes/userTasks.js`**
- Naya route register kiya:
  ```
  GET /api/user-tasks/earnings/:email
  ```
- Yeh route `/:id` routes se **upar** rakha — Express routing conflict avoid karne ke liye
- Public route hai — koi auth required nahi

---

#### Frontend

**`Golden skills/src/config/apiConfig.js`**
- Naya endpoint add kiya:
  ```js
  GET_EARNINGS: (email) => `/api/user-tasks/earnings/${email}`
  ```

---

**`Golden skills/src/components/Admin Panel/SubmittedTasks/SubmittedTasks.jsx`**
- `handleApprove` function update kiya
- Approve click pe ab **2 prompts** aate hain:
  1. Reward Amount (Rs.) — admin yahan amount type kare, e.g. `5000`
  2. Approval Notes — optional notes
- Dono backend ko bheje jaate hain

---

**`Golden skills/src/pages/UserTaskData.jsx`**
- Earnings state add ki: `const [earnings, setEarnings] = useState(null)`
- Email search pe submissions ke saath **earnings API bhi parallel call** hoti hai
- Earnings card add kiya — dikhta hai jab user ka koi approved plan ho:
  ```
  ┌──────────────────────────────────────── ─┐
  │  Gold Plan                               │
  │  Plan: Rs.1,570  −Tax Rs.97  Net Rs.1,473│
  │                                          │
  │  💰 Total Task Earnings                  │
  │     Rs. 8,000                            │
  │     2 tasks approved                     │
  └──────────────────────────────────────── ─┘
  ```

---

**`Golden skills/src/pages/UserTaskData.css`**
- Earnings card ka styling add kiya (gold gradient)
- Tax breakdown badges ka styling add kiya (red = tax, green = net)

---

## Feature 2: Plan Tax Amount System

### Kya build hua:
Admin plan banate waqt har plan ka alag **tax amount** set kare (e.g. 97, 100, 103).
Yeh tax plan price se automatically minus ho ke **net amount** calculate ho.
User ke dashboard pe plan price, tax, aur net — teeno dikhein.

---

### Nayi Files — Koi nahi

---

### Modified Files

#### Backend

**`backend/models/Plan.js`**
- Naya field add kiya:
  ```js
  taxAmount: { type: Number, default: 0 }
  ```
- Har plan ka alag tax — admin manually set karta hai
- Default 0 — purane plans break nahi honge

---

**`backend/controllers/planController.js`**
- `createPlan` mein `taxAmount` accept karna shuru kiya:
  ```js
  taxAmount: taxAmount ? Number(taxAmount) : 0
  ```
- `updatePlan` mein bhi `taxAmount` update support add kiya

---

#### Frontend

**`Golden skills/src/components/Admin Panel/Tasks/PlansModal.jsx`**
- Plan create form mein **Tax Amount** input field add kiya
- Live preview add kiya — admin price aur tax type kare to net instantly dikhta hai:
  ```
  Net: Rs. 1,473
  ```
- Existing plan cards mein tax aur net display add kiya:
  ```
  Price: 1570 RS
  Tax: Rs. 97   Net: Rs. 1,473
  ```

---

## Complete Flow — End to End

```
ADMIN:
  1. Tasks section → Plans Manager → Plan create karo
     → Title, Price, Tax Amount (e.g. 97) enter karo
     → Net amount live preview dikhega

  2. Submitted Tasks → Task approve karo
     → Reward Amount enter karo (e.g. 5000)
     → Notes enter karo (optional)

USER (mobile app /my-tasks page):
  1. Email enter karo
  2. Dashboard pe dikhega:
     ┌──────────────────────────────────┐
     │ Gold Plan                        │
     │ Plan:1570  −Tax:97  Net:1473     │
     │                                  │
     │ 💰 Total Task Earnings           │
     │    Rs. 8,000                     │
     │    2 tasks approved              │
     └──────────────────────────────────┘
```

---

## Test Results

```
✅ Plan.taxAmount saves correctly       PASS
✅ Plan default taxAmount = 0           PASS
✅ net = price - tax (1570-97=1473)     PASS
✅ Only approved tasks count in earn    PASS
✅ Regular task rewardAmount sums       PASS
✅ Referral task referralReward sums    PASS
✅ planInfo.price returned correctly    PASS
✅ planInfo.taxAmount returned          PASS
✅ planInfo.netAmount calculated        PASS

PASSED: 9 / 9    FAILED: 0
Frontend build:  ✅ No errors
Backend server:  ✅ Running
```

---

## Kya Nahi Toda

- Referral task flow — untouched
- Existing approve/reject logic — same
- Koi naya page nahi banaya
- Koi existing route nahi hataya
- Purane plans jo bina tax ke hain — default 0 se kaam karte hain
- Admin panel ka koi aur section affect nahi hua

---

## Summary Table

| File | Type | Change |
|---|---|---|
| `backend/models/UserTask.js` | Backend Model | `rewardAmount` field add |
| `backend/controllers/userTaskController.js` | Backend Controller | approve mein rewardAmount save + earnings endpoint |
| `backend/routes/userTasks.js` | Backend Route | `/earnings/:email` route register |
| `backend/models/Plan.js` | Backend Model | `taxAmount` field add |
| `backend/controllers/planController.js` | Backend Controller | taxAmount accept in create/update |
| `src/config/apiConfig.js` | Frontend Config | GET_EARNINGS endpoint add |
| `src/components/Admin Panel/SubmittedTasks/SubmittedTasks.jsx` | Frontend Admin | reward amount prompt on approve |
| `src/components/Admin Panel/Tasks/PlansModal.jsx` | Frontend Admin | tax input + live net preview |
| `src/pages/UserTaskData.jsx` | Frontend User | earnings card with tax breakdown |
| `src/pages/UserTaskData.css` | Frontend CSS | earnings card + tax badge styles |
