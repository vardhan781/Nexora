import React, { forwardRef } from "react";
import { cn } from "../utils/utils";
import { Check } from "lucide-react";

const sizeStyles = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const iconSizeStyles = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

const labelSizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const Checkbox = forwardRef(
  (
    {
      checked = false,
      onChange,
      label,
      disabled = false,
      size = "md",
      className = "",
      labelClassName = "",
      ...restProps
    },
    ref,
  ) => {
    const id = React.useId();

    return (
      <label
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...restProps}
          />
          <div
            className={cn(
              "rounded-xs border transition-all duration-200 flex items-center justify-center",
              sizeStyles[size],
              checked
                ? "bg-primary border-primary"
                : "bg-background border-border hover:border-primary/50",
              disabled && "pointer-events-none",
            )}
          >
            {checked && (
              <Check
                className={cn("text-primary-foreground", iconSizeStyles[size])}
                strokeWidth={3}
              />
            )}
          </div>
        </div>
        {label && (
          <span
            className={cn(
              "text-foreground select-none",
              labelSizeStyles[size],
              labelClassName,
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
