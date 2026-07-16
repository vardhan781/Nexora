import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { Modal } from "../Modal";
import { Select } from "../Select";
import { toast } from "sonner";

export const UpsertPayrollModal = ({
  open,
  onCancel,
  onSubmit,
  loading,
  employees,
  employeeLoading,
}) => {
  const employeeRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    employee: "",
    payrollMonth: "",
    payrollYear: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!open) return;

    setFormData({
      employee: "",
      payrollMonth: "",
      payrollYear: new Date().getFullYear(),
    });
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();

  const yearOptions = Array.from({ length: 5 }, (_, index) => ({
    value: currentYear - 2 + index,
    label: String(currentYear - 2 + index),
  }));

  const handleConfirmSubmit = () => {
    const isEmployeeValid = employeeRef.current?.validate();
    const isMonthValid = monthRef.current?.validate();
    const isYearValid = yearRef.current?.validate();

    if (!isEmployeeValid || !isMonthValid || !isYearValid) {
      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;

    onSubmit(formData);
  };

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

          if (onCancel) {
            onCancel();
          }
        }
      }}
      onConfirm={handleConfirmSubmit}
      loading={loading || employeeLoading}
      title="Generate Payroll"
      confirmText="Generate Payroll"
      cancelText="Cancel"
      size="md"
    >
      <div className="space-y-5">
        <Select
          ref={employeeRef}
          label="Employee"
          name="employee"
          placeholder="Select Employee"
          value={formData.employee}
          options={employees}
          onChange={handleChange}
          required
          requiredMessage="Employee is required"
        />

        <Select
          ref={monthRef}
          label="Payroll Month"
          name="payrollMonth"
          placeholder="Select Month"
          value={formData.payrollMonth}
          options={monthOptions}
          onChange={handleChange}
          required
          requiredMessage="Payroll month is required"
        />

        <Select
          ref={yearRef}
          label="Payroll Year"
          name="payrollYear"
          placeholder="Select Year"
          value={formData.payrollYear}
          options={yearOptions}
          onChange={handleChange}
          required
          requiredMessage="Payroll year is required"
        />
      </div>
    </Modal>
  );
};
