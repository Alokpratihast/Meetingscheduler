# Teacher Meeting Scheduler & Attendance Management System

## Overview

Teacher Meeting Scheduler is a full-stack web application that streamlines meeting scheduling between teachers and candidates. It integrates Google OAuth, Google Calendar, and Google Meet to automate scheduling, attendance tracking, analytics, and administrative workflows.

The platform eliminates manual scheduling conflicts, simplifies meeting management, and provides real-time attendance and reporting.

---

# Features

## Authentication

* Google OAuth 2.0 Login
* NextAuth v5 Authentication
* Role-Based Access Control

  * Admin
  * Teacher
  * Candidate
* Candidate Approval Workflow

---

## Meeting Management

* Create Meetings
* Update Meetings
* Cancel Meetings
* Google Meet Link Generation
* Google Calendar Integration
* Meeting Conflict Detection
* Teacher Availability Validation
* Blocked Slot Validation

---

## Attendance Management

* Join Attendance Tracking
* Attendance Analytics
* Attendance Duration Tracking
* Meeting Participation Logs

---

## Teacher Management

* Add Teacher
* Update Teacher
* Delete Teacher
* Working Days Management
* Working Hours Management
* Blocked Slots

---

## Analytics

* Total Meetings
* Pending Meetings
* Completed Meetings
* Cancelled Meetings
* Attendance Reports
* Dashboard Analytics

---

## Audit Logs

* Meeting Activity Logs
* User Activity Logs
* Administrative Logs

---

## API Documentation

* Swagger UI
* REST API Documentation
* Request & Response Examples

---

## Technology Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* NextAuth v5
* Google OAuth

### Database

* MongoDB Atlas
* Mongoose

### Third Party Integrations

* Google Calendar API
* Google Meet
* Gmail OAuth

### Deployment

* Vercel
* Docker
* Docker Compose

---

# Project Structure

```
src
├── app
│   ├── api
│   ├── dashboard
│   └── login
├── components
├── lib
├── models
├── types
└── utils
```

---

# Prerequisites

* Node.js 20+
* MongoDB Atlas
* Google Cloud Console Project
* Docker Desktop (Optional)

---

# Installation

Clone the repository

```bash
git clone https://github.com/Alokpratihast/Meetingscheduler.git
cd Meetingscheduler
```

Install dependencies

```bash
npm install
```

Create environment file

```bash
cp .env.example .env.local
```

Run development server

```bash
npm run dev
```

Application

```
http://localhost:3000
```

---

# Environment Variables

```env
MONGODB_URI=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

AUTH_SECRET=
AUTH_TRUST_HOST=true

NEXTAUTH_URL=http://localhost:3000

ADMIN_EMAILS=admin@gmail.com
```

---

# Production Build

```bash
npm run build
npm start
```

---

# Docker

Build Docker Image

```bash
docker build -t meeting-scheduler .
```

Run Container

```bash
docker run --env-file .env.local -p 3000:3000 meeting-scheduler
```

Using Docker Compose

```bash
docker compose up --build
```

Stop Containers

```bash
docker compose down
```

---

# API Documentation

### Local

```
http://localhost:3000/api/docs
```

### Production

```
https://meetingscheduler-5cn1.vercel.app/api/docs
```

---

# Live Demo

Production URL

```
https://meetingscheduler-5cn1.vercel.app
```

---

# Available Modules

* Authentication
* Candidate Approval
* Teacher Management
* Teacher Availability
* Blocked Slots
* Meeting Scheduling
* Google Calendar Integration
* Google Meet Integration
* Attendance Tracking
* Attendance Analytics
* Dashboard Analytics
* Audit Logs
* Swagger Documentation

---

# Deployment

The application is deployed on Vercel.

Every push to the `main` branch automatically triggers a new deployment.

```bash
git add .
git commit -m "Update project"
git push origin main
```

---

# Future Enhancements

* Email Reminder Scheduler
* Recurring Meetings
* Calendar Synchronization
* Export Reports (PDF/Excel)
* Meeting Recording Support
* Push Notifications

---

# Author

**Alok Pratihast**

GitHub

https://github.com/Alokpratihast/Meetingscheduler

---

# License

This project was developed as part of the **Teacher Meeting Scheduler & Attendance Management System** assignment for educational and evaluation purposes.
