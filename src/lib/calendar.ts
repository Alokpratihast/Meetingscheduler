import { google } from "googleapis";

type CalendarMeeting = {
  title: string;
  description?: string;
  notes?: string;
  studentEmail: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
};

function calendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
}

function eventBody(meeting: CalendarMeeting) {
  const start = `${meeting.meetingDate}T${meeting.startTime}:00`;
  const end = `${meeting.meetingDate}T${meeting.endTime}:00`;

  return {
    summary: meeting.title,
    description: [meeting.description, meeting.notes]
      .filter(Boolean)
      .join("\n\n"),
    attendees: [{ email: meeting.studentEmail }],
    start: {
      dateTime: start,
      timeZone: meeting.timeZone,
    },
    end: {
      dateTime: end,
      timeZone: meeting.timeZone,
    },
  };
}

export async function createCalendarEvent(
  accessToken: string,
  meeting: CalendarMeeting
) {
  const calendar = calendarClient(accessToken);
  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      ...eventBody(meeting),
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    },
  });

  return {
    eventId: event.data.id || "",
    meetLink:
      event.data.hangoutLink ||
      event.data.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === "video"
      )?.uri ||
      "",
  };
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  meeting: CalendarMeeting
) {
  const calendar = calendarClient(accessToken);
  await calendar.events.patch({
    calendarId: "primary",
    eventId,
    sendUpdates: "all",
    requestBody: eventBody(meeting),
  });
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
) {
  const calendar = calendarClient(accessToken);
  await calendar.events.delete({
    calendarId: "primary",
    eventId,
    sendUpdates: "all",
  });
}
