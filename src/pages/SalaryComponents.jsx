import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertSalaryComponentModal } from "../components/modules/UpsertSalaryComponentModal";
import { AlertDialog } from "../components/AlertDialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SalaryComponents = () => {
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedSalaryComponent, setSelectedSalaryComponent] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [salaryComponentToDelete, setSalaryComponentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSalaryComponents = async () => {
    setLoading(true);

    try {
      const res = await api.get("/salary-component");

      if (res.data.success) {
        setSalaryComponents(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching salary components:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch salary components",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryComponents();
  }, []);

  const handleAddClick = () => {
    setSelectedSalaryComponent(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedSalaryComponent(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);

    try {
      if (selectedSalaryComponent) {
        const res = await api.put(
          `/salary-component/${selectedSalaryComponent._id}`,
          formData,
        );

        if (res.data.success) {
          toast.success("Salary component updated successfully");
        }
      } else {
        const res = await api.post("/salary-component/add", formData);

        if (res.data.success) {
          toast.success("Salary component created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedSalaryComponent(null);

      await fetchSalaryComponents();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const handleDelete = (row) => {
    setSalaryComponentToDelete(row);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSalaryComponent = async () => {
    if (!salaryComponentToDelete?._id) return;

    setDeleteLoading(true);

    try {
      const res = await api.delete(
        `/salary-component/${salaryComponentToDelete._id}`,
      );

      if (res.data.success) {
        toast.success("Salary component deleted successfully");

        setDeleteModalOpen(false);
        setSalaryComponentToDelete(null);

        await fetchSalaryComponents();
      }
    } catch (error) {
      console.error("Delete salary component error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete salary component",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessor: "name",
      },

      {
        header: "Code",
        accessor: "code",
        cell: ({ value }) => (
          <code className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs text-foreground">
            {value}
          </code>
        ),
      },

      {
        header: "Component Type",
        accessor: "componentType",
        cell: ({ value }) => (
          <span className="text-sm font-medium text-foreground">{value}</span>
        ),
        type: "select",
      },

      {
        header: "Calculation Type",
        accessor: "calculationType",
      },

      {
        header: "Description",
        accessor: "description",
        cell: ({ value }) => (
          <span className="text-muted-foreground">{value || "--"}</span>
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
        <h2 className="text-foreground font-semibold text-xl">
          Salary Components
        </h2>

        <Button
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddClick}
        >
          Add Component
        </Button>
      </div>

      <DataTable
        title="Salary Components List"
        columns={columns}
        data={salaryComponents}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "code", "componentType", "calculationType"]}
        placeholderSearch="Search by name, code, types"
        enablePagination={true}
        enableQuickFilter={true}
        predefinedFilter="componentType"
        defaultPageSize={10}
      />

      <UpsertSalaryComponentModal
        open={isModalOpen}
        salaryComponent={selectedSalaryComponent}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedSalaryComponent(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Salary Component"
        description={`Are you sure you want to delete "${
          salaryComponentToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteSalaryComponent}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSalaryComponentToDelete(null);
        }}
      />
    </div>
  );
};

export default SalaryComponents;
