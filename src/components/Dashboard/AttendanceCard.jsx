import React from "react";
import { Card } from "../Card";
import { Button } from "../Button";
import { StatusBadge } from "../StatusBadge";
import { Clock3, LogIn, LogOut, CalendarClock } from "lucide-react";
import StatItem from "./StatItem";

const AttendanceCard = ({
  attendance,
  onClockIn,
  onClockOut,
  loading = false,
}) => {
  if (!attendance) return null;

  const badgeVariant = {
    PRESENT: "success",
    HALF_DAY: "warning",
    ABSENT: "danger",
  };

  return (
    <Card title="Today's Attendance" description="Manage today's attendance.">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="w-fit max-w-full">
            <StatusBadge
              text={attendance.attendanceStatus?.name ?? "Not Clocked In"}
              variant={
                badgeVariant[attendance.attendanceStatus?.code] || "default"
              }
            />
          </div>

          <div className="flex gap-2 sm:justify-end">
            {attendance.canClockIn && (
              <Button
                leftIcon={<LogIn size={17} />}
                onClick={onClockIn}
                isLoading={loading}
                size="sm"
              >
                Clock In
              </Button>
            )}

            {attendance.canClockOut && (
              <Button
                variant="danger"
                leftIcon={<LogOut size={17} />}
                onClick={onClockOut}
                isLoading={loading}
                size="sm"
              >
                Clock Out
              </Button>
            )}
          </div>
        </div>

        <div
          className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-3
          "
        >
          <StatItem
            icon={<LogIn size={16} />}
            label="Check In"
            value={
              attendance.checkInTime
                ? new Date(attendance.checkInTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"
            }
          />

          <StatItem
            icon={<LogOut size={16} />}
            label="Check Out"
            value={
              attendance.checkOutTime
                ? new Date(attendance.checkOutTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"
            }
          />

          <StatItem
            icon={<Clock3 size={16} />}
            label={`Shift${attendance.shift?.name ? ` (${attendance.shift.name})` : ""}`}
            value={`${attendance.shift?.startTime} - ${attendance.shift?.endTime}`}
          />

          <StatItem
            icon={<CalendarClock size={16} />}
            label="Expected Out"
            value={attendance.expectedCheckoutTime}
          />
        </div>
      </div>
    </Card>
  );
};

export default AttendanceCard;
