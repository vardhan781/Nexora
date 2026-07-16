import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Checkbox } from "../components/Checkbox";
import { toast } from "sonner";
import Loader from "../components/Loader";
import { CornerDownRight } from "lucide-react";

const MenuRights = () => {
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const fetchMatrix = async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await api.get(`/menu-rights/${id}`);

      if (res.data.success) {
        setMatrix(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const id = e.target.value;
    setRoleId(id);
    fetchMatrix(id);
  };

  const togglePermission = (menuId, key) => {
    setMatrix((prev) =>
      prev.map((item) =>
        item.menuId === menuId
          ? {
              ...item,
              permissions: {
                ...item.permissions,
                [key]: !item.permissions[key],
              },
            }
          : item,
      ),
    );
  };

  const sortedMatrix = useMemo(() => {
    if (!matrix || matrix.length === 0) return [];

    const roots = matrix.filter((item) => !item.parentMenu);
    const children = matrix.filter((item) => item.parentMenu);

    const childrenByParent = children.reduce((acc, item) => {
      if (!acc[item.parentMenu]) {
        acc[item.parentMenu] = [];
      }
      acc[item.parentMenu].push(item);
      return acc;
    }, {});

    const orderedList = [];

    roots.forEach((root) => {
      orderedList.push({ ...root, isChild: false });

      if (childrenByParent[root.menuId]) {
        childrenByParent[root.menuId].forEach((child) => {
          orderedList.push({ ...child, isChild: true });
        });
      }
    });

    const addedIds = new Set(orderedList.map((item) => item.menuId));
    matrix.forEach((item) => {
      if (!addedIds.has(item.menuId)) {
        orderedList.push({ ...item, isChild: false });
      }
    });

    return orderedList;
  }, [matrix]);

  const handleSave = async () => {
    if (!roleId) {
      toast.error("Please select a role");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put(`/menu-rights/${roleId}`, {
        permissions: matrix,
      });

      if (res.data.success) {
        toast.success("Permissions updated successfully");
      }
    } catch (err) {
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-foreground">Menu Rights</h2>

        {roleId && (
          <Button onClick={handleSave} isLoading={saving}>
            Save Permissions
          </Button>
        )}
      </div>

      <div className="bg-muted/30 border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full md:w-72">
          <Select
            value={roleId}
            onChange={handleRoleChange}
            options={roles}
            placeholder="Select Role"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Select a role to manage menu permissions
        </div>
      </div>

      {roleId && (
        <div className="border border-border rounded-xl overflow-x-auto bg-background">
          <table className="w-full min-w-225 text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="p-4 text-left text-foreground font-medium">
                  Menu
                </th>
                <th className="p-4 text-center text-foreground">View</th>
                <th className="p-4 text-center text-foreground">Create</th>
                <th className="p-4 text-center text-foreground">Edit</th>
                <th className="p-4 text-center text-foreground">Delete</th>
                <th className="p-4 text-center text-foreground">Approve</th>
                <th className="p-4 text-center text-foreground">Export</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {sortedMatrix.map((item) => (
                <tr
                  key={item.menuId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div
                      className={`flex flex-col ${item.isChild ? "pl-5" : "pl-0"}`}
                    >
                      <span className="text-foreground flex items-center gap-2">
                        {item.isChild && (
                          <CornerDownRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                        {item.menuName}
                      </span>
                      <span
                        className={`text-xs text-muted-foreground font-normal ${item.isChild ? "pl-6" : ""}`}
                      >
                        {item.menuCode}
                      </span>
                    </div>
                  </td>

                  {[
                    "view",
                    "create",
                    "edit",
                    "delete",
                    "approve",
                    "export",
                  ].map((key) => (
                    <td key={key} className="p-4 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          size="lg"
                          checked={item.permissions[key]}
                          onChange={() => togglePermission(item.menuId, key)}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MenuRights;
