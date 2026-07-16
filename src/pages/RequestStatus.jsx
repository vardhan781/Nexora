import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertRequestStatusModal } from "../components/modules/UpsertRequestStatusModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const RequestStatus = () => {
  const [requestStatus, setRequestStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedRequestStatus, setSelectedRequestStatus] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRequestStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get("/request-status/request-statuses");
      if (response.data.success) {
        setRequestStatus(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching request statuses:", error);
      toast.error("Failed to fetch request status data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestStatus();
  }, []);

  const handleAddClick = () => {
    setSelectedRequestStatus(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedRequestStatus(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedRequestStatus) {
        const res = await api.put(
          `/request-status/${selectedRequestStatus._id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Request status updated successfully");
        }
      } else {
        const res = await api.post("/request-status/add", formData);
        if (res.data.success) {
          toast.success("Request status created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedRequestStatus(null);
      await fetchRequestStatus();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteRequestStatus = async () => {
    if (!statusToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/request-status/${statusToDelete._id}`);
      if (res.data.success) {
        toast.success("Request status deleted successfully");
        setDeleteModalOpen(false);
        setStatusToDelete(null);
        await fetchRequestStatus();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete request status",
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
        header: "Request Status Name",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Request Status Code",
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
          Add Request Status
        </Button>
      </div>

      <DataTable
        title="Request Status"
        columns={columns}
        data={requestStatus}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "code"]}
        placeholderSearch="Search by name or code"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertRequestStatusModal
        open={isModalOpen}
        requestStatusData={selectedRequestStatus}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRequestStatus(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Request Status"
        description={`Are you sure you want to delete "${
          statusToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteRequestStatus}
        onCancel={() => {
          setDeleteModalOpen(false);
          setStatusToDelete(null);
        }}
      />
    </div>
  );
};

export default RequestStatus;
