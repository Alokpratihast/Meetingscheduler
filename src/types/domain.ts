export type UserRole = "admin" | "teacher" | "candidate";

export type TeacherRecord = {
  _id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
};

export type MeetingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

export type AttendanceRecord = {
  userEmail: string;
  role: UserRole;
  joinedAt: string;
  leftAt?: string;
  durationMinutes?: number;
};

export type MeetingRecord = {
  _id: string;
  title: string;
  description?: string;
  meetingType?: string;
  studentName: string;
  studentEmail: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  status: MeetingStatus;
  notes?: string;
  googleMeetLink?: string;
  googleEventId?: string;
  timeZone?: string;
  organizerEmail?: string;
  createdAt?: string;
  teacherId?: TeacherRecord;
  attendance?: AttendanceRecord[];
};
