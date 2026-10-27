# Golden Skills API Documentation

**BASE URL:** `http://192.168.18.92:5000`

---

## 🔐 AUTH — `/api/auth`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| POST | `http://192.168.18.92:5000/api/auth/login` | ❌ | Admin login |
| POST | `http://192.168.18.92:5000/api/auth/user/login` | ❌ | User login |
| POST | `http://192.168.18.92:5000/api/auth/user/register` | ❌ | User register |
| GET | `http://192.168.18.92:5000/api/auth/users` | Admin | Get all users |
| GET | `http://192.168.18.92:5000/api/auth/user/:id` | Admin | Get user by ID |
| PUT | `http://192.168.18.92:5000/api/auth/user/:id` | Admin | Update user |
| DELETE | `http://192.168.18.92:5000/api/auth/user/:id` | Admin | Delete user |
| POST | `http://192.168.18.92:5000/api/auth/user/create` | Admin | Manually create user |
| POST | `http://192.168.18.92:5000/api/auth/validate-referral` | ❌ | Validate referral code |
| GET | `http://192.168.18.92:5000/api/auth/user/referral-info` | User | Get own referral info |
| POST | `http://192.168.18.92:5000/api/auth/forgot-password` | ❌ | Forgot password |
| POST | `http://192.168.18.92:5000/api/auth/reset-password` | ❌ | Reset password |

---

## 📚 COURSES — `/api/courses`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| GET | `http://192.168.18.92:5000/api/courses` | ❌ | Get all courses |
| GET | `http://192.168.18.92:5000/api/courses/:id` | ❌ | Get course by ID |
| GET | `http://192.168.18.92:5000/api/courses/:id/quiz` | ❌ | Get course quiz |
| POST | `http://192.168.18.92:5000/api/courses` | Admin | Create course |
| PUT | `http://192.168.18.92:5000/api/courses/:id/quiz` | Admin | Update course quiz |
| DELETE | `http://192.168.18.92:5000/api/courses/:id` | Admin | Delete course |

---

## 📋 TASKS — `/api`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| GET | `http://192.168.18.92:5000/api/admin/all` | Admin | Get all tasks |
| GET | `http://192.168.18.92:5000/api/admin/stats` | Admin | Task stats |
| POST | `http://192.168.18.92:5000/api/admin/create` | Admin | Create task |
| PUT | `http://192.168.18.92:5000/api/admin/update/:id` | Admin | Update task |
| DELETE | `http://192.168.18.92:5000/api/admin/delete/:id` | Admin | Delete task |
| GET | `http://192.168.18.92:5000/api/user/my-tasks` | ❌ | Get my tasks |

---

## 💼 PLANS — `/api/plans`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| GET | `http://192.168.18.92:5000/api/plans` | Admin | Get all plans |
| POST | `http://192.168.18.92:5000/api/plans` | Admin | Create plan |
| PUT | `http://192.168.18.92:5000/api/plans/:id` | Admin | Update plan |
| DELETE | `http://192.168.18.92:5000/api/plans/:id` | Admin | Delete plan |

---

## 🎓 COURSE PLANS — `/api/course-plans`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| GET | `http://192.168.18.92:5000/api/course-plans` | ❌ | Get all course plans |
| GET | `http://192.168.18.92:5000/api/course-plans/:id` | ❌ | Get course plan by ID |
| POST | `http://192.168.18.92:5000/api/course-plans` | Admin | Create course plan |
| PUT | `http://192.168.18.92:5000/api/course-plans/:id` | Admin | Update course plan |
| DELETE | `http://192.168.18.92:5000/api/course-plans/:id` | Admin | Delete course plan |

---

## 📝 PLAN SUBMISSIONS — `/api/submissions`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| POST | `http://192.168.18.92:5000/api/submissions` | ❌ | Submit plan selection |
| GET | `http://192.168.18.92:5000/api/submissions/my-submissions` | ❌ | Get my submissions |
| GET | `http://192.168.18.92:5000/api/submissions` | Admin | Get all submissions |
| GET | `http://192.168.18.92:5000/api/submissions/:id` | Admin | Get submission by ID |
| PUT | `http://192.168.18.92:5000/api/submissions/:id` | Admin | Update submission status |
| DELETE | `http://192.168.18.92:5000/api/submissions/:id` | Admin | Delete submission |

---

## 📝 COURSE PLAN SUBMISSIONS — `/api/course-plan-submissions`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| POST | `http://192.168.18.92:5000/api/course-plan-submissions/submit` | ❌ | Submit course plan application |
| GET | `http://192.168.18.92:5000/api/course-plan-submissions/user/:userId` | ❌ | Get user's submission |
| GET | `http://192.168.18.92:5000/api/course-plan-submissions` | Admin | Get all submissions |
| GET | `http://192.168.18.92:5000/api/course-plan-submissions/:id` | Admin | Get by ID |
| PUT | `http://192.168.18.92:5000/api/course-plan-submissions/:id` | Admin | Update status |
| DELETE | `http://192.168.18.92:5000/api/course-plan-submissions/:id` | Admin | Delete |

