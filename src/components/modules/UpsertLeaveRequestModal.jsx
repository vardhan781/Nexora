import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Select } from "../Select";
import { DatePicker } from "../DatePicker";
import { FileText, Type, Hash, Link as LinkIcon } from "lucide-react";

export const UpsertLeaveRequestModal = ({
  open,
  onCancel,
  onSubmit,
  leaveRequestData,
  loading,
  leaveTypeOptions = [],
}) => {
  const isEditMode = !!leaveRequestData;

  const leaveTypeRef = useRef(null);
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const totalDaysRef = useRef(null);
  const reasonRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    totalDays: "",
    reason: "",
    attachment: "",
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && leaveRequestData) {
        setFormData({
          leaveType:
            leaveRequestData.leaveType?._id || leaveRequestData.leaveType || "",
          fromDate: leaveRequestData.fromDate || "",
          toDate: leaveRequestData.toDate || "",
          totalDays: leaveRequestData.totalDays || "",
          reason: leaveRequestData.reason || "",
          attachment: leaveRequestData.attachment || "",
        });
      } else {
        setFormData({
          leaveType: "",
          fromDate: "",
          toDate: "",
          totalDays: "",
          reason: "",
          attachment: "",
        });
      }
    }
  }, [open, isEditMode, leaveRequestData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value === "" ? null : value,
      };

      if (
        name === "fromDate" &&
        updated.toDate &&
        new Date(updated.fromDate) > new Date(updated.toDate)
      ) {
        updated.toDate = null;
      }

      if (
        name === "toDate" &&
        updated.fromDate &&
        new Date(updated.toDate) < new Date(updated.fromDate)
      ) {
        updated.fromDate = null;
      }

      return updated;
    });
  };

  const handleConfirmSubmit = () => {
    const isLeaveTypeValid = leaveTypeRef.current?.validate();
    const isFromDateValid = fromDateRef.current?.validate();
    const isToDateValid = toDateRef.current?.validate();
    const isTotalDaysValid = totalDaysRef.current?.validate();
    const isReasonValid = reasonRef.current?.validate();

    if (
      !isLeaveTypeValid ||
      !isFromDateValid ||
      !isToDateValid ||
      !isTotalDaysValid ||
      !isReasonValid
    ) {
      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;

    const payload = {
      ...formData,
      totalDays: Number(formData.totalDays),
    };

    onSubmit(payload);
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
      title={isEditMode ? "Edit Leave Request" : "New Leave Request"}
      confirmText={isEditMode ? "Save Changes" : "Submit Request"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Select
            ref={leaveTypeRef}
            label="Leave Type"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            options={leaveTypeOptions}
            placeholder="Select leave type"
            required={true}
            requiredMessage="Leave type is required"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            ref={fromDateRef}
            label="From Date"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            placeholder="Select start date"
            dateFormat="DD-MM-YYYY"
            required
            requiredMessage="Start date is required"
            maxDate={formData.toDate}
          />
          <DatePicker
            ref={toDateRef}
            label="To Date"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            placeholder="Select end date"
            dateFormat="DD-MM-YYYY"
            required
            requiredMessage="End date is required"
            minDate={formData.fromDate}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={totalDaysRef}
            type="number"
            step="0.5"
            min="0.5"
            label="Total Days"
            name="totalDays"
            value={formData.totalDays}
            onChange={handleChange}
            placeholder="Days"
            required={true}
            requiredMessage="Total days is required"
            regex={/^(0\.5|[1-9]\d*(\.5)?)$/}
            regexMessage="Only whole days or half days are allowed"
            leftIcon={<Hash className="w-4 h-4" />}
          />
          <Input
            label="Attachment (Optional)"
            name="attachment"
            value={formData.attachment}
            onChange={handleChange}
            placeholder="Link to document"
            required={false}
            leftIcon={<LinkIcon className="w-4 h-4" />}
            maxLength={100}
          />
        </div>

        <div>
          <Input
            ref={reasonRef}
            isTextarea={true}
            label="Reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Please provide a reason for your leave"
            required={true}
            maxLength={1000}
            rows={4}
            requiredMessage="Reason is required"
            leftIcon={<FileText className="w-4 h-4" />}
          />
        </div>
      </div>
    </Modal>
  );
};
