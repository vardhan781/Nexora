import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/utils";

const variantStyles = {
  default: `
    bg-primary text-primary-foreground 
    hover:bg-primary/90 
    shadow-sm
  `,
  success: `
    bg-success text-primary-foreground 
    hover:bg-success/90 
    shadow-sm
  `,
  warning: `
    bg-warning text-foreground 
    hover:bg-warning/90 
    shadow-sm
  `,
  danger: `
    bg-destructive text-primary-foreground 
    hover:bg-destructive/90 
    shadow-sm
  `,
  outline: `
    bg-transparent border border-border text-foreground 
    hover:bg-secondary/10
  `,
  ghost: `
    bg-transparent text-foreground 
    hover:bg-secondary/10 hover:underline
  `,
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-4 py-2 text-base rounded-lg gap-2",
  lg: "px-6 py-3 text-lg rounded-xl gap-2.5",
};

const baseStyles = `
  inline-flex items-center justify-center font-medium transition-all duration-200
  focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer
`;

export const Button = ({
  children,
  variant = "default",
  size = "md",
  type = "button",
  fullWidth = false,
  isLoading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  className = "",
  disabled = false,
  ...restProps
}) => {
  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className,
  );

  const getSpinnerSize = () => {
    switch (size) {
      case "sm":
        return "w-3 h-3";
      case "lg":
        return "w-5 h-5";
      default:
        return "w-4 h-4";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={combinedClassName}
      {...restProps}
    >
      {isLoading && <Loader2 className={`${getSpinnerSize()} animate-spin`} />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
