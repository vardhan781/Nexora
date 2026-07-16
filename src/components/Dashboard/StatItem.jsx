import React from "react";
import { cn } from "../../utils/utils";

const StatItem = ({
  label,
  value,
  icon = null,
  valueClassName = "",
  className = "",
}) => {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}

      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>

        <span className={cn("font-semibold text-foreground", valueClassName)}>
          {value}
        </span>
      </div>
    </div>
  );
};

export default StatItem;
