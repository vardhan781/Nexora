import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertAttendanceStatusModal } from "../components/modules/UpsertAttendanceStatusModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const AttendanceStatus = () => {
  const [attendanceStatus, setAttendanceStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] =
    useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAttendanceStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get("/attendance-status/attendance-statuses");
      if (response.data.success) {
        setAttendanceStatus(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching attendance statuses:", error);
      toast.error("Failed to fetch attendance status data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const handleAddClick = () => {
    setSelectedAttendanceStatus(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedAttendanceStatus(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedAttendanceStatus) {
        const res = await api.put(
          `/attendance-status/${selectedAttendanceStatus._id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Attendance status updated successfully");
        }
      } else {
        const res = await api.post("/attendance-status/add", formData);
        if (res.data.success) {
          toast.success("Attendance status created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedAttendanceStatus(null);
      await fetchAttendanceStatus();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteAttendanceStatus = async () => {
    if (!statusToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/attendance-status/${statusToDelete._id}`);
      if (res.data.success) {
        toast.success("Attendance status deleted successfully");
        setDeleteModalOpen(false);
        setStatusToDelete(null);
        await fetchAttendanceStatus();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete attendance status",
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
        header: "Attendance Status Name",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Attendance Status Code",
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
          Add Attendance Status
        </Button>
      </div>

      <DataTable
        title="Attendance Status"
        columns={columns}
        data={attendanceStatus}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "code"]}
        placeholderSearch="Search by name or code"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertAttendanceStatusModal
        open={isModalOpen}
        attendanceStatusData={selectedAttendanceStatus}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedAttendanceStatus(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Attendance Status"
        description={`Are you sure you want to delete "${
          statusToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteAttendanceStatus}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStatusToDelete(null);
        }}
      />
    </div>
  );
};

export default AttendanceStatus;
