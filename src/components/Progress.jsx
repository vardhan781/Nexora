import React from "react";
import { cn } from "../utils/utils";

const colorStyles = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
};

export const Progress = ({
  value = 0,
  color = "default",
  showValue = true,
  label,
  className = "",
}) => {
  const progress = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-foreground">{label}</span>
          )}

          {showValue && (
            <span className="text-muted-foreground">
              {progress.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-in-out",
            colorStyles[color],
          )}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
};
