import React, { forwardRef } from "react";
import { cn } from "../utils/utils";

const sizeStyles = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const innerSizeStyles = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

const labelSizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const Radio = forwardRef(
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
            type="radio"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...restProps}
          />
          <div
            className={cn(
              "rounded-full border transition-all duration-200 flex items-center justify-center",
              sizeStyles[size],
              checked ? "border-primary" : "border-border hover:border-primary",
              disabled && "pointer-events-none",
            )}
          >
            {checked && (
              <div
                className={cn(
                  "rounded-full bg-primary",
                  innerSizeStyles[size],
                )}
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

Radio.displayName = "Radio";