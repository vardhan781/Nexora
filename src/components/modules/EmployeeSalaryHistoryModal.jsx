import React from "react";
import { Modal } from "../Modal";
import { IndianRupee, Calendar, FileText, User } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";

export const EmployeeSalaryHistoryModal = ({
  open,
  onCancel,
  history = [],
  employee,
  loading = false,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
      title="Employee Salary History"
      showFooter={false}
      size="2xl"
      loading={loading}
    >
      <div className="space-y-6">
        {employee && (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <User className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-semibold text-foreground">
                  {employee.firstName} {employee.lastName}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {employee.employeeCode || "Employee"}
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No salary history found.
          </div>
        )}

        <div className="space-y-6">
          {history.map((salary, index) => (
            <div key={salary._id || index} className="relative pl-8">
              {index !== history.length - 1 && (
                <div className="absolute left-2.75 top-6 bottom-0 w-px bg-border" />
              )}

              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>

              <div className="border border-border rounded-lg p-5 space-y-5 bg-background">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />

                  <span className="font-medium text-foreground">
                    Effective From:
                  </span>

                  <span className="text-muted-foreground">
                    {formatDate(salary.effectiveFrom)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Gross Salary
                      </p>

                      <p className="font-semibold text-foreground">
                        ₹{" "}
                        {Number(salary.grossSalary || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-muted-foreground" />

                    <div>
                      <p className="text-xs text-muted-foreground">CTC</p>

                      <p className="font-semibold text-foreground">
                        ₹ {Number(salary.ctc || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {salary.remarks && (
                  <div className="flex gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />

                    <div>
                      <p className="text-xs text-muted-foreground">Remarks</p>

                      <p className="text-sm text-foreground">
                        {salary.remarks}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-foreground mb-3">
                    Salary Structure
                  </h4>

                  <div className="space-y-2">
                    {salary.salaryStructure?.length > 0 ? (
                      salary.salaryStructure.map(
                        (component, componentIndex) => (
                          <div
                            key={componentIndex}
                            className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2"
                          >
                            <span className="text-sm text-foreground">
                              <div>
                                <p className="text-sm text-foreground">
                                  {component.salaryComponent?.name ||
                                    "Component"}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {component.salaryComponent?.calculationType}
                                </p>
                              </div>
                            </span>

                            <span className="font-medium text-foreground">
                              {component.salaryComponent?.calculationType ===
                              "Percentage"
                                ? `${Number(component.value || 0)}%`
                                : `₹ ${Number(component.value || 0).toLocaleString("en-IN")}`}
                            </span>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No salary components available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
