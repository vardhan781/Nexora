import React, { useEffect, useRef, useState } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Select } from "../Select";
import { Hash, Calculator, FileText, Type } from "lucide-react";

export const UpsertSalaryComponentModal = ({
  open,
  onCancel,
  onSubmit,
  salaryComponent,
  loading,
}) => {
  const isEditMode = !!salaryComponent;

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    componentType: "",
    calculationType: "",
    description: "",
    isActive: true,
  });

  const nameRef = useRef(null);
  const codeRef = useRef(null);
  const componentTypeRef = useRef(null);
  const calculationTypeRef = useRef(null);
  const isFormValidRef = useRef(true);

  const componentTypeOptions = [
    {
      label: "Earning",
      value: "Earning",
    },
    {
      label: "Deduction",
      value: "Deduction",
    },
  ];

  const calculationTypeOptions = [
    {
      label: "Fixed",
      value: "Fixed",
    },
    {
      label: "Percentage",
      value: "Percentage",
    },
  ];

  useEffect(() => {
    if (open) {
      if (isEditMode && salaryComponent) {
        setFormData({
          name: salaryComponent.name || "",
          code: salaryComponent.code || "",
          componentType: salaryComponent.componentType || "",
          calculationType: salaryComponent.calculationType || "",
          description: salaryComponent.description || "",
          isActive: salaryComponent.isActive ?? true,
        });
      } else {
        setFormData({
          name: "",
          code: "",
          componentType: "",
          calculationType: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [open, salaryComponent, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleConfirmSubmit = () => {
    const isNameValid = nameRef.current?.validate();
    const isCodeValid = codeRef.current?.validate();
    const isComponentTypeValid = componentTypeRef.current?.validate();
    const isCalculationTypeValid = calculationTypeRef.current?.validate();

    if (
      !isNameValid ||
      !isCodeValid ||
      !isComponentTypeValid ||
      !isCalculationTypeValid
    ) {
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
      title={isEditMode ? "Edit Salary Component" : "Create Salary Component"}
      confirmText={isEditMode ? "Save Changes" : "Create Component"}
      size="xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={nameRef}
            label="Component Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Component name"
            required
            requiredMessage="Component name is required"
            maxLength={100}
            leftIcon={<Type className="w-4 h-4" />}
          />

          <Input
            ref={codeRef}
            label="Component Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Code of component"
            required
            requiredMessage="Component code is required"
            regex={/^[A-Z_]+$/}
            regexMessage="Only uppercase letters and underscores allowed"
            maxLength={100}
            leftIcon={<Hash className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            ref={componentTypeRef}
            label="Component Type"
            name="componentType"
            value={formData.componentType}
            onChange={handleSelectChange}
            options={componentTypeOptions}
            placeholder="Select component type"
            required
            requiredMessage="Component type is required"
          />

          <Select
            ref={calculationTypeRef}
            label="Calculation Type"
            name="calculationType"
            value={formData.calculationType}
            onChange={handleSelectChange}
            options={calculationTypeOptions}
            placeholder="Select calculation type"
            required
            requiredMessage="Calculation type is required"
          />
        </div>

        <Input
          isTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Component description"
          maxLength={500}
          leftIcon={<FileText className="w-4 h-4" />}
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calculator className="w-4 h-4 text-primary" />
          <span>
            Salary components define earnings and deductions used during payroll
            processing.
          </span>
        </div>
      </div>
    </Modal>
  );
};
