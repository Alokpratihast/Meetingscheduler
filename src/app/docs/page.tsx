"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const spec = {
  openapi: "3.0.3",

  info: {
    title: "Teacher Meeting Scheduler API",
    version: "1.0.0",

    description: `
# Teacher Meeting Scheduler API

Enterprise Meeting Scheduling Platform built with

- Next.js 16
- NextAuth v5
- MongoDB
- Google OAuth
- Google Calendar
- Google Meet
- Docker

---

## Features

- Google Authentication
- Role Based Access
- Teacher Management
- Candidate Approval
- Meeting Scheduling
- Google Calendar Integration
- Google Meet Integration
- Attendance Tracking
- Teacher Availability
- Blocked Slots
- Analytics Dashboard
- Audit Logs

---

## Roles

### Admin

- Manage Teachers
- Approve Candidates
- View Analytics
- View Audit Logs

### Teacher

- Manage Availability
- Create Meetings
- Join Meetings
- Mark Meetings Completed

### Candidate

- Book Meetings
- Join Meetings
- View Meeting History

`,

    contact: {
      name: "Alok Pratihast",
      email: "alokpratihast05@gmail.com",
    },

    license: {
      name: "MIT",
    },
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Development",
    },
    {
      url: "https://YOUR-VERCEL-URL.vercel.app",
      description: "Production",
    },
  ],

  tags: [
    {
      name: "Authentication",
      description: "Google OAuth Authentication APIs",
    },

    {
      name: "Users",
      description: "Candidate & User APIs",
    },

    {
      name: "Teachers",
      description: "Teacher Management",
    },

    {
      name: "Meetings",
      description: "Meeting Scheduling",
    },

    {
      name: "Attendance",
      description: "Attendance Tracking",
    },

    {
      name: "Analytics",
      description: "Dashboard Analytics",
    },

    {
      name: "Audit Logs",
      description: "System Audit Logs",
    },

    {
      name: "Health",
      description: "Application Health",
    },
  ],

  security: [
    {
      bearerAuth: [],
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      User: {
  type: "object",
  properties: {
    _id: {
      type: "string",
      example: "685f9d94f4320a1b98d12345",
    },
    name: {
      type: "string",
      example: "Alok Pratihast",
    },
    email: {
      type: "string",
      format: "email",
      example: "alok@gmail.com",
    },
    role: {
      type: "string",
      enum: ["admin", "teacher", "candidate"],
      example: "candidate",
    },
    isApproved: {
      type: "boolean",
      example: true,
    },
    image: {
      type: "string",
      nullable: true,
    },
    lastLogin: {
      type: "string",
      format: "date-time",
    },
  },
},

Teacher: {
  type: "object",
  required: [
    "name",
    "email",
    "department",
    "designation",
  ],
  properties: {
    _id: {
      type: "string",
      example: "685f9d94f4320a1b98d12345",
    },
    name: {
      type: "string",
      example: "Dr. Anup Sharma",
    },
    email: {
      type: "string",
      format: "email",
      example: "teacher@gmail.com",
    },
    department: {
      type: "string",
      example: "Computer Science",
    },
    designation: {
      type: "string",
      example: "Professor",
    },
    bio: {
      type: "string",
    },
    expertise: {
      type: "array",
      items: {
        type: "string",
      },
    },
    isActive: {
      type: "boolean",
      example: true,
    },
  },
},

Meeting: {
  type: "object",
  required: [
    "title",
    "teacherId",
    "studentName",
    "studentEmail",
    "meetingDate",
    "startTime",
    "endTime",
  ],
  properties: {
    _id: {
      type: "string",
    },

    title: {
      type: "string",
      example: "React Interview",
    },

    description: {
      type: "string",
      example: "Technical Interview",
    },

    teacherId: {
      type: "string",
      example: "685f9d94f4320a1b98d12345",
    },

    studentName: {
      type: "string",
      example: "Alok Pratihast",
    },

    studentEmail: {
      type: "string",
      format: "email",
      example: "alok@gmail.com",
    },

    meetingDate: {
      type: "string",
      format: "date",
      example: "2026-07-20",
    },

    startTime: {
      type: "string",
      example: "10:00",
    },

    endTime: {
      type: "string",
      example: "11:00",
    },

    status: {
      type: "string",
      enum: [
        "pending",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ],
      example: "approved",
    },

    notes: {
      type: "string",
    },

    googleMeetLink: {
      type: "string",
      example:
        "https://meet.google.com/abc-defg-hij",
    },

    googleEventId: {
      type: "string",
    },
  },
},

Attendance: {
  type: "object",
  properties: {
    meetingId: {
      type: "string",
    },

    joinedAt: {
      type: "string",
      format: "date-time",
    },

    leftAt: {
      type: "string",
      format: "date-time",
      nullable: true,
    },

    duration: {
      type: "number",
      example: 42,
    },
  },
},

BlockedSlot: {
  type: "object",
  properties: {
    date: {
      type: "string",
      format: "date",
      example: "2026-07-20",
    },

    startTime: {
      type: "string",
      example: "10:00",
    },

    endTime: {
      type: "string",
      example: "11:00",
    },

    reason: {
      type: "string",
      example: "Faculty Meeting",
    },
  },
},

AuditLog: {
  type: "object",
  properties: {
    action: {
      type: "string",
      example: "MEETING_CREATED",
    },

    performedBy: {
      type: "string",
      example: "admin@gmail.com",
    },

    role: {
      type: "string",
      example: "admin",
    },

    entityType: {
      type: "string",
      example: "meeting",
    },

    entityId: {
      type: "string",
    },

    timestamp: {
      type: "string",
      format: "date-time",
    },
  },
},

SuccessResponse: {
  type: "object",
  properties: {
    success: {
      type: "boolean",
      example: true,
    },

    message: {
      type: "string",
      example: "Operation completed successfully",
    },
  },
},

ErrorResponse: {
  type: "object",
  properties: {
    success: {
      type: "boolean",
      example: false,
    },

    message: {
      type: "string",
      example: "Something went wrong",
    },
  },
},"/api/health": {
  get: {
    tags: ["Health"],

    summary: "Health Check",

    description:
      "Returns API health status.",

    responses: {
      200: {
        description: "API is healthy",

        content: {
          "application/json": {
            example: {
              success: true,
              status: "ok",
            },
          },
        },
      },
    },
  },
},

"/api/users": {
  get: {
    tags: ["Users"],

    summary: "Get All Users",

    description:
      "Returns all registered users.",

    responses: {
      200: {
        description:
          "Users fetched successfully",

        content: {
          "application/json": {
            example: {
              success: true,
              data: [],
            },
          },
        },
      },

      401: {
        description:
          "Authentication required",

        content: {
          "application/json": {
            schema: {
              $ref:
                "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
    },
  },
},

"/api/users/{id}/approve": {
  post: {
    tags: ["Users"],

    summary: "Approve Candidate",

    description:
      "Approves a candidate account. Does not change user role.",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,

        schema: {
          type: "string",
        },
      },
    ],

    responses: {
      200: {
        description:
          "Candidate approved successfully",

        content: {
          "application/json": {
            example: {
              success: true,
              message:
                "User approved successfully",
            },
          },
        },
      },

      404: {
        description: "User not found",
      },

      403: {
        description:
          "Only admins can approve users",
      },
    },
  },
},

"/api/teachers": {
  get: {
    tags: ["Teachers"],

    summary: "Get Teachers",

    description:
      "Returns all active teachers.",

    responses: {
      200: {
        description:
          "Teachers fetched successfully",

        content: {
          "application/json": {
            example: {
              success: true,
              data: [],
            },
          },
        },
      },
    },
  },

  post: {
    tags: ["Teachers"],

    summary: "Create Teacher",

    description:
      "Creates a new teacher profile.",

    requestBody: {
      required: true,

      content: {
        "application/json": {
          schema: {
            $ref:
              "#/components/schemas/Teacher",
          },
        },
      },
    },

    responses: {
      201: {
        description:
          "Teacher created successfully",
      },

      409: {
        description:
          "Teacher already exists",
      },

      400: {
        description:
          "Validation failed",
      },
    },
  },
},

"/api/teachers/{id}": {
  get: {
    tags: ["Teachers"],

    summary: "Get Teacher By ID",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,

        schema: {
          type: "string",
        },
      },
    ],

    responses: {
      200: {
        description:
          "Teacher fetched successfully",
      },

      404: {
        description:
          "Teacher not found",
      },
    },
  },

  patch: {
    tags: ["Teachers"],

    summary: "Update Teacher",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,

        schema: {
          type: "string",
        },
      },
    ],

    requestBody: {
      required: true,

      content: {
        "application/json": {
          schema: {
            $ref:
              "#/components/schemas/Teacher",
          },
        },
      },
    },

    responses: {
      200: {
        description:
          "Teacher updated successfully",
      },

      404: {
        description:
          "Teacher not found",
      },
    },
  },

  delete: {
    tags: ["Teachers"],

    summary: "Delete Teacher",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,

        schema: {
          type: "string",
        },
      },
    ],

    responses: {
      200: {
        description:
          "Teacher deleted successfully",
      },

      404: {
        description:
          "Teacher not found",
      },
    },
  },
},


