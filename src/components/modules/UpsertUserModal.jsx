import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Shield, User, Mail, Lock, KeyRound } from "lucide-react";
import { Select } from "../Select";

export const UpsertUserModal = ({
  open,
  onCancel,
  onSubmit,
  userData,
  loading,
  roles = [],
  employees = [],
}) => {
  const isEditMode = !!userData;

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);
  const employeeRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "",
    employee: "",
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && userData) {
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          username: userData.username || "",
          email: userData.email || "",
          password: "",
          role: userData.role?._id || userData.role || "",
          employee: userData.employee?._id || userData.employee || "",
          isActive: userData.isActive ?? true,
        });
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          password: "",
          role: "",
          employee: "",
          isActive: true,
        });
      }
    }
  }, [open, isEditMode, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleConfirmSubmit = () => {
    const isFirstNameValid = firstNameRef.current?.validate();
    const isLastNameValid = lastNameRef.current?.validate();
    const isUsernameValid = usernameRef.current?.validate();
    const isEmailValid = emailRef.current?.validate();
    const isRoleValid = roleRef.current?.validate();
    const isEmployeeValid = employeeRef.current?.validate();

    const isPasswordValid = isEditMode ? true : passwordRef.current?.validate();

    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isUsernameValid ||
      !isEmailValid ||
      !isRoleValid ||
      !isEmployeeValid ||
      !isPasswordValid
    ) {
      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;

    const dynamicPayload = { ...formData };

    if (isEditMode) {
      delete dynamicPayload.password;
    }

    onSubmit(dynamicPayload);
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
      title={isEditMode ? "Edit User" : "Create User"}
      confirmText={isEditMode ? "Save Changes" : "Create User"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={firstNameRef}
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
            required={true}
            maxLength={50}
            requiredMessage="First name is required"
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            ref={lastNameRef}
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
            required={true}
            maxLength={50}
            requiredMessage="Last name is required"
            leftIcon={<User className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={usernameRef}
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required={true}
            maxLength={30}
            requiredMessage="Username is required"
            leftIcon={<KeyRound className="w-4 h-4" />}
          />

          <Input
            ref={emailRef}
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@nexora.com"
            required={true}
            requiredMessage="Email is required"
            regex={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
            regexMessage="Please enter a valid email address"
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>
        {!isEditMode && (
          <Input
            ref={passwordRef}
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required={true}
            requiredMessage="Password is required"
            maxLength={128}
            leftIcon={<Lock className="w-4 h-4" />}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            ref={roleRef}
            label="System Role"
            name="role"
            value={formData.role}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, role: e.target.value }));
            }}
            options={roles}
            placeholder="Select a role"
            required={true}
            requiredMessage="Role classification is required"
          />
          <Select
            ref={employeeRef}
            label="Employee"
            name="employee"
            value={formData.employee}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                employee: e.target.value,
              }))
            }
            options={employees.map((emp) => ({
              value: emp._id,
              label: `${emp.employeeCode} - ${emp.firstName} ${emp.lastName}`,
            }))}
            placeholder="Select employee"
            required
            requiredMessage="Employee is required"
          />
        </div>
      </div>
    </Modal>
  );
};
