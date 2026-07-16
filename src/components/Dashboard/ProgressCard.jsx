import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../Card";
import { Progress } from "../Progress";
import { Timer, Clock3, AlarmClock, TrendingUp } from "lucide-react";
import StatItem from "./StatItem";

const ProgressCard = ({ attendance }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!attendance?.checkInTime || attendance?.checkOutTime) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [attendance]);

  const liveWorkedHours = useMemo(() => {
    if (!attendance?.checkInTime) return 0;

    if (attendance.checkOutTime) {
      return attendance.totalHours;
    }

    return (
      (currentTime - new Date(attendance.checkInTime).getTime()) /
      (1000 * 60 * 60)
    );
  }, [attendance, currentTime]);

  const liveProgress = useMemo(() => {
    return Math.min((liveWorkedHours / attendance.requiredHours) * 100, 100);
  }, [attendance, liveWorkedHours]);

  const liveRemainingHours = useMemo(() => {
    return Math.max(0, attendance.requiredHours - liveWorkedHours);
  }, [attendance, liveWorkedHours]);

  const liveOvertimeHours = useMemo(() => {
    return Math.max(0, liveWorkedHours - attendance.requiredHours);
  }, [attendance, liveWorkedHours]);

  if (!attendance) return null;

  return (
    <Card title="Today's Progress" description="Track today's working hours.">
      <div className="space-y-6">
        <Progress value={liveProgress} color="success" label="Work Progress" />

        <div className="grid grid-cols-2 gap-5">
          <StatItem
            icon={<Timer size={18} />}
            label="Worked Hours"
            value={`${liveWorkedHours.toFixed(2)} hrs`}
          />

          <StatItem
            icon={<Clock3 size={18} />}
            label="Remaining"
            value={`${liveRemainingHours.toFixed(2)} hrs`}
          />

          <StatItem
            icon={<AlarmClock size={18} />}
            label="Late"
            value={`${attendance.lateMinutes} mins`}
            valueClassName={
              attendance.lateMinutes > 0 ? "text-warning" : "text-success"
            }
          />

          <StatItem
            icon={<TrendingUp size={18} />}
            label="Overtime"
            value={`${liveOvertimeHours.toFixed(2)} hrs`}
            valueClassName="text-success"
          />
        </div>
      </div>
    </Card>
  );
};

export default ProgressCard;
