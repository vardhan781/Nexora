import React, { useEffect, useRef } from "react";
import { cn } from "../utils/utils";
import { Button } from "./Button";

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

const variantStyles = {
  default: {
    buttonVariant: "default",
  },
  success: {
    buttonVariant: "success",
  },
  destructive: {
    buttonVariant: "danger",
  },
  warning: {
    buttonVariant: "warning",
  },
};

export const AlertDialog = ({
  open = false,
  onOpenChange,
  title = "Are you sure?",
  description = "",
  cancelText = "Cancel",
  confirmText = "Confirm",
  onConfirm,
  onCancel,
  variant = "default",
  size = "md",
  closeOnOutsideClick = false,
  loading = false,
  className = "",
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (!loading) {
      handleClose();
    }
  };

  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open) return null;

  const variantStyle = variantStyles[variant] || variantStyles.default;
  const dialogSize = sizeStyles[size] || sizeStyles.md;

  return (
    <>
      <div
        className="fixed h-screen inset-0 z-50 bg-black/35 backdrop-blur-xs"
        onClick={handleOutsideClick}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className={cn(
            "w-full rounded-lg bg-background shadow-xl",
            dialogSize,
            className,
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6">
            {title && (
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}

            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              {cancelText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                variant={variantStyle.buttonVariant}
                size="sm"
                onClick={handleConfirm}
                isLoading={loading}
                disabled={loading}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
