import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Checkbox } from "../Checkbox";
import { Shield, Hash, FileText } from "lucide-react";

export const UpsertRoleModal = ({
  open,
  onCancel,
  onSubmit,
  roleData,
  loading,
}) => {
  const isEditMode = !!roleData;

  const roleNameRef = useRef(null);
  const roleCodeRef = useRef(null);
  const descriptionRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    roleName: "",
    roleCode: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && roleData) {
        setFormData({
          roleName: roleData.roleName || "",
          roleCode: roleData.roleCode || "",
          description: roleData.description || "",
          isActive: roleData.isActive ?? true,
        });
      } else {
        setFormData({
          roleName: "",
          roleCode: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [open, isEditMode, roleData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleConfirmSubmit = () => {
    const isNameValid = roleNameRef.current?.validate();
    const isCodeValid = roleCodeRef.current?.validate();

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

          if (onCancel) {
            onCancel();
          }
        }
      }}
      onConfirm={handleConfirmSubmit}
      loading={loading}
      title={isEditMode ? "Edit Role" : "Create Role"}
      confirmText={isEditMode ? "Save Changes" : "Create Role"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={roleNameRef}
            label="Role Name"
            name="roleName"
            value={formData.roleName}
            onChange={handleChange}
            placeholder="Role name"
            required={true}
            maxLength={50}
            requiredMessage="Role name is required"
            leftIcon={<Shield className="w-4 h-4" />}
          />

          <Input
            ref={roleCodeRef}
            label="Role Code"
            name="roleCode"
            value={formData.roleCode}
            onChange={handleChange}
            placeholder="Role code"
            required={true}
            requiredMessage="Role code is required"
            regex={/^[A-Z_]+$/}
            regexMessage="Only uppercase letters and underscores allowed"
            maxLength={50}
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
            placeholder="Role description"
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
