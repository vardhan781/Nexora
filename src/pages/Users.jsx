import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertUserModal } from "../components/modules/UpsertUserModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees/employees");

      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch employees");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles/roles");

      if (res.data.success) {
        setRoles(
          res.data.data.map((r) => ({
            value: r._id,
            label: r.roleName,
          })),
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/users");

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchEmployees();
  }, []);

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedUser(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedUser) {
        const res = await api.put(`/users/${selectedUser._id}`, formData);
        if (res.data.success) {
          toast.success("User updated successfully");
        }
      } else {
        const res = await api.post("/users/add", formData);
        if (res.data.success) {
          toast.success("User created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete?._id) return;

    setDeleteLoading(true);
    try {
      const res = await api.delete(`/users/${userToDelete._id}`);

      if (res.data.success) {
        toast.success("User deleted successfully");
        setDeleteModalOpen(false);
        setUserToDelete(null);
        await fetchUsers();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setUserToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessor: "firstName",
        cell: ({ row }) => (
          <span className="text-foreground font-medium">
            {`${row.firstName} ${row.lastName || ""}`.trim()}
          </span>
        ),
      },
      {
        header: "Username",
        accessor: "username",
        cell: ({ value }) => (
          <span className="text-muted-foreground">{value}</span>
        ),
      },
      {
        header: "Email",
        accessor: "email",
        cell: ({ value }) => <span className="text-foreground">{value}</span>,
      },
      {
        header: "Role",
        accessor: "role",
        type: "select",
        cell: ({ value }) => (
          <code className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs text-foreground">
            {value?.roleName || "No Role"}
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
        <h2 className="text-foreground font-semibold text-xl">
          User Management
        </h2>
        <Button
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddClick}
        >
          Add User
        </Button>
      </div>

      <DataTable
        title="Users"
        columns={columns}
        data={users}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["firstName", "lastName", "username", "email"]}
        placeholderSearch="Search by name, username, or email"
        enableQuickFilter={true}
        predefinedFilter={"role"}
        enablePagination={true}
        defaultPageSize={10}
      />

      <UpsertUserModal
        open={isModalOpen}
        userData={selectedUser}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpsertSubmit}
        roles={roles}
        employees={employees}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete User"
        description={`Are you sure you want to delete user "${
          userToDelete?.username || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};

export default Users;
