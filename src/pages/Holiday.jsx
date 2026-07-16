import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertHolidayModal } from "../components/modules/UpsertHolidayModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";
import { formatDate } from "../utils/dateUtils";

const Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await api.get("/holiday/holidays");
      if (response.data.success) {
        setHolidays(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Failed to fetch holidays data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddClick = () => {
    setSelectedHoliday(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedHoliday(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedHoliday) {
        const res = await api.put(`/holiday/${selectedHoliday._id}`, formData);
        if (res.data.success) {
          toast.success("Holiday updated successfully");
        }
      } else {
        const res = await api.post("/holiday/add", formData);
        if (res.data.success) {
          toast.success("Holiday created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedHoliday(null);
      await fetchHolidays();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteHoliday = async () => {
    if (!holidayToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/holiday/${holidayToDelete._id}`);
      if (res.data.success) {
        toast.success("Holiday deleted successfully");
        setDeleteModalOpen(false);
        setHolidayToDelete(null);
        await fetchHolidays();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete holiday");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setHolidayToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Holiday",
        accessor: "name",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Date",
        accessor: "date",
        cell: ({ value }) => <span>{formatDate(value)}</span>,
      },
      {
        header: "Description",
        accessor: "description",
      },
      {
        header: "Type",
        accessor: "type",
        type: "select",
        cell: ({ value }) => (
          <code className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs text-foreground">
            {value}
          </code>
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
          Add Holiday
        </Button>
      </div>

      <DataTable
        title="Holidays"
        columns={columns}
        data={holidays}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["name", "type"]}
        placeholderSearch="Search by name or type"
        enableQuickFilter={true}
        predefinedFilter={"type"}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertHolidayModal
        open={isModalOpen}
        holidayData={selectedHoliday}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedHoliday(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Holiday"
        description={`Are you sure you want to delete "${
          holidayToDelete?.name || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteHoliday}
        onCancel={() => {
          setDeleteModalOpen(false);
          setHolidayToDelete(null);
        }}
      />
    </div>
  );
};

export default Holiday;
