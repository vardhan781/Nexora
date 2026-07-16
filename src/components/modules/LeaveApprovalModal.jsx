import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { FileText } from "lucide-react";

export const LeaveApprovalModal = ({
  open,
  onCancel,
  onSubmit,
  loading,
  action,
}) => {
  const remarksRef = useRef(null);

  const [formData, setFormData] = useState({
    remarks: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        remarks: "",
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirmSubmit = () => {
    onSubmit({
      remarks: formData.remarks?.trim() || "",
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOpenChange={(isOpen) => {
        if (!isOpen && onCancel) {
          onCancel();
        }
      }}
      onConfirm={handleConfirmSubmit}
      loading={loading}
      title={
        action === "approve" ? "Approve Leave Request" : "Reject Leave Request"
      }
      confirmText={action === "approve" ? "Approve" : "Reject"}
      size="lg"
    >
      <div className="space-y-4">
        <Input
          ref={remarksRef}
          isTextarea
          label="Remarks (Optional)"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder={
            action === "approve"
              ? "Add approval remarks"
              : "Add rejection remarks"
          }
          required={false}
          rows={4}
          maxLength={300}
          leftIcon={<FileText className="w-4 h-4" />}
        />
      </div>
    </Modal>
  );
};
