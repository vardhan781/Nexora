import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";
import { UpsertLeaveRequestModal } from "../components/modules/UpsertLeaveRequestModal";
import { formatDate } from "../utils/dateUtils";
import { StatusBadge } from "../components/StatusBadge";

const MyRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeaveRequests = async () => {
    setLoading(true);

    try {
      const response = await api.get("/leave-request/my");

      if (response.data.success) {
        const sanitizedData = response.data.data.map((item) => ({
          ...item,
          type: item.leaveType?.name ?? "N/A",
          status: item.requestStatus?.name ?? "Pending",
        }));

        setLeaveRequests(sanitizedData);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Failed to fetch leave request data");
    } finally {
      setLoading(false);
    }
  };

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

  const leaveTypeOptions = useMemo(() => {
    return leaveTypes.map((item) => ({
      label: `${item.name} (${item.code})`,
      value: item._id,
    }));
  }, [leaveTypes]);

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
  }, []);

  const handleAddClick = () => {
    setSelectedLeaveRequest(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedLeaveRequest(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedLeaveRequest) {
        const res = await api.put(
          `/leave-request/${selectedLeaveRequest._id}`,
          formData,
        );
        if (res.data.success) {
          toast.success("Leave request updated successfully");
        }
      } else {
        const res = await api.post("/leave-request/add", formData);
        if (res.data.success) {
          toast.success("Leave request created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedLeaveRequest(null);
      await fetchLeaveRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteLeaveRequest = async () => {
    if (!requestToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/leave-request/${requestToDelete._id}`);
      if (res.data.success) {
        toast.success("Leave request deleted successfully");
        setDeleteModalOpen(false);
        setRequestToDelete(null);
        await fetchLeaveRequests();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete leave request",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setRequestToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Leave Type",
        accessor: "type",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value || "N/A"}</span>
        ),
      },
      {
        header: "From Date",
        accessor: "fromDate",
        cell: ({ value }) => (
          <span className="text-foreground">{formatDate(value) || "-"}</span>
        ),
      },
      {
        header: "To Date",
        accessor: "toDate",
        cell: ({ value }) => (
          <span className="text-foreground">{formatDate(value) || "-"}</span>
        ),
      },
      {
        header: "Reason",
        accessor: "reason",
      },
      {
        header: "Status",
        accessor: "status",
        type: "select",
        cell: ({ value }) => {
          const status = value?.toUpperCase();

          const variantMap = {
            APPROVED: "success",
            REJECTED: "danger",
            PENDING: "warning",
          };

          return (
            <StatusBadge
              text={value}
              variant={variantMap[status] || "default"}
              size="sm"
            />
          );
        },
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
        <h2 className="text-foreground font-semibold text-xl">My Requests</h2>
        <Button
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddClick}
        >
          Add Leave Request
        </Button>
      </div>

      <DataTable
        title="Leave Requests"
        columns={columns}
        data={leaveRequests}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["type", "status", "reason"]}
        placeholderSearch="Search requests"
        enableQuickFilter={true}
        predefinedFilter="status"
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertLeaveRequestModal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedLeaveRequest(null);
        }}
        onSubmit={handleUpsertSubmit}
        leaveRequestData={selectedLeaveRequest}
        loading={upsertLoading}
        leaveTypeOptions={leaveTypeOptions}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Leave Request"
        description="Are you sure you want to delete this leave request? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteLeaveRequest}
        onCancel={() => {
          setDeleteModalOpen(false);
          setRequestToDelete(null);
        }}
      />
    </div>
  );
};

export default MyRequest;
