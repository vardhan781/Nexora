import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Select } from "../Select";
import api from "../../api/axios";
import { toast } from "sonner";
import { User, Layers, Calendar, Bookmark } from "lucide-react";

export const UpsertLeaveBalanceModal = ({
  open,
  onCancel,
  onSubmit,
  leaveBalanceData,
  loading,
}) => {
  const isEditMode = !!leaveBalanceData;

  const employeeRef = useRef(null);
  const leaveTypeRef = useRef(null);
  const allocatedDaysRef = useRef(null);
  const yearRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const [formData, setFormData] = useState({
    employee: "",
    leaveType: "",
    allocatedDays: "",
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      setDropdownLoading(true);
      try {
        const [empRes, typeRes] = await Promise.all([
          api.get("/employees/employees"),
          api.get("/leave-types/leave-types"),
        ]);
        setEmployees(empRes.data.data || []);
        setLeaveTypes(typeRes.data.data || []);
      } catch (err) {
        console.error("Error loading dropdown data:", err);
        toast.error("Failed to load employee or leave type lists");
      } finally {
        setDropdownLoading(false);
      }
    };

    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (isEditMode && leaveBalanceData) {
        setFormData({
          employee:
            leaveBalanceData.employee?._id || leaveBalanceData.employee || "",
          leaveType:
            leaveBalanceData.leaveType?._id || leaveBalanceData.leaveType || "",
          allocatedDays: leaveBalanceData.allocatedDays ?? "",
          year: leaveBalanceData.year || new Date().getFullYear(),
        });
      } else {
        setFormData({
          employee: "",
          leaveType: "",
          allocatedDays: "",
          year: new Date().getFullYear(),
        });
      }
    }
  }, [open, isEditMode, leaveBalanceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value,
    }));
  };

  const handleConfirmSubmit = () => {
    const isEmpValid = employeeRef.current?.validate();
    const isLeaveValid = leaveTypeRef.current?.validate();
    const isDaysValid = allocatedDaysRef.current?.validate();
    const isYearValid = yearRef.current?.validate();

    if (!isEmpValid || !isLeaveValid || !isDaysValid || !isYearValid) {
      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;
    onSubmit(formData);
  };

  const employeeOptions = employees.map((emp) => ({
    label:
      `${emp.firstName || ""} ${emp.lastName || ""} (${emp.employeeCode || ""})`.trim(),
    value: emp._id,
  }));

  const leaveTypeOptions = leaveTypes.map((type) => ({
    label: `${type.name || ""} (${type.code || ""})`.trim(),
    value: type._id,
  }));

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (!isFormValidRef.current) {
            isFormValidRef.current = true;
            return;
          }
          if (onCancel) onCancel();
        }
      }}
      onConfirm={handleConfirmSubmit}
      loading={loading || dropdownLoading}
      title={
        isEditMode ? "Edit Leave Balance Allocation" : "Allocate New Leave"
      }
      confirmText={isEditMode ? "Save Changes" : "Allocate Leave"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            ref={employeeRef}
            name="employee"
            label="Select Employee"
            placeholder={dropdownLoading ? "Loading" : "Select an employee"}
            value={formData.employee}
            onChange={handleChange}
            options={employeeOptions}
            required={true}
            requiredMessage="Employee selection is required"
            leftIcon={<User className="w-4 h-4" />}
            disabled={isEditMode}
          />

          <Select
            ref={leaveTypeRef}
            name="leaveType"
            label="Leave Type"
            placeholder={
              dropdownLoading ? "Loading" : "Select a leave category"
            }
            value={formData.leaveType}
            onChange={handleChange}
            options={leaveTypeOptions}
            required={true}
            requiredMessage="Leave type is required"
            leftIcon={<Layers className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={allocatedDaysRef}
            type="number"
            name="allocatedDays"
            label="Allocated Days"
            placeholder="15"
            value={formData.allocatedDays}
            onChange={handleChange}
            min="0"
            required={true}
            requiredMessage="Allocation count is required"
            leftIcon={<Bookmark className="w-4 h-4" />}
          />

          <Input
            ref={yearRef}
            type="number"
            name="year"
            label="Year"
            placeholder="2026"
            value={formData.year}
            onChange={handleChange}
            required={true}
            requiredMessage="Target allocation year is required"
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>
      </div>
    </Modal>
  );
};
