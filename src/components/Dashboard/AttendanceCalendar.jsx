import React, { useEffect, useState } from "react";
import { Card } from "../Card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import api from "../../api/axios";
import AttendanceCalendarCell from "./AttendanceCalendarCell";

const AttendanceCalendar = ({ onSelectAttendance }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [attendance, setAttendance] = useState([]);

  const fetchAttendance = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();

      const response = await api.get(
        `/attendance/calendar?month=${month}&year=${year}`,
      );

      setAttendance(response.data.data || []);
    } catch (error) {
      console.error(
        error.response?.data?.message || "Failed to fetch attendance",
      );
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const attendanceMap = {};

  attendance.forEach((item) => {
    attendanceMap[item.day] = item;
  });

  const monthStart = startOfMonth(currentMonth);

  const monthEnd = endOfMonth(currentMonth);

  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const startingDay = (getDay(monthStart) + 6) % 7;

  const emptySlots = Array.from({
    length: startingDay,
  });

  return (
    <Card title="Attendance Calendar" description="Monthly attendance overview">
      <div className="flex justify-between items-center mb-5">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded hover:bg-muted cursor-pointer"
        >
          <ChevronLeft />
        </button>

        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded hover:bg-muted cursor-pointer"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center font-medium text-muted-foreground mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {emptySlots.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {days.map((day) => {
          const dayNumber = day.getDate();

          return (
            <AttendanceCalendarCell
              key={dayNumber}
              day={dayNumber}
              date={day}
              today={isToday(day)}
              attendance={attendanceMap[dayNumber]}
              onClick={onSelectAttendance}
            />
          );
        })}
      </div>
    </Card>
  );
};

export default AttendanceCalendar;
