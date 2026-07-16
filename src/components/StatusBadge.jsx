import React from "react";
import { cn } from "../utils/utils";

const variantStyles = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-accent/10 text-accent border-accent/20",
  default: "bg-muted text-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export const StatusBadge = ({
  text,
  variant = "default",
  size = "md",
  className = "",
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {text}
    </span>
  );
};
