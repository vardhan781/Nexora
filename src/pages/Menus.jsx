import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { UpsertMenuModal } from "../components/modules/UpsertMenuModal";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog } from "../components/AlertDialog";

const Menus = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await api.get("/menu/menus");

      if (res.data.success) {
        setMenus(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const flatTableData = useMemo(() => {
    const flatten = (items, parentName = "Root") => {
      let flatList = [];
      items.forEach((item) => {
        flatList.push({
          ...item,
          parentMenuName: item.parentMenu ? parentName : "Root",
        });

        if (item.children && item.children.length > 0) {
          flatList = flatList.concat(flatten(item.children, item.menuName));
        }
      });
      return flatList;
    };

    return flatten(menus);
  }, [menus]);

  const handleAddClick = () => {
    setSelectedMenu(null);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (row) => {
    setSelectedMenu(row);
    setIsModalOpen(true);
  };

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);
    try {
      if (selectedMenu) {
        const res = await api.put(`/menu/${selectedMenu._id}`, formData);
        if (res.data.success) {
          toast.success("Menu configuration updated successfully");
        }
      } else {
        const res = await api.post("/menu/add", formData);
        if (res.data.success) {
          toast.success("Menu created successfully");
        }
      }

      setIsModalOpen(false);
      setSelectedMenu(null);
      await fetchMenus();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setUpsertLoading(false);
    }
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete?._id) return;

    setDeleteLoading(true);

    try {
      const res = await api.delete(`/menu/${menuToDelete._id}`);

      if (res.data.success) {
        toast.success("Menu deleted successfully");
        setDeleteModalOpen(false);
        setMenuToDelete(null);
        await fetchMenus();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete menu");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = (row) => {
    setMenuToDelete(row);
    setDeleteModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        header: "Menu Name",
        accessor: "menuName",
        cell: ({ value, row }) => (
          <span
            className={
              row.parentMenuName !== "Root"
                ? "text-muted-foreground"
                : "text-foreground"
            }
          >
            {value}
          </span>
        ),
      },
      {
        header: "Menu Code",
        accessor: "menuCode",
      },
      {
        header: "Route/Path",
        accessor: "route",
        align: "left",
        cell: ({ value }) => (
          <code className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs text-foreground">
            {value}
          </code>
        ),
      },
      {
        header: "Icon Key",
        accessor: "icon",
      },
      {
        header: "Display Order",
        accessor: "displayOrder",
        type: "number",
        align: "center",
      },
      {
        header: "Parent Node",
        accessor: "parentMenuName",
        cell: ({ value }) => (
          <span
            className={
              value === "Root"
                ? "text-sm font-semibold tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded"
                : "text-sm text-foreground"
            }
          >
            {value}
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
          Add Menu
        </Button>
      </div>
      <DataTable
        title="Menus List"
        columns={columns}
        data={flatTableData}
        loading={loading}
        enableSerialNumber={true}
        enableSearch={true}
        searchFields={["menuName", "menuCode", "route"]}
        placeholderSearch="Search by title, code, or route endpoint"
        enablePagination={true}
        defaultPageSize={10}
      />
      <UpsertMenuModal
        open={isModalOpen}
        menuData={selectedMenu}
        rawMenus={menus}
        loading={upsertLoading}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedMenu(null);
        }}
        onSubmit={handleUpsertSubmit}
      />
      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Menu"
        description={`Are you sure you want to delete "${
          menuToDelete?.menuName || ""
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={confirmDeleteMenu}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMenuToDelete(null);
        }}
      />
    </div>
  );
};

export default Menus;
