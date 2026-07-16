import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertLeaveTypeModal } from "../components/modules/UpsertLeaveTypeModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const LeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/leave-types/leave-types");
      if (response.data.success) {
        setLeaveTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
      toast.error("Failed to fetch leave types data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleAddClick = () => {
    setSelectedLeaveType(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedLeaveType(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedLeaveType) {
        const res = await api.put(
          `/leave-types/${selectedLeaveType._id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Leave type updated successfully");
        }
      } else {
        const res = await api.post("/leave-types/add", formData);
        if (res.data.success) {
          toast.success("Leave type created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedLeaveType(null);
      await fetchLeaveTypes();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteLeaveType = async () => {
    if (!typeToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/leave-types/${typeToDelete._id}`);
      if (res.data.success) {
        toast.success("Leave type deleted successfully");
        setDeleteModalOpen(false);
        setTypeToDelete(null);
        await fetchLeaveTypes();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete leave type",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setTypeToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Leave Type Name",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Leave Type Code",
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
          Add Leave Type
        </Button>
      </div>

      <DataTable
        title="Leave Types"
        columns={columns}
        data={leaveTypes}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "code"]}
        placeholderSearch="Search by name or code"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertLeaveTypeModal
        open={isModalOpen}
        leaveTypeData={selectedLeaveType}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedLeaveType(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Leave Type"
        description={`Are you sure you want to delete "${
          typeToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteLeaveType}
        onCancel={() => {
          setDeleteModalOpen(false);
          setTypeToDelete(null);
        }}
      />
    </div>
  );
};

export default LeaveTypes;
