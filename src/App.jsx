import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./layout/MainLayout";
import Menus from "./pages/Menus";
import { Toaster } from "sonner";
import MenuRights from "./pages/MenuRights";
import Dashboard from "./pages/Dashboard";
import Roles from "./pages/Roles";
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import Designations from "./pages/Designations";
import EmployeeTypes from "./pages/EmployeeTypes";
import EmployeeStatus from "./pages/EmployeeStatus";
import Employees from "./pages/Employees";
import Holiday from "./pages/Holiday";
import Shift from "./pages/Shift";
import RequestStatus from "./pages/RequestStatus";
import AttendanceStatus from "./pages/AttendanceStatus";
import LeaveTypes from "./pages/LeaveType";
import LeaveBalance from "./pages/LeaveBalance";
import MyRequest from "./pages/MyRequest";
import LeaveApproval from "./pages/LeaveApproval";
import PayrollSettings from "./pages/PayrollSettings";
import SalaryComponents from "./pages/SalaryComponents";
import EmployeeSalary from "./pages/EmployeeSalary";
import Payroll from "./pages/Payroll";

const App = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        <Route
          path="/security/menus"
          element={
            <MainLayout>
              <Menus />
            </MainLayout>
          }
        />

        <Route
          path="/security/menu-rights"
          element={
            <MainLayout>
              <MenuRights />
            </MainLayout>
          }
        />

        <Route
          path="/security/roles"
          element={
            <MainLayout>
              <Roles />
            </MainLayout>
          }
        />

        <Route
          path="/security/users"
          element={
            <MainLayout>
              <Users />
            </MainLayout>
          }
        />

        <Route
          path="/masters/departments"
          element={
            <MainLayout>
              <Departments />
            </MainLayout>
          }
        />

        <Route
          path="/masters/designations"
          element={
            <MainLayout>
              <Designations />
            </MainLayout>
          }
        />

        <Route
          path="/masters/employee-types"
          element={
            <MainLayout>
              <EmployeeTypes />
            </MainLayout>
          }
        />

        <Route
          path="/masters/employee-status"
          element={
            <MainLayout>
              <EmployeeStatus />
            </MainLayout>
          }
        />

        <Route
          path="/manage/employees"
          element={
            <MainLayout>
              <Employees />
            </MainLayout>
          }
        />

        <Route
          path="/masters/holiday"
          element={
            <MainLayout>
              <Holiday />
            </MainLayout>
          }
        />

        <Route
          path="/masters/shift"
          element={
            <MainLayout>
              <Shift />
            </MainLayout>
          }
        />

        <Route
          path="/masters/request-status"
          element={
            <MainLayout>
              <RequestStatus />
            </MainLayout>
          }
        />

        <Route
          path="/masters/attendance-status"
          element={
            <MainLayout>
              <AttendanceStatus />
            </MainLayout>
          }
        />

        <Route
          path="/masters/leave-types"
          element={
            <MainLayout>
              <LeaveTypes />
            </MainLayout>
          }
        />

        <Route
          path="/manage/leave-balance"
          element={
            <MainLayout>
              <LeaveBalance />
            </MainLayout>
          }
        />

        <Route
          path="/leave/requests"
          element={
            <MainLayout>
              <MyRequest />
            </MainLayout>
          }
        />

        <Route
          path="/leave/approvals"
          element={
            <MainLayout>
              <LeaveApproval />
            </MainLayout>
          }
        />

        <Route
          path="/masters/payroll-settings"
          element={
            <MainLayout>
              <PayrollSettings />
            </MainLayout>
          }
        />

        <Route
          path="/masters/salary-components"
          element={
            <MainLayout>
              <SalaryComponents />
            </MainLayout>
          }
        />

        <Route
          path="/payroll/employee-salary"
          element={
            <MainLayout>
              <EmployeeSalary />
            </MainLayout>
          }
        />

        <Route
          path="/payroll/payroll"
          element={
            <MainLayout>
              <Payroll />
            </MainLayout>
          }
        />
      </Routes>
    </>
  );
};

export default App;
