import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertRoleModal } from "../components/modules/UpsertRoleModal";
import { Edit, Plus, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/roles/roles");

      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to fetch roles data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddClick = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedRole(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedRole) {
        const res = await api.put(`/roles/${selectedRole._id}`, formData);
        if (res.data.success) {
          toast.success("Role updated successfully");
        }
      } else {
        const res = await api.post("/roles/add", formData);
        if (res.data.success) {
          toast.success("Role created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedRole(null);
      await fetchRoles();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/roles/${roleToDelete._id}`);

      if (res.data.success) {
        toast.success("Role deleted successfully");
        setDeleteModalOpen(false);
        setRoleToDelete(null);
        await fetchRoles();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete role");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setRoleToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Role Name",
        accessor: "roleName",
        cell: ({ value }) => (
          <span className="text-foreground font-medium">{value}</span>
        ),
      },
      {
        header: "Role Code",
        accessor: "roleCode",
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
          Add Role
        </Button>
      </div>

      <DataTable
        title="Roles"
        columns={columns}
        data={roles}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["roleName", "roleCode"]}
        placeholderSearch="Search by title or code"
        enableQuickFilter={true}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertRoleModal
        open={isModalOpen}
        roleData={selectedRole}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRole(null);
        }}
        onSubmit={handleUpsertSubmit}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Role"
        description={`Are you sure you want to delete "${
          roleToDelete?.roleName || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteRole}
        onCancel={() => {
          setDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
      />
    </div>
  );
};

export default Roles;
