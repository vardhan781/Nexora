import React, { useEffect, useState, useRef, useMemo } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { Checkbox } from "../Checkbox";
import { FolderGit2, Link, Settings, Hash } from "lucide-react";
import { Select } from "../Select";

export const UpsertMenuModal = ({
  open,
  onCancel,
  onSubmit,
  menuData,
  rawMenus = [],
  loading,
}) => {
  const isEditMode = !!menuData;

  const [modalLoading, setModalLoading] = useState(false);

  const menuNameRef = useRef(null);
  const menuCodeRef = useRef(null);
  const routeRef = useRef(null);
  const parentMenuRef = useRef(null);
  const isFormValidRef = useRef(true);

  const [formData, setFormData] = useState({
    menuName: "",
    menuCode: "",
    route: "",
    icon: "",
    displayOrder: 0,
    parentMenu: null,
    isVisible: true,
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && menuData) {
        setFormData({
          menuName: menuData.menuName || "",
          menuCode: menuData.menuCode || "",
          route: menuData.route || "",
          icon: menuData.icon || "",
          displayOrder: menuData.displayOrder || 0,
          parentMenu: menuData.parentMenu || null,
          isVisible: menuData.isVisible ?? true,
          isActive: menuData.isActive ?? true,
        });
      } else {
        setFormData({
          menuName: "",
          menuCode: "",
          route: "",
          icon: "",
          displayOrder: 0,
          parentMenu: null,
          isVisible: true,
          isActive: true,
        });
      }
    }
  }, [open, isEditMode, menuData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "displayOrder" ? Number(value) : value === "" ? null : value,
    }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleConfirmSubmit = () => {
    const isNameValid = menuNameRef.current?.validate();
    const isCodeValid = menuCodeRef.current?.validate();
    const isRouteValid = routeRef.current?.validate();

    if (!isNameValid || !isCodeValid || !isRouteValid) {
      isFormValidRef.current = false;
      return;
    }

    isFormValidRef.current = true;
    onSubmit(formData);
  };

  const parentOptions = useMemo(() => {
    const flatten = (items) => {
      let list = [];
      items.forEach((item) => {
        list.push(item);
        if (item.children && item.children.length > 0) {
          list = list.concat(flatten(item.children));
        }
      });
      return list;
    };

    const flatList = flatten(rawMenus);

    const menuOptions = flatList
      .filter((menu) => {
        const isTopLevel = !menu.parentMenu;
        const isNotSelf = isEditMode ? menu._id !== menuData._id : true;
        const isActiveValue = menu.isActive ?? true;

        return isTopLevel && isNotSelf && isActiveValue;
      })
      .map((menu) => ({
        value: menu._id,
        label: `${menu.menuName} (${menu.menuCode})`,
      }));

    return [
      {
        value: "",
        label: "Root Menu",
      },
      ...menuOptions,
    ];
  }, [rawMenus, isEditMode, menuData]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (!isFormValidRef.current) {
            isFormValidRef.current = true;
            return;
          }

          if (onCancel) {
            onCancel();
          }
        }
      }}
      onConfirm={handleConfirmSubmit}
      loading={loading}
      title={isEditMode ? "Edit Menu" : "Create Menu"}
      confirmText={isEditMode ? "Save Changes" : "Create Menu"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={menuNameRef}
            label="Menu Name"
            name="menuName"
            value={formData.menuName}
            onChange={handleChange}
            placeholder="Menu Name"
            required={true}
            maxLength={50}
            requiredMessage="Menu name is required"
            leftIcon={<FolderGit2 className="w-4 h-4" />}
          />

          <Input
            ref={menuCodeRef}
            label="Menu Code"
            name="menuCode"
            value={formData.menuCode}
            onChange={handleChange}
            placeholder="Menu Code"
            required={true}
            requiredMessage="Menu code is required"
            regex={/^[A-Z_]+$/}
            regexMessage="Only uppercase letters and underscores allowed"
            maxLength={50}
            leftIcon={<Hash className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            ref={routeRef}
            label="Route Path"
            name="route"
            value={formData.route}
            onChange={handleChange}
            placeholder="Menu Path"
            required={true}
            requiredMessage="Path is required"
            regex={/^\/[a-z0-9\-\#\/]*$/}
            regexMessage="Must start with '/' and contain only lowercase letters, numbers, '-', or '#'"
            maxLength={50}
            leftIcon={<Link className="w-4 h-4" />}
          />

          <Input
            label="Icon Name"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="Icon Name"
            leftIcon={<Settings className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Display Order"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleChange}
            placeholder="0"
            min={0}
          />

          <Select
            ref={parentMenuRef}
            label="Parent Menu"
            name="parentMenu"
            value={formData.parentMenu || ""}
            onChange={handleChange}
            options={parentOptions}
            placeholder="Parent menu"
            required={false}
            hint="Leave empty to create a root menu"
          />
        </div>

        <div className="bg-muted/40 p-4 rounded-xl border border-border flex flex-wrap gap-6 items-center mt-2">
          <Checkbox
            label="Visible"
            checked={formData.isVisible}
            onChange={(e) =>
              handleCheckboxChange("isVisible", e.target.checked)
            }
          />
        </div>
      </div>
    </Modal>
  );
};
