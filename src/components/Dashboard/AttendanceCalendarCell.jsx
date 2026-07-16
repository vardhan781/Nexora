import React from "react";
import { cn } from "../../utils/utils";

const statusStyles = {
  PRESENT: "bg-success/10 border-success/20 text-success hover:bg-success/20",

  ABSENT:
    "bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20",

  HALF_DAY: "bg-warning/10 border-warning/20 text-warning hover:bg-warning/20",

  WEEKLY_OFF:
    "bg-weekly-off/10 border-weekly-off/20 text-weekly-off hover:bg-weekly-off/20",

  HOLIDAY: "bg-holiday/10 border-holiday/20 text-holiday hover:bg-holiday/20",

  LEAVE: "bg-leave/10 border-leave/20 text-leave hover:bg-leave/20",

  default: "bg-card border-border hover:bg-muted",
};

const AttendanceCalendarCell = ({ day, attendance, onClick, today }) => {
  const status = attendance?.status || "default";

  return (
    <button
      onClick={() => attendance && onClick(attendance)}
      className={cn(
        `
        aspect-square
        rounded-xl
        border
        p-2
        transition-all
        duration-200
        flex
        flex-col
        justify-between
        cursor-pointer
        `,

        statusStyles[status],

        !attendance && "cursor-default",
      )}
    >
      <span className={cn("font-semibold text-sm", today && "font-bold")}>
        {day}
      </span>

      {attendance && (
        <span className="text-xs font-medium truncate">
          {attendance.dayLabel}
        </span>
      )}
    </button>
  );
};

export default AttendanceCalendarCell;
