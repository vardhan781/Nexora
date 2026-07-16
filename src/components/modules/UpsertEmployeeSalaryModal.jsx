import React, { useEffect, useRef, useState } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Select } from "../Select";
import { DatePicker } from "../DatePicker";
import { Button } from "../Button";
import { IndianRupee, FileText, Plus, Trash2 } from "lucide-react";

export const UpsertEmployeeSalaryModal = ({
  open,
  onCancel,
  onSubmit,
  employeeSalaryData,
  loading,
  employeeOptions = [],
  salaryComponentOptions = [],
}) => {
  const isEditMode = !!employeeSalaryData;

  const employeeRef = useRef(null);
  const effectiveFromRef = useRef(null);
  const grossSalaryRef = useRef(null);
  const ctcRef = useRef(null);
  const remarksRef = useRef(null);

  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    employee: "",
    effectiveFrom: "",
    grossSalary: "",
    ctc: "",
    remarks: "",
    salaryStructure: [
      {
        salaryComponent: "",
        value: "",
      },
    ],
  });

  useEffect(() => {
    if (!open) return;

    if (isEditMode && employeeSalaryData) {
      setFormData({
        employee:
          employeeSalaryData.employee?._id || employeeSalaryData.employee || "",

        effectiveFrom: employeeSalaryData.effectiveFrom || "",

        grossSalary: employeeSalaryData.grossSalary ?? "",

        ctc: employeeSalaryData.ctc ?? "",

        remarks: employeeSalaryData.remarks || "",

        salaryStructure:
          employeeSalaryData.salaryStructure?.length > 0
            ? employeeSalaryData.salaryStructure.map((item) => ({
                salaryComponent:
                  item.salaryComponent?._id || item.salaryComponent || "",

                value: item.value ?? "",
              }))
            : [
                {
                  salaryComponent: "",
                  value: "",
                },
              ],
      });
    } else {
      setFormData({
        employee: "",
        effectiveFrom: "",
        grossSalary: "",
        ctc: "",
        remarks: "",
        salaryStructure: [
          {
            salaryComponent: "",
            value: "",
          },
        ],
      });
    }
  }, [open, isEditMode, employeeSalaryData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value,
    }));
  };

  const handleSalaryStructureChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.salaryStructure];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        salaryStructure: updated,
      };
    });
  };

  const addSalaryComponent = () => {
    setFormData((prev) => ({
      ...prev,
      salaryStructure: [
        ...prev.salaryStructure,
        {
          salaryComponent: "",
          value: "",
        },
      ],
    }));
  };

  const removeSalaryComponent = (index) => {
    if (formData.salaryStructure.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      salaryStructure: prev.salaryStructure.filter((_, i) => i !== index),
    }));
  };

  const validateSalaryStructure = () => {
    if (!formData.salaryStructure.length) return false;

    const selectedComponents = [];

    for (const row of formData.salaryStructure) {
      if (!row.salaryComponent) return false;

      if (row.value === "" || row.value === null) return false;

      const component = getSalaryComponentDetails(row.salaryComponent);

      const value = Number(row.value);

      if (value < 0) return false;

      if (component?.calculationType === "Percentage" && value > 100) {
        return false;
      }

      if (selectedComponents.includes(row.salaryComponent)) {
        return false;
      }

      selectedComponents.push(row.salaryComponent);
    }

    return true;
  };

  const handleConfirmSubmit = () => {
    const isEmployeeValid = employeeRef.current?.validate();
    const isEffectiveDateValid = effectiveFromRef.current?.validate();
    const isGrossSalaryValid = grossSalaryRef.current?.validate();
    const isCTCValid = ctcRef.current?.validate();
    const isRemarksValid = remarksRef.current?.validate();

    const isSalaryStructureValid = validateSalaryStructure();

    if (
      !isEmployeeValid ||
      !isEffectiveDateValid ||
      !isGrossSalaryValid ||
      !isCTCValid ||
      !isRemarksValid ||
      !isSalaryStructureValid
    ) {
      isFormValidRef.current = false;
      return;
    }

    if (Number(formData.ctc) < Number(formData.grossSalary)) {
      grossSalaryRef.current?.setError?.("Gross Salary cannot exceed CTC");

      ctcRef.current?.setError?.("CTC should be greater than Gross Salary");

      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;

    const payload = {
      employee: formData.employee,

      effectiveFrom: formData.effectiveFrom,

      grossSalary: Number(formData.grossSalary),

      ctc: Number(formData.ctc),

      remarks: formData.remarks,

      salaryStructure: formData.salaryStructure.map((item) => ({
        salaryComponent: item.salaryComponent,
        value: Number(item.value),
      })),
    };

    onSubmit(payload);
  };

  const getSalaryComponentDetails = (componentId) => {
    return salaryComponentOptions.find((item) => item.value === componentId);
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
      loading={loading}
      title={isEditMode ? "Edit Employee Salary" : "Add Employee Salary"}
      confirmText={isEditMode ? "Save Changes" : "Create Salary"}
      size="2xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            ref={employeeRef}
            label="Employee"
            name="employee"
            value={formData.employee}
            onChange={handleChange}
            options={employeeOptions}
            placeholder="Select Employee"
            required
            requiredMessage="Employee is required"
          />

          <DatePicker
            ref={effectiveFromRef}
            label="Effective From"
            name="effectiveFrom"
            value={formData.effectiveFrom}
            onChange={handleChange}
            placeholder="Select Effective Date"
            dateFormat="DD-MM-YYYY"
            required
            requiredMessage="Effective date is required"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={grossSalaryRef}
            type="number"
            label="Gross Salary"
            name="grossSalary"
            value={formData.grossSalary}
            onChange={handleChange}
            placeholder="Enter Gross Salary"
            required
            requiredMessage="Gross Salary is required"
            min={0}
            leftIcon={<IndianRupee className="w-4 h-4" />}
          />

          <Input
            ref={ctcRef}
            type="number"
            label="CTC"
            name="ctc"
            value={formData.ctc}
            onChange={handleChange}
            placeholder="Enter CTC"
            required
            requiredMessage="CTC is required"
            min={0}
            leftIcon={<IndianRupee className="w-4 h-4" />}
          />
        </div>

        <Input
          ref={remarksRef}
          isTextarea
          rows={3}
          label="Remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Enter Remarks"
          maxLength={1000}
          leftIcon={<FileText className="w-4 h-4" />}
        />

        <div className="border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                Salary Structure
              </h3>

              <p className="text-sm text-muted-foreground">
                Add one or more salary components.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={addSalaryComponent}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Component
            </Button>
          </div>

          <div className="space-y-3">
            {formData.salaryStructure.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-6">
                  <Select
                    label={index === 0 ? "Salary Component" : ""}
                    value={item.salaryComponent}
                    placeholder="Select Component"
                    options={salaryComponentOptions}
                    onChange={(e) =>
                      handleSalaryStructureChange(
                        index,
                        "salaryComponent",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="col-span-10 md:col-span-5">
                  {(() => {
                    const component = getSalaryComponentDetails(
                      item.salaryComponent,
                    );

                    const isPercentage =
                      component?.calculationType === "Percentage";

                    return (
                      <Input
                        type="number"
                        label={
                          index === 0
                            ? isPercentage
                              ? "Percentage"
                              : "Amount"
                            : ""
                        }
                        value={item.value}
                        placeholder={
                          isPercentage ? "Enter Percentage" : "Enter Amount"
                        }
                        min={0}
                        max={isPercentage ? 100 : undefined}
                        leftIcon={
                          isPercentage ? (
                            <span className="text-sm font-semibold">%</span>
                          ) : (
                            <IndianRupee className="w-4 h-4" />
                          )
                        }
                        onChange={(e) =>
                          handleSalaryStructureChange(
                            index,
                            "value",
                            e.target.value,
                          )
                        }
                      />
                    );
                  })()}
                </div>

                <div className="col-span-2 md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeSalaryComponent(index)}
                    disabled={formData.salaryStructure.length === 1}
                    className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {formData.salaryStructure.length === 0 && (
            <p className="text-sm text-destructive">
              At least one salary component is required.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
