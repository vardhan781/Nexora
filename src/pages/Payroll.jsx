import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertPayrollModal } from "../components/modules/UpsertPayrollModal";
import { Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../utils/dateUtils";
import ViewPayrollModal from "../components/modules/ViewPayrollModal";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);

      const res = await api.get("/employees/employees");

      const sanitizedData = res.data.data.map((employee) => ({
        value: employee._id,
        label: `${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`,
      }));

      setEmployees(sanitizedData);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to fetch employees.",
      );
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);

      const res = await api.get("/payroll");

      if (res.data.success) {
        const sanitizedData = res.data.data.map((payroll) => ({
          ...payroll,

          employeeName: payroll.employee
            ? `${payroll.employee.employeeCode} - ${payroll.employee.firstName} ${payroll.employee.lastName}`
            : "N/A",

          generatedDate: formatDate(payroll.generatedAt),
        }));

        setPayrolls(sanitizedData);
      }
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to fetch payrolls.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const handleGeneratePayroll = async (formData) => {
    try {
      setGenerateLoading(true);

      const res = await api.post("/payroll/generate", formData);

      if (res.data.success) {
        toast.success("Payroll generated successfully.");

        setIsGenerateModalOpen(false);

        await fetchPayrolls();
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to generate payroll.",
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleViewPayroll = (row) => {
    setSelectedPayroll(row);
    setIsViewModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Employee",
        accessor: "employee",
        cell: ({ value }) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {value.employeeCode} - {value.firstName} {value.lastName}
            </span>

            <span className="text-xs text-muted-foreground">
              {value.officialEmail || value.personalEmail || "-"}
            </span>
          </div>
        ),
      },

      {
        header: "Month",
        accessor: "payrollMonth",
        align: "center",
      },

      {
        header: "Year",
        accessor: "payrollYear",
        align: "center",
      },

      {
        header: "Gross Salary",
        accessor: "grossSalary",
        align: "right",
        cell: ({ value }) => (
          <span className="font-medium">
            ₹ {Number(value).toLocaleString("en-IN")}
          </span>
        ),
      },

      {
        header: "Net Salary",
        accessor: "netSalary",
        align: "right",
        cell: ({ value }) => (
          <span className="font-semibold text-success">
            ₹ {Number(value).toLocaleString("en-IN")}
          </span>
        ),
      },

      {
        header: "Generated",
        accessor: "generatedDate",
      },

      {
        header: "Actions",
        accessor: "actions",
        exportable: false,
        align: "center",
        cell: ({ row }) => (
          <button
            type="button"
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleViewPayroll(row);
            }}
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Payroll</h2>

        <Button
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsGenerateModalOpen(true)}
        >
          Generate Payroll
        </Button>
      </div>

      <DataTable
        title="Generated Payroll"
        columns={columns}
        data={payrolls}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["employeeName", "payrollMonth", "payrollYear"]}
        placeholderSearch="Search employee"
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertPayrollModal
        open={isGenerateModalOpen}
        loading={generateLoading}
        employees={employees}
        employeeLoading={employeeLoading}
        onSubmit={handleGeneratePayroll}
        onCancel={() => {
          setIsGenerateModalOpen(false);
        }}
      />

      <ViewPayrollModal
        open={isViewModalOpen}
        payrollId={selectedPayroll?._id}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedPayroll(null);
        }}
      />
    </div>
  );
};

export default Payroll;
