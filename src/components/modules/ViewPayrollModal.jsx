import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Modal } from "../Modal";
import { toast } from "sonner";
import { formatDate } from "../../utils/dateUtils";
import Loader from "../Loader";

const ViewPayrollModal = ({ open, payrollId, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [payroll, setPayroll] = useState(null);

  const fetchPayroll = async () => {
    if (!payrollId) return;

    try {
      setLoading(true);

      const res = await api.get(`/payroll/${payrollId}`);

      if (res.data.success) {
        setPayroll(res.data.data);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to fetch payroll details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setPayroll(null);
      return;
    }

    fetchPayroll();
  }, [open, payrollId]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOpenChange={(isOpen) => {
        if (!isOpen && onCancel) {
          onCancel();
        }
      }}
      title="Payroll Details"
      size="2xl"
      showFooter={false}
    >
      <div className="min-h-[60vh]">
        {loading ? (
          <Loader />
        ) : !payroll ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-muted-foreground">Payroll not found.</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-5">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Employee Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="font-medium">
                    {payroll.employee.employeeCode} -{" "}
                    {payroll.employee.firstName} {payroll.employee.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {payroll.employee.department?.name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Designation</p>
                  <p className="font-medium">
                    {payroll.employee.designation?.name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Payroll Period
                  </p>
                  <p className="font-medium">
                    {payroll.payrollMonth}/{payroll.payrollYear}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Generated On</p>
                  <p className="font-medium">
                    {formatDate(payroll.generatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-5">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Attendance Summary
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Working</p>
                  <p className="text-lg font-semibold">{payroll.workingDays}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Present</p>
                  <p className="text-lg font-semibold">{payroll.presentDays}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Leave</p>
                  <p className="text-lg font-semibold">{payroll.leaveDays}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Absent</p>
                  <p className="text-lg font-semibold">{payroll.absentDays}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Payable</p>
                  <p className="text-lg font-semibold">{payroll.payableDays}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-5">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Salary Components
              </h3>

              <div className="space-y-3">
                {payroll.salaryStructure.map((component) => (
                  <div
                    key={component.salaryComponent._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {component.salaryComponent.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {component.salaryComponent.componentType}
                      </p>
                    </div>

                    <span className="font-semibold">
                      ₹ {Number(component.value).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border p-5">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Salary Summary
              </h3>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>Gross Salary</span>

                  <span className="font-medium">
                    ₹ {Number(payroll.grossSalary).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>Total Earnings</span>

                  <span className="font-medium text-success">
                    ₹ {Number(payroll.totalEarnings).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span>Total Deductions</span>

                  <span className="font-medium text-destructive">
                    ₹ {Number(payroll.totalDeductions).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t border-border pt-3 flex flex-col sm:flex-row sm:justify-between gap-1 text-lg font-semibold">
                  <span>Net Salary</span>

                  <span>
                    ₹ {Number(payroll.netSalary).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewPayrollModal;
