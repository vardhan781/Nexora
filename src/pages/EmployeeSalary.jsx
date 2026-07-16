import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { AlertDialog } from "../components/AlertDialog";
import { UpsertEmployeeSalaryModal } from "../components/modules/UpsertEmployeeSalaryModal";
import { EmployeeSalaryHistoryModal } from "../components/modules/EmployeeSalaryHistoryModal";
import { StatusBadge } from "../components/StatusBadge";
import { Edit, Plus, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../utils/dateUtils";

const EmployeeSalary = () => {
  const [employeeSalaries, setEmployeeSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [salaryToDelete, setSalaryToDelete] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployeeSalaries = async () => {
    setLoading(true);

    try {
      const res = await api.get("/employee-salary");

      if (res.data.success) {
        const sanitizedData = res.data.data.map((item) => ({
          ...item,

          employeeName: item.employee
            ? `${item.employee.firstName} ${item.employee.lastName}`
            : "N/A",

          totalComponents: item.salaryStructure?.length || 0,
        }));

        setEmployeeSalaries(sanitizedData);
      }
    } catch (error) {
      console.error(error);

      toast.error("Failed to fetch employee salaries.");
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
      toast.error("Failed to fetch employees.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryComponents = async () => {
    try {
      setLoading(true);

      const res = await api.get("/salary-component");

      if (res.data.success) {
        setSalaryComponents(res.data.data);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to fetch salary components.",
      );
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      label: `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`,
      value: emp._id,
    }));
  }, [employees]);

  const salaryComponentOptions = useMemo(() => {
    return salaryComponents.map((component) => ({
      label: `${component.name} (${component.code})`,
      value: component._id,
      calculationType: component.calculationType,
      componentType: component.componentType,
    }));
  }, [salaryComponents]);

  useEffect(() => {
    fetchEmployeeSalaries();
    fetchEmployees();
    fetchSalaryComponents();
  }, []);

  const handleAddClick = () => {
    setSelectedSalary(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (row) => {
    setSelectedSalary(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (payload) => {
    setUpsertLoading(true);

    try {
      if (selectedSalary) {
        const res = await api.put(
          `/employee-salary/${selectedSalary._id}`,
          payload,
        );

        if (res.data.success) {
          toast.success("Employee salary updated successfully.");
        }
      } else {
        const res = await api.post("/employee-salary/add", payload);

        if (res.data.success) {
          toast.success("Employee salary created successfully.");
        }
      }

      setIsModalOpen(false);
      setSelectedSalary(null);

      await fetchEmployeeSalaries();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setUpsertLoading(false);
    }
  };

  const handleDeleteClick = (row) => {
    setSalaryToDelete(row);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSalary = async () => {
    if (!salaryToDelete?._id) return;

    setDeleteLoading(true);

    try {
      const res = await api.delete(`/employee-salary/${salaryToDelete._id}`);

      if (res.data.success) {
        toast.success("Employee salary deleted successfully.");

        setDeleteModalOpen(false);
        setSalaryToDelete(null);

        await fetchEmployeeSalaries();
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to delete employee salary.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchSalaryHistory = async (employee) => {
    try {
      setHistoryLoading(true);

      const res = await api.get(`/employee-salary/history/${employee._id}`);

      if (res.data.success) {
        setSalaryHistory(res.data.data);

        setSelectedEmployee(employee);

        setHistoryModalOpen(true);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to fetch salary history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Employee",
        accessor: "employeeName",
        cell: ({ value }) => (
          <span className="font-medium text-foreground">{value || "N/A"}</span>
        ),
      },

      {
        header: "Effective From",
        accessor: "effectiveFrom",
        cell: ({ value }) => <span>{value ? formatDate(value) : "-"}</span>,
      },

      {
        header: "Gross Salary",
        accessor: "grossSalary",
        align: "right",
        cell: ({ value }) => (
          <span className="font-medium">
            ₹ {Number(value || 0).toLocaleString("en-IN")}
          </span>
        ),
      },

      {
        header: "CTC",
        accessor: "ctc",
        align: "right",
        cell: ({ value }) => (
          <span className="font-medium">
            ₹ {Number(value || 0).toLocaleString("en-IN")}
          </span>
        ),
      },

      {
        header: "Components",
        accessor: "salaryStructure",
        cell: ({ value }) => (
          <StatusBadge
            text={`${value?.length || 0} Component${
              value?.length === 1 ? "" : "s"
            }`}
            variant="info"
          />
        ),
      },

      {
        header: "Remarks",
        accessor: "remarks",
        cell: ({ value }) => (
          <span className="line-clamp-2">{value || "-"}</span>
        ),
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
                handleEditClick(row);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                fetchSalaryHistory(row.employee);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
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
        <h2 className="text-xl font-semibold text-foreground">
          Employee Salary
        </h2>

        <Button
          rightIcon={<Plus className="w-4 h-4" />}
          onClick={handleAddClick}
        >
          Add Salary
        </Button>
      </div>

      <DataTable
        title="Employee Salary List"
        columns={columns}
        data={employeeSalaries}
        loading={loading}
        enableSerialNumber
        enableSearch
        searchFields={["employeeName", "remarks"]}
        placeholderSearch="Search employee salary"
        enablePagination
        defaultPageSize={10}
      />

      <UpsertEmployeeSalaryModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedSalary(null);
        }}
        onSubmit={handleUpsertSubmit}
        employeeSalaryData={selectedSalary}
        loading={upsertLoading}
        employeeOptions={employeeOptions}
        salaryComponentOptions={salaryComponentOptions}
      />

      <EmployeeSalaryHistoryModal
        open={historyModalOpen}
        onCancel={() => {
          setHistoryModalOpen(false);
          setSalaryHistory([]);
          setSelectedEmployee(null);
        }}
        history={salaryHistory}
        employee={selectedEmployee}
        loading={historyLoading}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Employee Salary"
        description="Are you sure you want to delete this salary record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteSalary}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSalaryToDelete(null);
        }}
      />
    </div>
  );
};

export default EmployeeSalary;
