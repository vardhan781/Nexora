import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Checkbox } from "../Checkbox";
import { Clock, Hash, Type } from "lucide-react";

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const UpsertShiftModal = ({
  open,
  onCancel,
  onSubmit,
  shiftData,
  loading,
}) => {
  const isEditMode = !!shiftData;

  const shiftNameRef = useRef(null);
  const shiftCodeRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const totalHoursRef = useRef(null);
  const graceMinutesRef = useRef(null);
  const halfDayHoursRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    startTime: "",
    endTime: "",
    totalHours: 8,
    graceMinutes: 15,
    halfDayHours: 4,
    weeklyOffDays: [],
    isNightShift: false,
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && shiftData) {
        setFormData({
          name: shiftData.name || "",
          code: shiftData.code || "",
          startTime: shiftData.startTime || "",
          endTime: shiftData.endTime || "",
          totalHours: shiftData.totalHours ?? 8,
          graceMinutes: shiftData.graceMinutes ?? 15,
          halfDayHours: shiftData.halfDayHours ?? 4,
          weeklyOffDays: shiftData.weeklyOffDays || [],
          isNightShift: shiftData.isNightShift ?? false,
        });
      } else {
        setFormData({
          name: "",
          code: "",
          startTime: "",
          endTime: "",
          totalHours: 8,
          graceMinutes: 15,
          halfDayHours: 4,
          weeklyOffDays: [],
          isNightShift: false,
        });
      }
    }
  }, [open, isEditMode, shiftData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: ["totalHours", "graceMinutes", "halfDayHours"].includes(name)
        ? value === ""
          ? 0
          : Number(value)
        : value === ""
          ? null
          : value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleWeeklyOffToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      weeklyOffDays: prev.weeklyOffDays.includes(day)
        ? prev.weeklyOffDays.filter((d) => d !== day)
        : [...prev.weeklyOffDays, day],
    }));
  };

  const handleConfirmSubmit = () => {
    const isNameValid = shiftNameRef.current?.validate();
    const isCodeValid = shiftCodeRef.current?.validate();
    const isStartTimeValid = startTimeRef.current?.validate();
    const isEndTimeValid = endTimeRef.current?.validate();
    const isTotalHoursValid = totalHoursRef.current?.validate();
    const isGraceMinutesValid = graceMinutesRef.current?.validate();
    const isHalfDayHoursValid = halfDayHoursRef.current?.validate();

    if (
      !isNameValid ||
      !isCodeValid ||
      !isStartTimeValid ||
      !isEndTimeValid ||
      !isTotalHoursValid ||
      !isGraceMinutesValid ||
      !isHalfDayHoursValid
    ) {
      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;
    onSubmit(formData);
  };

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const timeRegexMsg = "Must be in 24-hour format (00:00 to 23:59)";

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
      title={isEditMode ? "Edit Shift" : "Create Shift"}
      confirmText={isEditMode ? "Save Changes" : "Create Shift"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={shiftNameRef}
            label="Shift Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required={true}
            maxLength={100}
            requiredMessage="Shift name is required"
            leftIcon={<Type className="w-4 h-4" />}
          />

          <Input
            ref={shiftCodeRef}
            label="Shift Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Shift code"
            required={true}
            requiredMessage="Shift code is required"
            regex={/^[A-Z_0-9]+$/}
            regexMessage="Only uppercase letters, numbers, and underscores allowed"
            maxLength={50}
            leftIcon={<Hash className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={startTimeRef}
            label="Start Time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            placeholder="Shift start time"
            required={true}
            requiredMessage="Start time is required"
            regex={timeRegex}
            regexMessage={timeRegexMsg}
            maxLength={5}
            leftIcon={<Clock className="w-4 h-4" />}
          />

          <Input
            ref={endTimeRef}
            label="End Time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            placeholder="Shift end time"
            required={true}
            requiredMessage="End time is required"
            regex={timeRegex}
            regexMessage={timeRegexMsg}
            maxLength={5}
            leftIcon={<Clock className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            ref={totalHoursRef}
            label="Total Hours"
            name="totalHours"
            value={formData.totalHours ?? ""}
            onChange={handleChange}
            placeholder="Total hours"
            required={true}
            requiredMessage="Total hours is required"
            regex={/^\d+$/}
            regexMessage="Only whole numbers are allowed (no decimals)"
            maxLength={2}
          />

          <Input
            ref={graceMinutesRef}
            label="Grace Minutes"
            name="graceMinutes"
            value={formData.graceMinutes ?? ""}
            onChange={handleChange}
            placeholder="Grace minutes"
            required={true}
            requiredMessage="Grace minutes is required"
            regex={/^\d+$/}
            regexMessage="Only whole numbers are allowed (no decimals)"
            maxLength={2}
          />

          <Input
            ref={halfDayHoursRef}
            label="Half Day Hours"
            name="halfDayHours"
            value={formData.halfDayHours ?? ""}
            onChange={handleChange}
            placeholder="Half day hours"
            required={true}
            requiredMessage="Half day hours is required"
            regex={/^\d+$/}
            regexMessage="Only whole numbers are allowed (no decimals)"
            maxLength={2}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-foreground font-medium">
            Weekly Off Days
          </label>

          <div className="flex flex-wrap gap-2.5">
            {WEEK_DAYS.map((day) => {
              const selected = formData.weeklyOffDays.includes(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleWeeklyOffToggle(day)}
                  className={`px-2 py-1 text-sm rounded border transition-colors cursor-pointer ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground hover:bg-muted border-border"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-muted/40 p-4 rounded-xl border border-border flex flex-wrap gap-6 items-center mt-2">
          <Checkbox
            label="Is Night Shift?"
            checked={formData.isNightShift}
            onChange={(e) =>
              handleCheckboxChange("isNightShift", e.target.checked)
            }
          />
        </div>
      </div>
    </Modal>
  );
};
