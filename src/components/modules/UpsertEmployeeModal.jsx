import React, { useEffect, useState, useRef, useMemo } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Select } from "../Select";
import { DatePicker } from "../DatePicker";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldAlert,
  MapPin,
  Image,
  Briefcase,
  Building,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { FilePicker } from "../FilePicker";

export const UpsertEmployeeModal = ({
  open,
  onCancel,
  onSubmit,
  employeeData,
  loading,
  departments = [],
  designations = [],
  employeeTypes = [],
  employeeStatus = [],
  employeesList = [],
  shiftList = [],
}) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const isEditMode = !!employeeData;
  const isFormValidRef = useRef(true);

  const empCodeRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const mobileRef = useRef(null);
  const officialEmailRef = useRef(null);
  const deptRef = useRef(null);
  const designationRef = useRef(null);
  const empTypeRef = useRef(null);
  const empStatusRef = useRef(null);
  const shiftRef = useRef(null);
  const profileImageRef = useRef(null);
  const dobRef = useRef(null);
  const joiningDateRef = useRef(null);

  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    middleName: "",
    lastName: "",
    profileImage: null,
    personalEmail: "",
    officialEmail: "",
    mobileNumber: "",
    gender: "MALE",
    maritalStatus: "SINGLE",
    dateOfBirth: null,
    joiningDate: null,
    department: "",
    designation: "",
    employeeType: "",
    employeeStatus: "",
    reportingManager: "",
    shift: "",
    emergencyContact: { name: "", relationship: "", mobileNumber: "" },
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && employeeData) {
        setFormData({
          employeeCode: employeeData.employeeCode || "",
          firstName: employeeData.firstName || "",
          middleName: employeeData.middleName || "",
          lastName: employeeData.lastName || "",
          profileImage: employeeData.profileImage || null,
          personalEmail: employeeData.personalEmail || "",
          officialEmail: employeeData.officialEmail || "",
          mobileNumber: employeeData.mobileNumber || "",
          gender: employeeData.gender || "MALE",
          maritalStatus: employeeData.maritalStatus || "SINGLE",
          dateOfBirth: employeeData.dateOfBirth
            ? new Date(employeeData.dateOfBirth)
            : null,
          joiningDate: employeeData.joiningDate
            ? new Date(employeeData.joiningDate)
            : null,
          department:
            employeeData.department?._id || employeeData.department || "",
          designation:
            employeeData.designation?._id || employeeData.designation || "",
          employeeType:
            employeeData.employeeType?._id || employeeData.employeeType || "",
          employeeStatus:
            employeeData.employeeStatus?._id ||
            employeeData.employeeStatus ||
            "",
          reportingManager:
            employeeData.reportingManager?._id ||
            employeeData.reportingManager ||
            "",
          shift: employeeData.shift?._id || employeeData.shift || "",
          emergencyContact: {
            name: employeeData.emergencyContact?.name || "",
            relationship: employeeData.emergencyContact?.relationship || "",
            mobileNumber: employeeData.emergencyContact?.mobileNumber || "",
          },
          address: {
            addressLine1: employeeData.address?.addressLine1 || "",
            addressLine2: employeeData.address?.addressLine2 || "",
            city: employeeData.address?.city || "",
            state: employeeData.address?.state || "",
            country: employeeData.address?.country || "",
            pincode: employeeData.address?.pincode || "",
          },
        });
      } else {
        setFormData({
          employeeCode: "",
          firstName: "",
          middleName: "",
          lastName: "",
          profileImage: null,
          personalEmail: "",
          officialEmail: "",
          mobileNumber: "",
          gender: "MALE",
          maritalStatus: "SINGLE",
          dateOfBirth: null,
          joiningDate: null,
          department: "",
          designation: "",
          employeeType: "",
          employeeStatus: "",
          reportingManager: "",
          shift: "",
          emergencyContact: { name: "", relationship: "", mobileNumber: "" },
          address: {
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            country: "",
            pincode: "",
          },
        });
      }
      profileImageRef.current?.clearError();
      dobRef.current?.clearError();
      joiningDateRef.current?.clearError();
    }
  }, [open, isEditMode, employeeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.value;

    if (file) {
      setSelectedFile(file);

      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }));
    }
  };

  const handleConfirmSubmit = () => {
    const validations = [
      !isEditMode ? empCodeRef.current?.validate() : true,
      firstNameRef.current?.validate(),
      lastNameRef.current?.validate(),
      mobileRef.current?.validate(),
      officialEmailRef.current?.validate(),
      joiningDateRef.current?.validate(),
      deptRef.current?.validate(),
      designationRef.current?.validate(),
      empTypeRef.current?.validate(),
      empStatusRef.current?.validate(),
      shiftRef.current?.validate(),
      profileImageRef.current?.validate(),
      dobRef.current?.validate(),
      joiningDateRef.current?.validate(),
    ];

    if (validations.some((isValid) => isValid === false)) {
      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;

    const multipartData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "profileImage") {
        if (value instanceof File) {
          multipartData.append("profileImage", value);
        }
      } else if (value instanceof Date) {
        multipartData.append(key, value.toISOString());
      } else if (typeof value === "object" && value !== null) {
        multipartData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined && value !== "") {
        multipartData.append(key, value);
      }
    });

    onSubmit(multipartData);
  };

  const deptOptions = useMemo(
    () => departments.map((d) => ({ value: d._id, label: d.name })),
    [departments],
  );
  const designationOptions = useMemo(
    () => designations.map((d) => ({ value: d._id, label: d.name })),
    [designations],
  );
  const typeOptions = useMemo(
    () => employeeTypes.map((t) => ({ value: t._id, label: t.name })),
    [employeeTypes],
  );
  const shiftOptions = useMemo(
    () =>
      shiftList.map((s) => ({ value: s._id, label: `${s.name} (${s.code})` })),
    [shiftList],
  );
  const statusOptions = useMemo(
    () => employeeStatus.map((s) => ({ value: s._id, label: s.name })),
    [employeeStatus],
  );

  const managerOptions = useMemo(() => {
    const filtering = employeesList
      .filter((emp) => (isEditMode ? emp._id !== employeeData._id : true))
      .map((emp) => ({
        value: emp._id,
        label: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`,
      }));
    return [{ value: "", label: "None (Top Level)" }, ...filtering];
  }, [employeesList, isEditMode, employeeData]);

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
  ];

  const maritalOptions = [
    { value: "SINGLE", label: "Single" },
    { value: "MARRIED", label: "Married" },
    { value: "DIVORCED", label: "Divorced" },
    { value: "WIDOWED", label: "Widowed" },
  ];

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
      title={isEditMode ? "Edit Employee Profile" : "Add New Employee"}
      confirmText={isEditMode ? "Save Profile Changes" : "Register Employee"}
      size="3xl"
    >
      <div className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-xl border border-border">
          <FilePicker
            ref={profileImageRef}
            label="Profile Display Photo"
            name="profileImage"
            value={formData.profileImage}
            accept="image/*"
            maxSizeInMB={2}
            required={true}
            requiredMessage="Profile image upload is mandatory"
            onChange={handleFileChange}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5 pb-1">
            <User className="w-4 h-4" /> Primary Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              ref={empCodeRef}
              label="Employee Code"
              name="employeeCode"
              value={formData.employeeCode}
              onChange={handleChange}
              disabled={isEditMode}
              placeholder="EMP-001"
              required={!isEditMode}
              requiredMessage="Employee code is required"
              regex={/^[a-zA-Z0-BA0-9_-]{3,15}$/}
              regexMessage="Code must be 3-15 characters (letters, numbers, hyphens, or underscores)"
            />
            <Input
              ref={firstNameRef}
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required={true}
              requiredMessage="First name is required"
              regex={/^[a-zA-Z\s]{2,30}$/}
              regexMessage="Must be 2-30 standard text characters"
            />
            <Input
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Robert"
              regex={/^[a-zA-Z\s]{0,30}$/}
              regexMessage="Must be clear alphabetical characters"
            />
            <Input
              ref={lastNameRef}
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required={true}
              requiredMessage="Last name is required"
              regex={/^[a-zA-Z\s]{2,30}$/}
              regexMessage="Must be 2-30 standard text characters"
            />
            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={genderOptions}
            />
            <Select
              label="Marital Status"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              options={maritalOptions}
            />
            <DatePicker
              ref={dobRef}
              label="Date of Birth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              placeholder="Select birth date"
              dateFormat="DD-MM-YYYY"
              required={false}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5 pb-1">
            <Mail className="w-4 h-4" /> Communication & Contacts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              ref={mobileRef}
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="9876543210"
              required={true}
              requiredMessage="Mobile number is required"
              leftIcon={<Phone className="w-4 h-4" />}
              regex={/^[6-9]\d{9}$/}
              regexMessage="Enter a valid 10-digit mobile number starting with 6-9"
            />
            <Input
              ref={officialEmailRef}
              label="Official Email"
              name="officialEmail"
              type="email"
              value={formData.officialEmail}
              onChange={handleChange}
              placeholder="john.doe@company.com"
              required={true}
              requiredMessage="Email is required"
              leftIcon={<Mail className="w-4 h-4" />}
              regex={/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/}
              regexMessage="Enter a valid standard corporate email address"
            />
            <Input
              label="Personal Email"
              name="personalEmail"
              type="email"
              value={formData.personalEmail}
              onChange={handleChange}
              placeholder="john.doe@gmail.com"
              leftIcon={<Mail className="w-4 h-4" />}
              regex={/^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?$/}
              regexMessage="Enter a valid personal email format"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5 pb-1">
            <Briefcase className="w-4 h-4" /> HR & Corporate Placement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePicker
              ref={joiningDateRef}
              label="Joining Date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              placeholder="Select joining date"
              dateFormat="DD-MM-YYYY"
              required={true}
              requiredMessage="Joining date is required"
            />
            <Select
              ref={deptRef}
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={deptOptions}
              required={true}
              placeholder="Select Department"
              requiredMessage="Department is required"
              leftIcon={<Building className="w-4 h-4" />}
            />
            <Select
              ref={designationRef}
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              options={designationOptions}
              required={true}
              placeholder="Select Designation"
              requiredMessage="Designation is required"
              leftIcon={<Layers className="w-4 h-4" />}
            />
            <Select
              ref={empTypeRef}
              label="Employee Type"
              name="employeeType"
              value={formData.employeeType}
              onChange={handleChange}
              options={typeOptions}
              required={true}
              placeholder="Select Type"
              requiredMessage="Employee type is required"
              leftIcon={<Briefcase className="w-4 h-4" />}
            />
            <Select
              ref={empStatusRef}
              label="Employee Status"
              name="employeeStatus"
              value={formData.employeeStatus}
              onChange={handleChange}
              options={statusOptions}
              required={true}
              placeholder="Select Status"
              requiredMessage="Employee status is required"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            />
            <Select
              ref={shiftRef}
              label="Shift"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              options={shiftOptions}
              required={true}
              placeholder="Select Shift"
              requiredMessage="Shift assignment is required"
            />
            <Select
              label="Reporting Manager"
              name="reportingManager"
              value={formData.reportingManager}
              onChange={handleChange}
              options={managerOptions}
              placeholder="Select Manager"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5 pb-1">
              <ShieldAlert className="w-4 h-4" /> Emergency Contact
            </h3>
            <div className="space-y-3">
              <Input
                label="Contact Name"
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  handleNestedChange("emergencyContact", "name", e.target.value)
                }
                placeholder="Jane Doe"
                regex={/^[a-zA-Z\s]{0,40}$/}
                regexMessage="Name should contain alphabetical text characters only"
              />
              <Input
                label="Relationship"
                value={formData.emergencyContact.relationship}
                onChange={(e) =>
                  handleNestedChange(
                    "emergencyContact",
                    "relationship",
                    e.target.value,
                  )
                }
                placeholder="Spouse / Parent"
                regex={/^[a-zA-Z\s]{0,20}$/}
                regexMessage="Relationship field should contain text characters only"
              />
              <Input
                label="Emergency Mobile"
                value={formData.emergencyContact.mobileNumber}
                onChange={(e) =>
                  handleNestedChange(
                    "emergencyContact",
                    "mobileNumber",
                    e.target.value,
                  )
                }
                placeholder="9876543211"
                leftIcon={<Phone className="w-4 h-4" />}
                regex={/^([6-9]\d{9})?$/}
                regexMessage="Must be a valid 10-digit number starting with 6-9"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5 pb-1">
              <MapPin className="w-4 h-4" /> Residential Address
            </h3>
            <div className="space-y-3">
              <Input
                label="Address Line 1"
                value={formData.address.addressLine1}
                onChange={(e) =>
                  handleNestedChange("address", "addressLine1", e.target.value)
                }
                placeholder="Street Address, P.O. Box"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="City"
                  value={formData.address.city}
                  onChange={(e) =>
                    handleNestedChange("address", "city", e.target.value)
                  }
                  placeholder="City"
                />
                <Input
                  label="State"
                  value={formData.address.state}
                  onChange={(e) =>
                    handleNestedChange("address", "state", e.target.value)
                  }
                  placeholder="State"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Country"
                  value={formData.address.country}
                  onChange={(e) =>
                    handleNestedChange("address", "country", e.target.value)
                  }
                  placeholder="Country"
                />
                <Input
                  label="Pincode"
                  value={formData.address.pincode}
                  onChange={(e) =>
                    handleNestedChange("address", "pincode", e.target.value)
                  }
                  placeholder="Pincode"
                  regex={/^(\d{6})?$/}
                  regexMessage="Pincode must be exactly 6 numerical digits"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
