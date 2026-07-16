import React, { useEffect, useRef, useState } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Checkbox } from "../Checkbox";
import {
  CalendarDays,
  CalendarClock,
  FileText,
  ShieldCheck,
  Lock,
} from "lucide-react";

export const UpsertPayrollSettingModal = ({
  open,
  onCancel,
  onSubmit,
  payrollSetting,
  loading,
}) => {
  const isEditMode = !!payrollSetting;

  const payrollClosingDayRef = useRef(null);
  const salaryPayDayRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    payrollClosingDay: 30,
    salaryPayDay: 1,
    pfEnabled: true,
    esiEnabled: true,
    professionalTaxEnabled: true,
    incomeTaxEnabled: true,
    payrollLocked: false,
    remarks: "",
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && payrollSetting) {
        setFormData({
          payrollClosingDay: payrollSetting.payrollClosingDay ?? 30,
          salaryPayDay: payrollSetting.salaryPayDay ?? 1,
          pfEnabled: payrollSetting.pfEnabled ?? true,
          esiEnabled: payrollSetting.esiEnabled ?? true,
          professionalTaxEnabled: payrollSetting.professionalTaxEnabled ?? true,
          incomeTaxEnabled: payrollSetting.incomeTaxEnabled ?? true,
          payrollLocked: payrollSetting.payrollLocked ?? false,
          remarks: payrollSetting.remarks || "",
        });
      } else {
        setFormData({
          payrollClosingDay: 30,
          salaryPayDay: 1,
          pfEnabled: true,
          esiEnabled: true,
          professionalTaxEnabled: true,
          incomeTaxEnabled: true,
          payrollLocked: false,
          remarks: "",
        });
      }
    }
  }, [open, payrollSetting, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "payrollClosingDay" || name === "salaryPayDay"
          ? Number(value)
          : value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleConfirmSubmit = () => {
    const isClosingValid = payrollClosingDayRef.current?.validate();
    const isSalaryValid = salaryPayDayRef.current?.validate();

    if (!isClosingValid || !isSalaryValid) {
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

          onCancel?.();
        }
      }}
      onConfirm={handleConfirmSubmit}
      loading={loading}
      title={isEditMode ? "Edit Payroll Settings" : "Create Payroll Settings"}
      confirmText={isEditMode ? "Save Changes" : "Create Settings"}
      size="xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={payrollClosingDayRef}
            type="number"
            label="Payroll Closing Day"
            name="payrollClosingDay"
            value={formData.payrollClosingDay}
            onChange={handleChange}
            required
            requiredMessage="Payroll closing day is required"
            min={1}
            max={31}
            leftIcon={<CalendarDays className="w-4 h-4" />}
          />

          <Input
            ref={salaryPayDayRef}
            type="number"
            label="Salary Pay Day"
            name="salaryPayDay"
            value={formData.salaryPayDay}
            onChange={handleChange}
            required
            requiredMessage="Salary pay day is required"
            min={1}
            max={31}
            leftIcon={<CalendarClock className="w-4 h-4" />}
          />
        </div>

        <Input
          isTextarea
          rows={4}
          label="Remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Additional payroll remarks"
          maxLength={1000}
          leftIcon={<FileText className="w-4 h-4" />}
        />

        <div className="bg-muted/40 border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Payroll Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              label="Enable Provident Fund (PF)"
              checked={formData.pfEnabled}
              onChange={(e) =>
                handleCheckboxChange("pfEnabled", e.target.checked)
              }
            />

            <Checkbox
              label="Enable ESI"
              checked={formData.esiEnabled}
              onChange={(e) =>
                handleCheckboxChange("esiEnabled", e.target.checked)
              }
            />

            <Checkbox
              label="Enable Professional Tax"
              checked={formData.professionalTaxEnabled}
              onChange={(e) =>
                handleCheckboxChange("professionalTaxEnabled", e.target.checked)
              }
            />

            <Checkbox
              label="Enable Income Tax"
              checked={formData.incomeTaxEnabled}
              onChange={(e) =>
                handleCheckboxChange("incomeTaxEnabled", e.target.checked)
              }
            />

            <Checkbox
              label="Lock Payroll"
              checked={formData.payrollLocked}
              onChange={(e) =>
                handleCheckboxChange("payrollLocked", e.target.checked)
              }
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 flex gap-3">
          <div className="mt-0.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Payroll Settings
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed">
              These settings control your organization's payroll processing.
              Enabling payroll lock prevents further payroll modifications until
              it is unlocked.
            </p>

            {formData.payrollLocked && (
              <div className="flex items-center gap-2 text-warning pt-2">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-medium">
                  Payroll is currently locked.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
