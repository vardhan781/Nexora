import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertEmployeeModal } from "../components/modules/UpsertEmployeeModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";
import { StatusBadge } from "../components/StatusBadge";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employeeStatus, setEmployeeStatus] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const statusColorMap = {
    ACTIVE: "success",
    RESIGNED: "warning",
    NOTICE_PERIOD: "warning",
    PROBATION: "default",
    ON_LEAVE: "warning",
    TERMINATED: "danger",
  };

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/shift/shifts");
      if (response.data.success) {
        setShifts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Failed to fetch shifts data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/designations/designations");
      if (response.data.success) {
        setDesignations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching designations:", error);
      toast.error("Failed to fetch designations data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get("/employee-status/employee-status");
      if (response.data.success) {
        setEmployeeStatus(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching employee status:", error);
      toast.error("Failed to fetch employee status data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/employee-types/employee-types");
      if (response.data.success) {
        setEmployeeTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching employee types:", error);
      toast.error("Failed to fetch employee types data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/departments/departments");
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees/employees");
      const sanitizedData = res.data.data.map((emp) => ({
        ...emp,
        employeeStatusCode: emp.employeeStatus?.code || "DEFAULT",
        employeeStatusName: emp.employeeStatus?.name || "N/A",
      }));

      setEmployees(sanitizedData);
    } catch (err) {
      toast.error("Failed to fetch employees data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDesignations();
    fetchEmployeeStatus();
    fetchEmployeeTypes();
    fetchDepartments();
    fetchShifts();
  }, []);

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedEmployee(row);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setEmployeeToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedEmployee) {
        const res = await api.put(
          `/employees/${selectedEmployee._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        if (res.data) toast.success("Employee updated successfully");
      } else {
        const res = await api.post("/employees/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data) toast.success("Employee created successfully");
      }

      setIsModalOpen(false);
      setSelectedEmployee(null);
      await fetchEmployees();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/employees/${employeeToDelete._id}`);
      if (res.data) {
        toast.success("Employee records removed successfully");
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
        await fetchEmployees();
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete employee");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessor: "firstName",
        cell: ({ row }) => {
          const middle = row.middleName ? `${row.middleName} ` : "";
          return `${row.firstName} ${middle}${row.lastName}`;
        },
      },
      {
        header: "Official Email",
        accessor: "officialEmail",
      },
      {
        header: "Mobile",
        accessor: "mobileNumber",
      },
      {
        header: "Department",
        accessor: "department.name",
        cell: ({ row }) =>
          row.department?.name || row.department?.title || "N/A",
      },
      {
        header: "Designation",
        accessor: "designation.name",
        cell: ({ row }) =>
          row.designation?.name || row.designation?.title || "N/A",
      },
      {
        header: "Status",
        accessor: "employeeStatusName",
        type: "select",
        cell: ({ row }) => {
          const statusCode = row.employeeStatusCode;
          const statusName = row.employeeStatusName || "N/A";
          const variant = statusColorMap[statusCode] || "default";

          return <StatusBadge text={statusName} variant={variant} size="sm" />;
        },
      },

      {
        header: "Actions",
        accessor: "actions",
        align: "center",
        exportable: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateClick(row);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 focus:outline-none cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 focus:outline-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground font-semibold text-xl">
          Employee Management
        </h2>
        <Button
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddClick}
        >
          Add Employee
        </Button>
      </div>

      <DataTable
        title="Employee Directory"
        columns={columns}
        data={employees}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        enableQuickFilter={true}
        predefinedFilter="employeeStatusName"
        placeholderSearch="Search by Code, Name, or Email"
        searchFields={[
          "employeeCode",
          "firstName",
          "lastName",
          "officialEmail",
          "mobileNumber",
        ]}
        enableExport={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertEmployeeModal
        open={isModalOpen}
        employeeData={selectedEmployee}
        loading={upsertLoading}
        departments={departments}
        designations={designations}
        employeeTypes={employeeTypes}
        employeeStatus={employeeStatus}
        employeesList={employees}
        shiftList={shifts}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Employee Profile"
        description={`Are you sure you want to delete records for "${
          employeeToDelete
            ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}`
            : ""
        }"? This cannot be reversed.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteEmployee}
        onCancel={() => {
          setDeleteModalOpen(false);
          setEmployeeToDelete(null);
        }}
      />
    </div>
  );
};

export default Employees;