"/api/teachers/availability": {
  get: {
    tags: ["Teachers"],

    summary: "Get Teacher Availability",

    description:
      "Returns teacher working days, working hours and blocked slots.",

    responses: {
      200: {
        description: "Availability fetched successfully",

        content: {
          "application/json": {
            example: {
              success: true,
              availability: {
                workingDays: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                ],

                workingHours: {
                  start: "09:00",
                  end: "17:00",
                },

                blockedSlots: [],
              },
            },
          },
        },
      },

      404: {
        description: "Teacher not found",
      },
    },
  },
},

"/api/teachers/blocked-slots": {
  post: {
    tags: ["Teachers"],

    summary: "Create Blocked Slot",

    description:
      "Blocks teacher availability for a specific date and time.",

    requestBody: {
      required: true,

      content: {
        "application/json": {
          schema: {
            $ref:
              "#/components/schemas/BlockedSlot",
          },
        },
      },
    },

    responses: {
      201: {
        description:
          "Blocked slot created successfully",
      },

      400: {
        description:
          "Invalid time or overlapping slot",
      },

      404: {
        description:
          "Teacher not found",
      },
    },
  },
},

"/api/teachers/blocked-slots/{id}": {
  delete: {
    tags: ["Teachers"],

    summary: "Delete Blocked Slot",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,

        schema: {
          type: "string",
        },
      },
    ],

    responses: {
      200: {
        description:
          "Blocked slot removed successfully",
      },

      404: {
        description:
          "Blocked slot not found",
      },
    },
  },
},

