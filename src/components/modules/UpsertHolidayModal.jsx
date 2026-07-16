import React, { useEffect, useState, useRef, useMemo } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Select } from "../Select";
import { DatePicker } from "../DatePicker";
import { Calendar, FileText, Type } from "lucide-react";

export const UpsertHolidayModal = ({
  open,
  onCancel,
  onSubmit,
  holidayData,
  loading,
}) => {
  const isEditMode = !!holidayData;

  const holidayNameRef = useRef(null);
  const dateRef = useRef(null);
  const typeRef = useRef(null);
  const descriptionRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "NATIONAL",
    description: "",
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && holidayData) {
        setFormData({
          name: holidayData.name || "",
          date: holidayData.date || "",
          type: holidayData.type || "NATIONAL",
          description: holidayData.description || "",
        });
      } else {
        setFormData({
          name: "",
          date: "",
          type: "NATIONAL",
          description: "",
        });
      }
    }
  }, [open, isEditMode, holidayData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleConfirmSubmit = () => {
    const isNameValid = holidayNameRef.current?.validate();
    const isDateValid = dateRef.current?.validate();
    const isTypeValid = typeRef.current?.validate();

    if (!isNameValid || !isDateValid || !isTypeValid) {
      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;
    onSubmit(formData);
  };

  // Maps backend Enum values to presentation labels
  const typeOptions = useMemo(
    () => [
      { value: "NATIONAL", label: "National" },
      { value: "FESTIVAL", label: "Festival" },
      { value: "OPTIONAL", label: "Optional" },
    ],
    [],
  );

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
      title={isEditMode ? "Edit Holiday" : "Add Holiday"}
      confirmText={isEditMode ? "Save Changes" : "Create Holiday"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={holidayNameRef}
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Holiday name"
            required={true}
            maxLength={50}
            requiredMessage="Holiday name is required"
            leftIcon={<Type className="w-4 h-4" />}
          />

          <DatePicker
            ref={dateRef}
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            placeholder="Select holiday date"
            dateFormat="DD-MM-YYYY"
            required={true}
            requiredMessage="Holiday date is required"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            ref={typeRef}
            label="Type"
            name="type"
            value={formData.type || "NATIONAL"}
            onChange={handleChange}
            options={typeOptions}
            placeholder="Select type"
            required={true}
            requiredMessage="Holiday type is required"
          />
        </div>

        <div>
          <Input
            ref={descriptionRef}
            isTextarea={true}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Holiday description"
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
