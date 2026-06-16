# Teacher Meeting Scheduler & Attendance Management System

## Overview

A centralized platform for scheduling meetings with Google Meet, managing calendars, tracking attendance, generating analytics, and maintaining audit logs.

The system eliminates manual scheduling conflicts, attendance visibility gaps, missing reminders, and inconsistent reporting.

---

## Features

### Authentication

* Google OAuth 2.0 Login
* Role Based Access Control (Admin, Teacher, Candidate)
* Candidate Approval Workflow

### Meeting Management

* Create Meetings
* Update / Reschedule Meetings
* Cancel Meetings
* Google Meet Link Generation
* Google Calendar Integration
* Conflict Detection

### Attendance Tracking

* Join Attendance Tracking
* Leave Attendance Tracking
* Attendance Duration Calculation
* Late Join Detection
* Attendance Analytics

### Notifications

* 24 Hour Reminder
* 1 Hour Reminder
* 15 Minute Reminder

### Analytics & Reporting

* Attendance Dashboard
* Attendance Percentage
* No Show Tracking
* Average Duration Metrics
* Audit Logs

### Administration

* Teacher Management
* Candidate Approval
* Audit Log Monitoring

### Documentation

* Swagger/OpenAPI Documentation
* Docker Support
* Docker Compose Support

---

## Technology Stack

### Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* NextAuth.js
* Google OAuth

### Database

* MongoDB
* Mongoose

### Integrations

* Google Calendar API
* Google Meet
* Gmail OAuth

### Deployment

* Vercel
* Docker
* Docker Compose

---

## Prerequisites

* Node.js 20+
* MongoDB Atlas
* Google Cloud Project
* Docker Desktop (Optional)

---

## Installation

Clone Repository

## bash
git clone <repository-url>
cd Meetingscheduler
---

Install Dependencies

## bash
npm install
## 

Create Environment File

## bash
cp .env.example .env.local


Run Development Server

## bash
npm run dev
## 

Application URL:

## txt
http://localhost:3000
## 

---

## Environment Variables

Required variables:

## env
MONGODB_URI=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

AUTH_SECRET=
AUTH_TRUST_HOST=true

NEXTAUTH_URL=http://localhost:3000

## IN_EMAILS=
## 

---

## Production Build

## bash
npm run build
npm start
## 

---

## Docker Setup

Build Image

## bash
docker build -t meeting-scheduler .
## 

Run Container

## bash
docker run --env-file .env.local -p 3000:3000 meeting-scheduler
## 

Docker Compose

## bash
docker compose up --build
## 

Stop Containers

bash
docker compose down


---

## API Documentation

Swagger Documentation:

## txt
http://localhost:3000/docs
## 

Production:

## txt
https://meetingscheduler-5cn1.vercel.app/docs
## 

---

## Main Modules

* Authentication
* Meeting Scheduling
* Google Calendar Integration
* Google Meet Integration
* Attendance Tracking
* Attendance Analytics
* Audit Logs
* Teacher Availability Management

---

## Deployment

Production deployment is hosted on Vercel.

Deployment process:

## bash
git push origin main
## 

Vercel automatically builds and deploys the latest version.

---

## License

This project was developed as part of the Teacher Meeting Scheduler & Attendance Management System assignment.
