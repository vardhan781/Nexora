import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";
import { UpsertLeaveBalanceModal } from "../components/modules/UpsertLeaveBalanceModal";

const LeaveBalance = () => {
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedLeaveBalance, setSelectedLeaveBalance] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [balanceToDelete, setBalanceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLeaveBalances = async () => {
    setLoading(true);
    try {
      const response = await api.get("/leave-balance/leave-balances");
      if (response.data.success) {
        const normalizedData = (response.data.data || []).map((item) => ({
          ...item,
          leaveTypeName: item.leaveType?.name || "Unknown",
          employeeName: item.employee
            ? `${item.employee.firstName || ""} ${item.employee.lastName || ""}`.trim() ||
              item.employee.employeeCode
            : "Deleted Employee",
        }));

        setLeaveBalances(normalizedData);
      }
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      toast.error("Failed to fetch leave balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveBalances();
  }, []);

  const handleAddClick = () => {
    setSelectedLeaveBalance(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedLeaveBalance(row);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setBalanceToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      const payload = {
        ...formData,
        allocatedDays: Number(formData.allocatedDays),
        year: Number(formData.year),
      };

      if (selectedLeaveBalance) {
        const res = await api.put(
          `/leave-balance/${selectedLeaveBalance._id}`,
          payload,
        );
        if (res.data.success) {
          toast.success("Leave balance updated successfully");
        }
      } else {
        const res = await api.post("/leave-balance/add", payload);
        if (res.data.success) {
          toast.success("Leave balance allocated successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedLeaveBalance(null);
      await fetchLeaveBalances();
    } catch (error) {
      console.error("Upsert error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteLeaveBalance = async () => {
    if (!balanceToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/leave-balance/${balanceToDelete._id}`);
      if (res.data.success) {
        toast.success("Leave balance deleted successfully");
        setDeleteModalOpen(false);
        setBalanceToDelete(null);
        await fetchLeaveBalances();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete leave balance",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Employee",
        accessor: "employeeName",
        cell: ({ row }) => {
          const emp = row.employee;
          return emp ? (
            <span className="text-foreground font-medium">
              {`${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                emp.employeeCode}
            </span>
          ) : (
            <span className="text-muted-foreground italic">
              Deleted Employee
            </span>
          );
        },
      },
      {
        header: "Leave Type",
        accessor: "leaveTypeName",
        type: "select",
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {row.leaveType?.name || "Unknown"}
          </span>
        ),
      },
      {
        header: "Year",
        accessor: "year",
        align: "center",
        cell: ({ value }) => (
          <span className="text-muted-foreground">{value}</span>
        ),
      },
      {
        header: "Allocated Days",
        accessor: "allocatedDays",
        align: "center",
        cell: ({ value }) => (
          <span className="font-semibold text-success">{value} Days</span>
        ),
      },
      {
        header: "Used Days",
        accessor: "usedDays",
        align: "center",
        cell: ({ value }) => <span>{value || 0} Days</span>,
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
                handleDeleteClick(row);
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
        <div className="flex flex-col gap-0.5">
          <h2 className="text-foreground font-semibold text-xl">
            Leave Balance Allocation
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage yearly leave structures and resource allocations.
          </p>
        </div>
        <Button
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddClick}
        >
          Allocate New Leave
        </Button>
      </div>

      <DataTable
        title="Current Leave Allocations"
        columns={columns}
        data={leaveBalances}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["employeeName", "year"]}
        placeholderSearch="Search by employees or year"
        enableQuickFilter={true}
        predefinedFilter={"leaveTypeName"}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertLeaveBalanceModal
        open={isModalOpen}
        leaveBalanceData={selectedLeaveBalance}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedLeaveBalance(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Leave Balance"
        description={`Are you sure you want to delete this allocation record? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteLeaveBalance}
        onCancel={() => {
          setDeleteModalOpen(false);
          setBalanceToDelete(null);
        }}
      />
    </div>
  );
};

export default LeaveBalance;
