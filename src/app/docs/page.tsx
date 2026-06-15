"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";



const spec = {
  openapi: "3.0.0",

  info: {
    title: "Teacher Meeting Scheduler API",
    version: "1.0.0",
    description:
      "Teacher Meeting Scheduler API with Google Calendar, Google Meet, Attendance Tracking, Audit Logs and Teacher Availability Management.",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Development Server",
    },
  ],

  tags: [
    {
      name: "Meetings",
      description: "Meeting Management APIs",
    },
    {
      name: "Teachers",
      description: "Teacher Management APIs",
    },
    {
      name: "Users",
      description: "User Management APIs",
    },
    {
      name: "Attendance",
      description: "Attendance Tracking APIs",
    },
    {
      name: "Audit Logs",
      description: "System Audit APIs",
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
      Teacher: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "685f1234567890",
          },

          name: {
            type: "string",
            example: "Dr. Anup Sharma",
          },

          email: {
            type: "string",
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

          isActive: {
            type: "boolean",
            example: true,
          },
        },
      },

      Meeting: {
        type: "object",

        properties: {
          title: {
            type: "string",
            example: "React Interview",
          },

          description: {
            type: "string",
            example: "Technical Round",
          },

          teacherId: {
            type: "string",
            example: "685f1234567890",
          },

          studentName: {
            type: "string",
            example: "Alok Pratihast",
          },

          studentEmail: {
            type: "string",
            example: "alok@gmail.com",
          },

          meetingDate: {
            type: "string",
            example: "2026-06-25",
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
            example: "approved",
          },

          googleMeetLink: {
            type: "string",
            example: "https://meet.google.com/abc-defg-hij",
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
            example: "685f1234567890",
          },
        },
      },
    },
  },

  

  security: [
    {
      bearerAuth: [],
    },
  ],

  paths: {
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
          },

          401: {
            description:
              "Authentication required",
          },
        },
      },

      post: {
        tags: ["Meetings"],

        summary: "Create Meeting",

        description:
          "Creates meeting, generates Google Meet link and sends calendar invitations.",

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
              "Validation error",
          },

          409: {
            description:
              "Meeting conflict detected",
          },
        },
      },
    },

    "/api/teachers": {
      get: {
        tags: ["Teachers"],

        summary: "Get Teachers",

        description:
          "Returns active teachers.",

        responses: {
          200: {
            description:
              "Teachers fetched successfully",
          },
        },
      },

      post: {
        tags: ["Teachers"],

        summary: "Create Teacher",

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
        },
      },
    },

    "/api/users": {
      get: {
        tags: ["Users"],

        summary: "Get Users",

        responses: {
          200: {
            description:
              "Users fetched successfully",
          },
        },
      },
    },
  },
};

export default function ApiDocsPage() {
  return <SwaggerUI spec={spec} />;
}