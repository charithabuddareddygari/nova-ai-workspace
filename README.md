# 🚀 TaskNova AI

TaskNova AI is a futuristic AI-powered MERN Stack SaaS platform for intelligent project management, real-time collaboration, AI automation, analytics, productivity tracking, and enterprise team workflow management.

The platform combines the power of:

* Jira
* Trello
* Notion
* Slack
* ClickUp
* Monday.com
* ChatGPT AI Assistant

into one next-generation productivity ecosystem.

---

# ✨ Features

## 🔐 Authentication System

* Admin & Member Authentication
* JWT Authentication
* Role-Based Access Control
* Secure Password Hashing using bcrypt
* Company ID Based Organization Access

---

# 👨‍💼 Admin Features

## 📁 Project Management

* Create/Edit/Delete Projects
* Add Members
* Upload Attachments
* Add Deadlines
* Project Timeline Tracking

## ✅ Task Management

* Create Tasks
* Assign Tasks to Registered Members
* AI Task Suggestions
* Task Priorities
* Subtasks
* File Uploads
* Comments System

## 📊 Analytics Dashboard

* Productivity Tracking
* Team Performance
* AI Risk Analysis
* Overdue Task Tracking
* Interactive Charts & Graphs

## 🤖 AI Automation

* AI Task Breakdown
* AI Productivity Suggestions
* AI Delay Prediction
* AI Workload Balancing
* AI Weekly Reports

## 🔔 Real-Time Features

* Live Notifications
* Real-Time Task Updates
* Online/Offline Status
* Live Team Activity
* Socket.IO Integration

---

# 👨‍💻 Member Features

* View Assigned Tasks
* Update Task Status
* Upload Work Files
* Team Chat
* Productivity Tracking
* AI Assistant
* Smart Reminders
* Achievement Badges
* XP & Leaderboard System

---

# 🎤 Voice Assistant

* Voice Commands
* Speech Recognition
* AI Voice Responses
* Task Creation via Voice
* Report Generation via Voice

---

# 🌌 Futuristic UI/UX

* Glassmorphism Design
* Neon Gradients
* 3D Dashboard Effects
* Framer Motion Animations
* Interactive Cards
* Smooth Page Transitions
* Dark/Light Mode
* Responsive Design

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Tailwind CSS
* Redux Toolkit
* React Router DOM
* Framer Motion
* Axios
* Recharts
* Three.js
* React Icons
* Socket.IO Client

## Backend

* Node.js
* Express.js
* Socket.IO
* MVC Architecture

## Database

* MongoDB Atlas
* Mongoose

## AI & Automation

* OpenAI API / Gemini API
* SpeechRecognition API
* Node Cron
* Nodemailer

## Cloud & Uploads

* Cloudinary
* Multer

## Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Database)

---

# 📂 Project Structure

## Frontend Structure

frontend/
│
├── src/
│ ├── components/
│ ├── pages/
│ ├── layouts/
│ ├── redux/
│ ├── services/
│ ├── hooks/
│ ├── charts/
│ ├── AI/
│ ├── voiceAssistant/
│ ├── animations/
│ └── utils/

---

## Backend Structure

backend/
│
├── controllers/
├── routes/
├── models/
├── middleware/
├── services/
├── sockets/
├── AI/
├── cronJobs/
├── config/
└── utils/

---

# ⚙️ Installation Guide

## 1️⃣ Clone Repository

git clone YOUR_GITHUB_REPO_LINK

cd tasknova-ai

---

# 📦 Install Dependencies

## Frontend

cd frontend

npm install

## Backend

cd backend

npm install

---

# 🔑 Environment Variables

## Backend .env

PORT=5000

MONGO_URI=YOUR_MONGODB_ATLAS_URI

JWT_SECRET=YOUR_SECRET_KEY

OPENAI_API_KEY=YOUR_OPENAI_KEY

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME

CLOUDINARY_API_KEY=YOUR_API_KEY

CLOUDINARY_API_SECRET=YOUR_SECRET

EMAIL_USER=YOUR_EMAIL

EMAIL_PASS=YOUR_PASSWORD

CLIENT_URL=http://localhost:3000

---

# ▶️ Run Application

## Start Backend

cd backend

npm run dev

## Start Frontend

cd frontend

npm start

---

# 🌍 Deployment

## Frontend Deployment

Deploy frontend on:

* Vercel

## Backend Deployment

Deploy backend on:

* Render

## Database

Use:

* MongoDB Atlas

---

# 🔐 Authentication Flow

## Admin Signup

* Full Name
* Email
* Company ID
* Organization Name
* Password

## Member Signup

* Full Name
* Email
* Company ID
* Password

---

# 📌 Important Member Assignment Logic

When Admin assigns tasks:

* Only registered members under the same Company ID are shown.
* Member list is fetched dynamically from MongoDB.
* No dummy/static users are used.
* Members instantly receive:

  * Real-time notifications
  * Email alerts
  * Dashboard updates
  * Activity feed updates

---

# 📡 APIs

## Authentication APIs

* POST /api/auth/register
* POST /api/auth/login

## User APIs

* GET /api/users/company-members

## Task APIs

* POST /api/tasks/create
* PUT /api/tasks/update
* DELETE /api/tasks/delete

## Project APIs

* POST /api/projects/create
* GET /api/projects/all

## Notification APIs

* GET /api/notifications

---

# 📈 Future Enhancements

* AI Burnout Detection
* AI Resume Builder
* AI Meeting Notes Generator
* Smart Attendance System
* AI Productivity Forecasting
* Mobile Application
* Video Meetings
* AI Workflow Automation

---

# 👩‍💻 Developed By

Charitha Narayana

B.Tech CSE Student | AI Enthusiast | Full Stack Developer

---

# ⭐ Final Goal

TaskNova AI is designed to feel like a billion-dollar futuristic SaaS platform with:

* Enterprise-grade architecture
* AI-powered automation
* Premium UI/UX
* Real-time collaboration
* Intelligent productivity management
* Startup-level innovation

This is NOT a normal CRUD project.
It is a next-generation AI productivity ecosystem.
