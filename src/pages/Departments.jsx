import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertDepartmentModal } from "../components/modules/UpsertDepartmentModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddClick = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedDepartment(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedDepartment) {
        const res = await api.put(
          `/departments/${selectedDepartment._id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Department updated successfully");
        }
      } else {
        const res = await api.post("/departments/add", formData);
        if (res.data.success) {
          toast.success("Department created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedDepartment(null);
      await fetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteDepartment = async () => {
    if (!deptToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/departments/${deptToDelete._id}`);
      if (res.data.success) {
        toast.success("Department deleted successfully");
        setDeleteModalOpen(false);
        setDeptToDelete(null);
        await fetchDepartments();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete department",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setDeptToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Department Name",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Department Code",
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
          Add Department
        </Button>
      </div>

      <DataTable
        title="Departments"
        columns={columns}
        data={departments}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "code"]}
        placeholderSearch="Search by name or code"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertDepartmentModal
        open={isModalOpen}
        departmentData={selectedDepartment}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedDepartment(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Department"
        description={`Are you sure you want to delete "${
          deptToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteDepartment}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeptToDelete(null);
        }}
      />
    </div>
  );
};

export default Departments;
