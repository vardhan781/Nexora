import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertEmployeeStatusModal } from "../components/modules/UpsertEmployeeStatusModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const EmployeeStatus = () => {
  const [employeeStatus, setEmployeeStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedEmployeeStatus, setSelectedEmployeeStatus] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  useEffect(() => {
    fetchEmployeeStatus();
  }, []);

  const handleAddClick = () => {
    setSelectedEmployeeStatus(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedEmployeeStatus(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedEmployeeStatus) {
        const res = await api.put(
          `/employee-status/${selectedEmployeeStatus._id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Employee status updated successfully");
        }
      } else {
        const res = await api.post("/employee-status/add", formData);
        if (res.data.success) {
          toast.success("Employee status created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedEmployeeStatus(null);
      await fetchEmployeeStatus();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteEmployeeStatus = async () => {
    if (!statusToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/employee-status/${statusToDelete._id}`);
      if (res.data.success) {
        toast.success("Employee status deleted successfully");
        setDeleteModalOpen(false);
        setStatusToDelete(null);
        await fetchEmployeeStatus();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete employee status",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setStatusToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Employee Status Name",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Employee Status Code",
        accessor: "code",
        cell: ({ value }) => (
          <code className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs text-foreground">
            {value}
          </code>
        ),
      },
      {
        header: "Description",
        accessor: "description",
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
                handleDelete(row);
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
        <h2 className="text-foreground font-semibold text-xl">Configuration</h2>
        <Button
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddClick}
        >
          Add Employee Status
        </Button>
      </div>

      <DataTable
        title="Status"
        columns={columns}
        data={employeeStatus}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "code"]}
        placeholderSearch="Search by name or code"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertEmployeeStatusModal
        open={isModalOpen}
        employeeStatusData={selectedEmployeeStatus}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedEmployeeStatus(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Employee Status"
        description={`Are you sure you want to delete "${
          statusToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteEmployeeStatus}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStatusToDelete(null);
        }}
      />
    </div>
  );
};

export default EmployeeStatus;
