import React, { useEffect, useRef } from "react";
import { cn } from "../utils/utils";
import { Button } from "./Button";
import { X } from "lucide-react";

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-2xl",
  "2xl": "max-w-3xl",
  "3xl": "max-w-4xl",
  full: "max-w-[90vw]",
};

export const Modal = ({
  open = false,
  onOpenChange,
  title = "",
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  size = "md",
  showFooter = true,
  showCloseButton = true,
  confirmVariant = "default",
  loading = false,
  className = "",
  contentClassName = "",
}) => {
  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);

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

      if (initialFocusRef.current) {
        initialFocusRef.current.focus();
      }
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
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs transition-all duration-200 h-screen"
        onClick={handleOutsideClick}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className={cn(
            "relative flex flex-col bg-background rounded-lg shadow-xl w-full max-h-[90vh]",
            sizeStyles[size],
            className,
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-foreground"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-1 ml-auto rounded-sm opacity-70 text-muted-foreground hover:text-foreground transition-opacity hover:opacity-100 hover:bg-muted cursor-pointer focus:outline-none"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div
            className={cn("flex-1 overflow-y-auto px-6 py-4", contentClassName)}
          >
            {children}
          </div>

          {showFooter && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              {cancelText && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                variant={confirmVariant}
                onClick={handleConfirm}
                isLoading={loading}
                disabled={loading}
              >
                {confirmText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
