import React from "react";
import { Modal } from "../Modal";
import { StatusBadge } from "../StatusBadge";
import StatItem from "./StatItem";
import {
  Calendar,
  Clock3,
  LogIn,
  LogOut,
  Timer,
  AlarmClock,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "../../utils/dateUtils";

const badgeVariant = {
  PRESENT: "success",
  HALF_DAY: "warning",
  ABSENT: "danger",
};

const formatTime = (time) => {
  if (!time) return "-";

  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AttendanceDetailsModal = ({ open, onOpenChange, attendance }) => {
  if (!attendance) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Attendance Details"
      showFooter={false}
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <StatusBadge
            text={attendance.dayLabel}
            variant={badgeVariant[attendance.status] || "default"}
          />

          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar size={16} />
            <span>{formatDate(attendance.date)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <StatItem
            icon={<LogIn size={18} />}
            label="Check In"
            value={formatTime(attendance.checkInTime)}
          />

          <StatItem
            icon={<LogOut size={18} />}
            label="Check Out"
            value={formatTime(attendance.checkOutTime)}
          />

          <StatItem
            icon={<Timer size={18} />}
            label="Worked Hours"
            value={`${attendance.totalHours ?? 0} hrs`}
          />

          <StatItem
            icon={<AlarmClock size={18} />}
            label="Late Minutes"
            value={`${attendance.lateMinutes ?? 0} mins`}
          />

          <StatItem
            icon={<TrendingUp size={18} />}
            label="Overtime"
            value={`${attendance.overtimeHours ?? 0} hrs`}
            valueClassName="text-success"
          />

          <StatItem
            icon={<Clock3 size={18} />}
            label="Status"
            value={
              attendance.status === "HOLIDAY"
                ? `${attendance.dayLabel} (${attendance.holidayName})`
                : attendance.dayLabel
            }
          />
        </div>
      </div>
    </Modal>
  );
};

export default AttendanceDetailsModal;
