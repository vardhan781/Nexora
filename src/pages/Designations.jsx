import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertDesignationModal } from "../components/modules/UpsertDesignationModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [desgToDelete, setDesgToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleAddClick = () => {
    setSelectedDesignation(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedDesignation(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedDesignation) {
        const res = await api.put(
          `/designations/${selectedDesignation._id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Designation updated successfully");
        }
      } else {
        const res = await api.post("/designations/add", formData);
        if (res.data.success) {
          toast.success("Designation created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedDesignation(null);
      await fetchDesignations();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteDesignation = async () => {
    if (!desgToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/designations/${desgToDelete._id}`);
      if (res.data.success) {
        toast.success("Designation deleted successfully");
        setDeleteModalOpen(false);
        setDesgToDelete(null);
        await fetchDesignations();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete designation",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setDesgToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Designation Name",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Designation Code",
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
          Add Designation
        </Button>
      </div>

      <DataTable
        title="Designations"
        columns={columns}
        data={designations}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "code"]}
        placeholderSearch="Search by name or code"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertDesignationModal
        open={isModalOpen}
        designationData={selectedDesignation}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedDesignation(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Designation"
        description={`Are you sure you want to delete "${
          desgToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteDesignation}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDesgToDelete(null);
        }}
      />
    </div>
  );
};

export default Designations;
