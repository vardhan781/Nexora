import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import AttendanceCard from "../components/Dashboard/AttendanceCard";
import ProgressCard from "../components/Dashboard/ProgressCard";
import LeaveBalanceCard from "../components/Dashboard/LeaveBalanceCard";
import AttendanceCalendar from "../components/Dashboard/AttendanceCalendar";
import AttendanceDetailsModal from "../components/Dashboard/AttendanceDetailsModal";
import LeaveBalanceModal from "../components/Dashboard/LeaveBalanceModal";

const Dashboard = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceCalendar, setAttendanceCalendar] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const [todayRes, calendarRes, leaveBalanceRes] = await Promise.all([
        api.get("/attendance/today"),
        api.get(`/attendance/calendar?month=${month}&year=${year}`),
        api.get("/leave-balance/my"),
      ]);

      setTodayAttendance(todayRes.data.data);
      setAttendanceCalendar(calendarRes.data.data);
      setLeaveBalances(leaveBalanceRes.data.data);
    } catch (error) {
      console.error(
        error.response?.data?.message || "Failed to fetch dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-in");

      await fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Clock-in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await api.post("/attendance/clock-out");

      await fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Clock-out failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectAttendance = (attendanceItem) => {
    setSelectedAttendance(attendanceItem);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full">
        <AttendanceCard
          attendance={todayAttendance}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          loading={actionLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <AttendanceCalendar onSelectAttendance={handleSelectAttendance} />
        </div>

        <div className="xl:col-span-1 space-y-6">
          <ProgressCard attendance={todayAttendance} />

          <LeaveBalanceCard
            leaveBalances={leaveBalances}
            onViewDetails={() => setIsLeaveOpen(true)}
          />
        </div>
      </div>

      <AttendanceDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        attendance={selectedAttendance}
      />

      <LeaveBalanceModal
        open={isLeaveOpen}
        onOpenChange={setIsLeaveOpen}
        leaveBalances={leaveBalances}
      />
    </div>
  );
};

export default Dashboard;
