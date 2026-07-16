import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { LeaveApprovalModal } from "../components/modules/LeaveApprovalModal";
import { formatDate } from "../utils/dateUtils";

const LeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchPendingRequests = async () => {
    setLoading(true);

    try {
      const response = await api.get("/leave-approval/pending");

      if (response.data.success) {
        const sanitizedData = response.data.data.map((item) => ({
          ...item,
          employeeName: item.employee?.firstName ?? "N/A",
          leaveType: item.leaveType?.name ?? "N/A",
          fromDate: formatDate(item.fromDate),
          toDate: formatDate(item.toDate),
        }));

        setLeaveRequests(sanitizedData);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to fetch pending requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = (row) => {
    setSelectedRequest(row);
    setActionType("approve");
    setModalOpen(true);
  };

  const handleReject = (row) => {
    setSelectedRequest(row);
    setActionType("reject");
    setModalOpen(true);
  };

  const handleSubmit = async ({ remarks }) => {
    if (!selectedRequest) return;

    setSubmitLoading(true);

    try {
      const endpoint =
        actionType === "approve"
          ? `/leave-approval/${selectedRequest._id}/approve`
          : `/leave-approval/${selectedRequest._id}/reject`;

      const response = await api.patch(endpoint, {
        remarks,
      });

      if (response.data.success) {
        toast.success(
          actionType === "approve"
            ? "Leave approved successfully"
            : "Leave rejected successfully",
        );

        setModalOpen(false);
        setSelectedRequest(null);
        setActionType(null);

        await fetchPendingRequests();
      }
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Employee",
        accessor: "employeeName",
      },
      {
        header: "Leave Type",
        accessor: "leaveType",
      },
      {
        header: "Reason",
        accessor: "reason",
      },
      {
        header: "From",
        accessor: "fromDate",
      },
      {
        header: "To",
        accessor: "toDate",
      },
      {
        header: "Days",
        accessor: "totalDays",
        align: "center",
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
                handleApprove(row);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-success hover:bg-success/10 transition-all duration-200 focus:outline-none cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReject(row);
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 focus:outline-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Leave Approvals</h2>

      <DataTable
        title="Pending Leave Requests"
        columns={columns}
        data={leaveRequests}
        loading={loading}
        enableSerialNumber
        enableSearch
        searchFields={["employeeName", "leaveType", "reason", "status"]}
        placeholderSearch="Search requests"
        enablePagination
        defaultPageSize={10}
      />

      <LeaveApprovalModal
        open={modalOpen}
        action={actionType}
        loading={submitLoading}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRequest(null);
          setActionType(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default LeaveApproval;
