import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Briefcase, Hash, FileText } from "lucide-react";

export const UpsertEmployeeTypeModal = ({
  open,
  onCancel,
  onSubmit,
  employeeTypeData,
  loading,
}) => {
  const isEditMode = !!employeeTypeData;

  const nameRef = useRef(null);
  const codeRef = useRef(null);
  const descriptionRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && employeeTypeData) {
        setFormData({
          name: employeeTypeData.name || "",
          code: employeeTypeData.code || "",
          description: employeeTypeData.description || "",
        });
      } else {
        setFormData({
          name: "",
          code: "",
          description: "",
        });
      }
    }
  }, [open, isEditMode, employeeTypeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleConfirmSubmit = () => {
    const isNameValid = nameRef.current?.validate();
    const isCodeValid = codeRef.current?.validate();

    if (!isNameValid || !isCodeValid) {
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

          if (onCancel) onCancel();
        }
      }}
      onConfirm={handleConfirmSubmit}
      loading={loading}
      title={isEditMode ? "Edit Employee Type" : "Create Employee Type"}
      confirmText={isEditMode ? "Save Changes" : "Create Employee Type"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={nameRef}
            label="Employee type name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Employee type name"
            required={true}
            maxLength={50}
            requiredMessage="Employee type name is required"
            leftIcon={<Briefcase className="w-4 h-4" />}
          />

          <Input
            ref={codeRef}
            label="Employee type code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Employee type code"
            required={true}
            requiredMessage="Employee type code is required"
            regex={/^[A-Z_]+$/}
            regexMessage="Only uppercase letters and underscores allowed"
            maxLength={20}
            leftIcon={<Hash className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            ref={descriptionRef}
            isTextarea={true}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Employee type description"
            required={false}
            maxLength={200}
            rows={3}
            leftIcon={<FileText className="w-4 h-4" />}
          />
        </div>
      </div>
    </Modal>
  );
};
