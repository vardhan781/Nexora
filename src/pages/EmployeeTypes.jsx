import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertEmployeeTypeModal } from "../components/modules/UpsertEmployeeTypeModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const EmployeeTypes = () => {
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  useEffect(() => {
    fetchEmployeeTypes();
  }, []);

  const handleAddClick = () => {
    setSelectedEmployeeType(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedEmployeeType(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedEmployeeType) {
        const res = await api.put(
          `/employee-types/${selectedEmployeeType._id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Employee type updated successfully");
        }
      } else {
        const res = await api.post("/employee-types/add", formData);
        if (res.data.success) {
          toast.success("Employee type created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedEmployeeType(null);
      await fetchEmployeeTypes();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteEmployeeType = async () => {
    if (!statusToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/employee-types/${statusToDelete._id}`);
      if (res.data.success) {
        toast.success("Employee type deleted successfully");
        setDeleteModalOpen(false);
        setStatusToDelete(null);
        await fetchEmployeeTypes();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete employee type",
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
        header: "Employee Type Name",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Employee Type Code",
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
          Add Employee Type
        </Button>
      </div>

      <DataTable
        title="Employee Types"
        columns={columns}
        data={employeeTypes}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "code"]}
        placeholderSearch="Search by name or code"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertEmployeeTypeModal
        open={isModalOpen}
        employeeTypeData={selectedEmployeeType}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedEmployeeType(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Employee Type"
        description={`Are you sure you want to delete "${
          statusToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteEmployeeType}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStatusToDelete(null);
        }}
      />
    </div>
  );
};

export default EmployeeTypes;
