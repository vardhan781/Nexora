import React from "react";
import { cn } from "../utils/utils";

export const Card = ({
  title,
  description,
  action = null,
  footer = null,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {(title || description || action) && (
        <div
          className={cn(
            "flex items-start justify-between gap-4 border-b border-border px-6 py-5",
            headerClassName,
          )}
        >
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            )}

            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={cn("p-6", contentClassName)}>{children}</div>

      {footer && (
        <div className="border-t border-border px-6 py-4">{footer}</div>
      )}
    </div>
  );
};