"/api/meetings": {
  get: {
    tags: ["Meetings"],

    summary: "Get Meetings",

    description:
      "Returns meetings based on logged-in user role.",

    responses: {
      200: {
        description:
          "Meetings fetched successfully",

        content: {
          "application/json": {
            example: {
              success: true,
              data: [],
            },
          },
        },
      },
    },
  },

  post: {
    tags: ["Meetings"],

    summary: "Create Meeting",

    description:
      "Creates meeting, checks availability, generates Google Calendar event and Google Meet link.",

    requestBody: {
      required: true,

      content: {
        "application/json": {
          schema: {
            $ref:
              "#/components/schemas/Meeting",
          },
        },
      },
    },

    responses: {
      201: {
        description:
          "Meeting created successfully",
      },

      400: {
        description:
          "Validation failed",
      },

      409: {
        description:
          "Meeting conflict detected",
      },
    },
  },
},

"/api/meetings/{id}": {
  get: {
    tags: ["Meetings"],

    summary: "Get Meeting Details",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,

        schema: {
          type: "string",
        },
      },
    ],

    responses: {
      200: {
        description:
          "Meeting fetched successfully",
      },

      404: {
        description:
          "Meeting not found",
      },
    },
  },

  patch: {
    tags: ["Meetings"],

    summary: "Update Meeting",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,

        schema: {
          type: "string",
        },
      },
    ],

    requestBody: {
      required: true,

      content: {
        "application/json": {
          schema: {
            $ref:
              "#/components/schemas/Meeting",
          },
        },
      },
    },

    responses: {
      200: {
        description:
          "Meeting updated successfully",
      },

      400: {
        description:
          "Validation failed",
      },

      404: {
        description:
          "Meeting not found",
      },
    },
  },

  delete: {
    tags: ["Meetings"],

    summary: "Cancel Meeting",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,

        schema: {
          type: "string",
        },
      },
    ],

    responses: {
      200: {
        description:
          "Meeting cancelled successfully",
      },

      404: {
        description:
          "Meeting not found",
      },
    },
  },
},
"/api/meetings/{id}/attendance": {
  post: {
    tags: ["Attendance"],

    summary: "Record Meeting Attendance",

    description:
      "Records participant attendance when joining a meeting.",

    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],

    requestBody: {
      required: true,
      content: {
        "application/json": {
          example: {
            action: "join",
          },
        },
      },
    },

    responses: {
      200: {
        description: "Attendance recorded successfully",

        content: {
          "application/json": {
            example: {
              success: true,
              message: "Attendance recorded successfully",
            },
          },
        },
      },

      404: {
        description: "Meeting not found",
      },
    },
  },
},

"/api/attendance/analytics": {
  get: {
    tags: ["Analytics"],

    summary: "Attendance Analytics",

    description:
      "Returns attendance analytics for dashboard.",

    responses: {
      200: {
        description: "Analytics fetched successfully",

        content: {
          "application/json": {
            example: {
              success: true,
              analytics: {
                totalMeetings: 42,
                attended: 36,
                missed: 6,
                attendancePercentage: 85.7,
              },
            },
          },
        },
      },
    },
  },
},

"/api/audit-logs": {
  get: {
    tags: ["Audit Logs"],

    summary: "Get Audit Logs",

    description:
      "Returns system audit logs for administrators.",

    responses: {
  200: {
    description: "Audit logs fetched successfully",

    content: {
      "application/json": {
        example: {
          success: true,
          logs: [
            {
              action: "MEETING_CREATED",
              performedBy: "admin@gmail.com",
              role: "admin",
              entityType: "meeting",
              timestamp: "2026-07-15T10:20:00Z",
            },
          ],
        },
      },
    },
  }, // <-- YE MISSING THA

  403: {
    description: "Only admins can access audit logs",
  },
},

      403: {
        description: "Only admins can access audit logs",
      },
    },
  },
},

  },
};

export default function ApiDocsPage() {
  return (
    <SwaggerUI
      spec={spec}
      docExpansion="list"
      defaultModelsExpandDepth={2}
      defaultModelExpandDepth={2}
      displayRequestDuration
      filter
      tryItOutEnabled={false}
    />
  );
}