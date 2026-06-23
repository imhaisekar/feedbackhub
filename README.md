# 💬 FeedbackHub — Complete Setup Guide
## Read this fully before starting!

---

## 📁 FOLDER STRUCTURE — Put files exactly here

```
feedbackhub/
│
├── backend/
│   ├── middleware/
│   │   ├── auth.js         ← JWT checker
│   │   └── mailer.js       ← Email sender (OTP + notifications)
│   ├── models/
│   │   ├── User.js         ← User database schema
│   │   ├── OTP.js          ← OTP storage (auto-deletes in 10 min)
│   │   └── Feedback.js     ← Feedback database schema
│   ├── routes/
│   │   ├── auth.js         ← Register, OTP verify, Login APIs
│   │   ├── feedback.js     ← Submit, edit, pulse APIs
│   │   └── admin.js        ← Analytics, moderation, export APIs
│   ├── .env                ← Your secret config (never share this!)
│   ├── package.json        ← Project dependencies
│   └── server.js           ← Main server entry point
│
└── frontend/
    ├── index.html          ← Login + Register + OTP page
    ├── feedback.html       ← User: submit feedback, history, pulse wall
    └── admin.html          ← Admin: dashboard, charts, moderation
```

---

## 🖥️ STEP 1 — Install Required Software

### 1A. Install Node.js
- Go to: https://nodejs.org
- Click the big green "LTS" button to download
- Install it (keep clicking Next, leave everything default)
- After install, RESTART your laptop

### 1B. Install MongoDB
- Go to: https://www.mongodb.com/try/download/community
- Select: Version = Latest, Platform = Windows, Package = MSI
- Download and install
- During install — CHECK THE BOX that says "Install MongoDB Compass"
- Compass is a visual tool to see your database

### 1C. VS Code
- Go to: https://code.visualstudio.com
- Download and install

---

## 📂 STEP 2 — Set Up The Project

1. Create a folder on your Desktop called `feedbackhub`
2. Inside it, create two folders: `backend` and `frontend`
3. Inside `backend`, create three more folders: `middleware`, `models`, `routes`
4. Now paste all the code files into their correct locations (see folder structure above)

---

## ⚙️ STEP 3 — Install Backend Packages

1. Open VS Code
2. Go to: File → Open Folder → select your `feedbackhub` folder
3. Open the Terminal inside VS Code: View → Terminal (or press Ctrl + `)
4. In the terminal, type these commands ONE BY ONE:

```bash
cd backend
npm install
```

Wait for it to finish. You'll see a `node_modules` folder appear inside `backend`. That means it worked.

---

## 🚀 STEP 4 — Start The Server

In the same terminal, type:

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 FeedbackHub server running on http://localhost:5000
```

If you see this — backend is working! 🎉

> ⚠️ Keep this terminal open the whole time. If you close it, server stops.

---

## 🌐 STEP 5 — Open The Frontend

1. Open File Explorer
2. Go to your `feedbackhub/frontend/` folder
3. Double-click `index.html` — it will open in your browser

---

## 👤 STEP 6 — Create Your First Accounts

### Create an Admin account:
1. Click "Create Account"
2. Fill name, email, password
3. Select "Admin — Manage & analyse feedback"
4. Click Create — an OTP will be sent to that email
5. Enter OTP — you'll be redirected to the admin dashboard

### Create a User account (for testing):
1. Open `index.html` again in another browser tab or incognito
2. Register with a different email
3. Select "User — Submit & track feedback"
4. Verify OTP — you'll land on the feedback form

---

## ✅ FEATURE CHECKLIST

| Feature | Where |
|---|---|
| OTP Email Verification | Register page |
| JWT Secure Login | All pages |
| Password Strength Meter | Register page |
| Category Selection (icons) | feedback.html |
| Star Rating with Mood Glow | feedback.html |
| Character Counter | feedback.html |
| Submit with Loading Animation | feedback.html |
| My Feedback History + Status | feedback.html sidebar |
| Admin Note visible to user | feedback.html sidebar |
| Live Pulse Wall (auto-refresh) | feedback.html + admin.html |
| Good Morning Greeting | admin.html |
| Stats Cards (4 metrics) | admin.html dashboard |
| Activity Line Chart (7 days) | admin.html dashboard |
| Category Donut Chart | admin.html dashboard |
| Rating Bar Chart | admin.html dashboard |
| Search Feedbacks | admin.html feedbacks |
| Filter by Status + Category | admin.html feedbacks |
| Review Modal with Admin Note | admin.html feedbacks |
| Approve / Reject | admin.html feedbacks |
| Email to user on status change | Automatic via nodemailer |
| Export CSV | admin.html feedbacks |
| Pending badge on sidebar | admin.html |
| Version history on edit | backend/routes/feedback.js |
| Auto dashboard refresh (30s) | admin.html |
| Responsive design | All pages |
| Loading skeleton states | admin.html |
| Password encryption (bcrypt) | backend |
| Data stored in MongoDB | backend |

---

## ❓ Common Problems

**"Cannot reach server"**
→ Make sure you ran `npm run dev` in the terminal and it shows "MongoDB Connected"

**"MongoDB not connected"**
→ Open MongoDB Compass and connect to `mongodb://localhost:27017`

**OTP not received**
→ Check spam folder. Also make sure .env has correct Gmail and App Password

**Page is blank**
→ Open browser Console (F12 → Console tab) and share the error

---

## 🔐 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | None | Register + send OTP |
| POST | /api/auth/verify-otp | None | Verify OTP |
| POST | /api/auth/resend-otp | None | Resend OTP |
| POST | /api/auth/login | None | Login |
| POST | /api/feedback/submit | User | Submit feedback |
| GET | /api/feedback/my | User | Get my feedbacks |
| PUT | /api/feedback/edit/:id | User | Edit (saves history) |
| GET | /api/feedback/pulse | None | Live approved wall |
| GET | /api/admin/feedbacks | Admin | All feedbacks + search |
| PATCH | /api/admin/feedback/:id | Admin | Approve/Reject |
| GET | /api/admin/analytics | Admin | Dashboard stats |
| GET | /api/admin/export/csv | Admin | Download CSV |
| PATCH | /api/admin/mark-read | Admin | Mark all as read |

---

**Tools Used:** VS Code, MongoDB Compass, Node.js, Express.js, MongoDB, Nodemailer, Chart.js, JWT, Bcrypt
