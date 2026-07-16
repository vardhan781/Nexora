import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Briefcase, Hash, FileText } from "lucide-react";

export const UpsertDesignationModal = ({
  open,
  onCancel,
  onSubmit,
  designationData,
  loading,
}) => {
  const isEditMode = !!designationData;

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
      if (isEditMode && designationData) {
        setFormData({
          name: designationData.name || "",
          code: designationData.code || "",
          description: designationData.description || "",
        });
      } else {
        setFormData({
          name: "",
          code: "",
          description: "",
        });
      }
    }
  }, [open, isEditMode, designationData]);

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
      title={isEditMode ? "Edit Designation" : "Create Designation"}
      confirmText={isEditMode ? "Save Changes" : "Create Designation"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={nameRef}
            label="Designation Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Designation name"
            required={true}
            maxLength={50}
            requiredMessage="Designation name is required"
            leftIcon={<Briefcase className="w-4 h-4" />}
          />

          <Input
            ref={codeRef}
            label="Designation Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Designation code"
            required={true}
            requiredMessage="Designation code is required"
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
            placeholder="Designation description"
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