---

## ✅ USER TASKS — `/api/user-tasks`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| POST | `http://192.168.18.92:5000/api/user-tasks/assign` | Admin | Assign task to user |
| GET | `http://192.168.18.92:5000/api/user-tasks` | Admin | Get all user tasks |
| GET | `http://192.168.18.92:5000/api/user-tasks/stats` | Admin | Task completion stats |
| PUT | `http://192.168.18.92:5000/api/user-tasks/:id` | Admin | Update task status |
| DELETE | `http://192.168.18.92:5000/api/user-tasks/:id` | Admin | Delete user task |
| GET | `http://192.168.18.92:5000/api/user-tasks/user/:email` | ❌ | Get tasks by email |
| GET | `http://192.168.18.92:5000/api/user-tasks/check-eligibility/:email` | ❌ | Check promotion eligibility |
| POST | `http://192.168.18.92:5000/api/user-tasks/:id/submit` | ❌ | Submit task |

---

## 🔗 COURSE LINKS — `/api/course-links`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| POST | `http://192.168.18.92:5000/api/course-links/send` | Admin | Send course link |
| GET | `http://192.168.18.92:5000/api/course-links` | Admin | Get all assignments |

---

## 🎯 COURSE COMPLETIONS — `/api/user-course-completions`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| POST | `http://192.168.18.92:5000/api/user-course-completions/submit` | ❌ | Submit completion |
| GET | `http://192.168.18.92:5000/api/user-course-completions/user/:userId/assigned` | ❌ | Get assigned courses |
| GET | `http://192.168.18.92:5000/api/user-course-completions/user/:userId` | ❌ | Get user completions |
| GET | `http://192.168.18.92:5000/api/user-course-completions/all` | Admin | Get all completions |
| GET | `http://192.168.18.92:5000/api/user-course-completions/pending` | Admin | Get pending |
| GET | `http://192.168.18.92:5000/api/user-course-completions/submitted` | Admin | Get submitted |
| PUT | `http://192.168.18.92:5000/api/user-course-completions/:id/status` | Admin | Update status |

---

## 🎁 PROMOTIONS — `/api/promotions`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| GET | `http://192.168.18.92:5000/api/promotions/public` | ❌ | Get active promotions |
| GET | `http://192.168.18.92:5000/api/promotions/eligibility/:email` | ❌ | Check eligibility |
| GET | `http://192.168.18.92:5000/api/promotions` | Admin | Get all promotions |
| POST | `http://192.168.18.92:5000/api/promotions` | Admin | Create promotion |
| PUT | `http://192.168.18.92:5000/api/promotions/:id` | Admin | Update promotion |
| DELETE | `http://192.168.18.92:5000/api/promotions/:id` | Admin | Delete promotion |

---

## 🏆 USER PROMOTIONS — `/api/user-promotions`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| POST | `http://192.168.18.92:5000/api/user-promotions/submit` | ❌ | Submit promotion plan purchase |
| GET | `http://192.168.18.92:5000/api/user-promotions/user/:email` | ❌ | Get promotions by email |
| POST | `http://192.168.18.92:5000/api/user-promotions/:id/tasks/:taskId/submit` | ❌ | Submit promotion task |
| GET | `http://192.168.18.92:5000/api/user-promotions` | Admin | Get all user promotions |
| GET | `http://192.168.18.92:5000/api/user-promotions/:id` | Admin | Get by ID |
| PUT | `http://192.168.18.92:5000/api/user-promotions/:id/payment` | Admin | Update payment status |
| POST | `http://192.168.18.92:5000/api/user-promotions/:id/tasks` | Admin | Assign tasks |
| PUT | `http://192.168.18.92:5000/api/user-promotions/:id/tasks/:taskId` | Admin | Update task status |
| PUT | `http://192.168.18.92:5000/api/user-promotions/:id/reward` | Admin | Approve reward payment |
| DELETE | `http://192.168.18.92:5000/api/user-promotions/:id` | Admin | Delete |

---

## 🏦 ACCOUNT DETAILS — `/api/account-details`
| Method | Complete URL | Auth | Description |
|--------|-------------|------|-------------|
| GET | `http://192.168.18.92:5000/api/account-details/public` | ❌ | Get active accounts |
| GET | `http://192.168.18.92:5000/api/account-details` | Admin | Get all accounts |
| POST | `http://192.168.18.92:5000/api/account-details` | Admin | Create account detail |
| PUT | `http://192.168.18.92:5000/api/account-details/:id` | Admin | Update |
| DELETE | `http://192.168.18.92:5000/api/account-details/:id` | Admin | Delete |

---

**Rate Limits:**
- Auth routes: 5 req / 15 min
- Submissions & user-promotions: 30 req / 15 min
- Baaki sab: 100 req / 15 min
