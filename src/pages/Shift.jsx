import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertShiftModal } from "../components/modules/UpsertShiftModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const Shift = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/shift/shifts");
      if (response.data.success) {
        setShifts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Failed to fetch shifts data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleAddClick = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedShift(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedShift) {
        const res = await api.put(`/shift/${selectedShift._id}`, formData);
        if (res.data.success) {
          toast.success("Shift updated successfully");
        }
      } else {
        const res = await api.post("/shift/add", formData);
        if (res.data.success) {
          toast.success("Shift created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedShift(null);
      await fetchShifts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteShift = async () => {
    if (!shiftToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/shift/${shiftToDelete._id}`);
      if (res.data.success) {
        toast.success("Shift deleted successfully");
        setDeleteModalOpen(false);
        setShiftToDelete(null);
        await fetchShifts();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete shift");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setShiftToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Shift Name",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Shift Code",
        accessor: "code",
      },
      {
        header: "Start Time",
        accessor: "startTime",
        cell: ({ value }) => (
          <code className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs text-foreground">
            {value}
          </code>
        ),
      },
      {
        header: "End Time",
        accessor: "endTime",
        cell: ({ value }) => (
          <code className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs text-foreground">
            {value}
          </code>
        ),
      },
      {
        header: "Total Hours",
        accessor: "totalHours",
        cell: ({ value }) => (
          <span className="text-foreground">
            {value !== undefined && value !== null ? `${value} Hrs` : "-"}
          </span>
        ),
      },
      {
        header: "Grace Minutes",
        accessor: "graceMinutes",
        cell: ({ value }) => (
          <span className="text-muted-foreground">
            {value !== undefined && value !== null ? `${value} Mins` : "-"}
          </span>
        ),
      },
      {
        header: "Half Day Hours",
        accessor: "halfDayHours",
        cell: ({ value }) => (
          <span className="text-muted-foreground">
            {value !== undefined && value !== null ? `${value} Hrs` : "-"}
          </span>
        ),
      },
      {
        header: "Night Shift",
        accessor: "isNightShift",
        cell: ({ value }) => (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              value
                ? "bg-primary/10 text-primary border border-border"
                : "bg-muted text-muted-foreground border border-transparent"
            }`}
          >
            {value ? "Yes" : "No"}
          </span>
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
        <h2 className="text-foreground font-semibold text-xl">Configuration</h2>
        <Button
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddClick}
        >
          Add Shift
        </Button>
      </div>

      <DataTable
        title="Shifts"
        columns={columns}
        data={shifts}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name"]}
        placeholderSearch="Search by shift name"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertShiftModal
        open={isModalOpen}
        shiftData={selectedShift}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedShift(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Shift"
        description={`Are you sure you want to delete "${
          shiftToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteShift}
        onCancel={() => {
          setDeleteModalOpen(false);
          setShiftToDelete(null);
        }}
      />
    </div>
  );
};

export default Shift;
