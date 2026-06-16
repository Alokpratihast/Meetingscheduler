type Props = {
  analytics: {
    totalMeetings: number;
    presentCount: number;
    absentCount: number;
    noShowCount: number;
    lateJoinCount: number;
    attendancePercentage: number;
    averageDuration: number;
  };
};

export default function AttendanceAnalytics({
  analytics,
}: Props) {
  const cards = [
    {
      title: "Total Meetings",
      value: analytics.totalMeetings,
    },
    {
      title: "Present",
      value: analytics.presentCount,
    },
    {
      title: "No Shows",
      value: analytics.noShowCount,
    },
    {
      title: "Late Joins",
      value: analytics.lateJoinCount,
    },
    {
      title: "Attendance %",
      value: `${analytics.attendancePercentage}%`,
    },
    {
      title: "Avg Duration",
      value: `${analytics.averageDuration} min`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Attendance Analytics
        </h1>

        <p className="text-slate-500 mt-2">
          Attendance insights and meeting engagement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="app-card p-6"
          >
            <p className="text-sm text-slate-500">
              {card.title}
            </p>

            <p className="mt-3 text-4xl font-bold">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}