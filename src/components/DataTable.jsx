import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  FilterX,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "../utils/utils";
import { Select } from "./Select";
import { Button } from "./Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const sizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const cellPaddingStyles = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-5 py-4",
};

export const DataTable = ({
  title = "",
  columns = [],
  data = [],
  enableSerialNumber = true,
  enableQuickFilter = false,
  predefinedFilter,
  enablePagination = true,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  enableSearch = true,
  placeholderSearch,
  searchFields = [],
  enableExport = true,
  loading = false,
  size = "md",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilterValue, setQuickFilterValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const processedColumns = useMemo(() => {
    const baseColumns = [...columns];
    if (enableSerialNumber) {
      baseColumns.unshift({
        header: "Sr. No.",
        accessor: "_serialNumber",
        align: "center",
        width: "80px",
        exportable: true,
      });
    }
    return baseColumns;
  }, [columns, enableSerialNumber]);

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const getColumnOptions = (column) => {
    if (column.type !== "select") return [];

    const uniqueValues = new Set();

    data.forEach((row) => {
      const value = getNestedValue(row, column.accessor);

      if (value !== null && value !== undefined && value !== "") {
        const label =
          typeof value === "object"
            ? value.roleName || JSON.stringify(value)
            : String(value);

        uniqueValues.add(label);
      }
    });

    return Array.from(uniqueValues).map((label) => ({
      value: label,
      label: label,
    }));
  };

  const quickFilterColumn = useMemo(() => {
    if (!enableQuickFilter || !predefinedFilter) return null;
    const col = processedColumns.find(
      (col) => col.accessor === predefinedFilter && col.type === "select",
    );
    if (!col) return null;

    return {
      ...col,
      options: getColumnOptions(col),
    };
  }, [enableQuickFilter, predefinedFilter, processedColumns, data]);

  const searchableFields = useMemo(() => {
    if (searchFields && searchFields.length > 0) {
      return searchFields;
    }

    if (placeholderSearch) {
      const extractedAccessors = processedColumns
        .filter((col) =>
          placeholderSearch.toLowerCase().includes(col.header.toLowerCase()),
        )
        .map((col) => col.accessor);

      if (extractedAccessors.length > 0) return extractedAccessors;
    }

    return processedColumns
      .filter((col) => col.type !== "number" && col.type !== "select")
      .map((col) => col.accessor);
  }, [processedColumns, searchFields, placeholderSearch]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (quickFilterColumn && quickFilterValue) {
      filtered = filtered.filter((row) => {
        const value = getNestedValue(row, quickFilterColumn.accessor);
        if (!value) return false;

        const rowLabel =
          typeof value === "object" ? value.roleName : String(value);
        return (
          String(rowLabel).toLowerCase() ===
          String(quickFilterValue).toLowerCase()
        );
      });
    }

    if (enableSearch && searchTerm) {
      filtered = filtered.filter((row) =>
        searchableFields.some((field) => {
          const value = getNestedValue(row, field);
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        }),
      );
    }

    return filtered;
  }, [
    data,
    quickFilterColumn,
    quickFilterValue,
    enableSearch,
    searchTerm,
    searchableFields,
  ]);

  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, enablePagination]);

  const totalPages = enablePagination
    ? Math.ceil(filteredData.length / pageSize)
    : 1;
  const startEntry = enablePagination ? (currentPage - 1) * pageSize + 1 : 1;
  const endEntry = enablePagination
    ? Math.min(currentPage * pageSize, filteredData.length)
    : filteredData.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, quickFilterValue, pageSize]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setQuickFilterValue("");
  };

  const renderCell = (column, row, rowIndex) => {
    if (column.accessor === "_serialNumber") {
      return (
        <span className="text-foreground font-medium">
          {startEntry + rowIndex}
        </span>
      );
    }

    let value = getNestedValue(row, column.accessor);

    if (column.cell) {
      return column.cell({ value, row, index: rowIndex });
    }

    if (column.type === "number") {
      return <span className="text-foreground">{value ?? "-"}</span>;
    }

    const limit = column.maxTextLength ?? 50;

    let stringifiedValue = "-";
    if (value !== null && value !== undefined && value !== "") {
      stringifiedValue = String(value);
    }

    if (stringifiedValue.length > limit) {
      return (
        <span
          title={stringifiedValue}
          className="block truncate max-w-xs md:max-w-md text-foreground"
        >
          {stringifiedValue.slice(0, limit)}...
        </span>
      );
    }

    return <span className="text-foreground">{stringifiedValue}</span>;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const fileName = title
      ? `${title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}`
      : `exported-data-${new Date().toISOString().split("T")[0]}`;

    if (title) {
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    }

    const exportColumns = processedColumns.filter(
      (col) => col.exportable !== false,
    );

    const tableHeaders = exportColumns.map((col) => col.header);

    const tableRows = filteredData.map((row, index) =>
      exportColumns.map((col) => {
        if (col.accessor === "_serialNumber") {
          return index + 1;
        }

        let value = getNestedValue(row, col.accessor);
        if (col.type === "select" && value) {
          return String(value).charAt(0).toUpperCase() + String(value).slice(1);
        }
        return value ?? "-";
      }),
    );

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: title ? 40 : 20,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.save(`${fileName}.pdf`);
  };

  const searchPlaceholderText = useMemo(() => {
    if (placeholderSearch) return placeholderSearch;
    const headers = searchableFields
      .map(
        (field) =>
          processedColumns.find((col) => col.accessor === field)?.header,
      )
      .filter(Boolean);
    return headers.length ? `Search by ${headers.join(", ")}` : "Search";
  }, [placeholderSearch, processedColumns, searchableFields]);

  const hasActiveFilters = !!(searchTerm || quickFilterValue);

  const iconSize = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" }[size];
  const sizeClass = sizeStyles[size];
  const cellPadding = cellPaddingStyles[size];

  return (
    <div
      className={cn(
        "w-full bg-card rounded-lg border border-border overflow-hidden",
        className,
      )}
    >
      {title && (
        <div className="px-4 pt-4 pb-2 border-b border-border bg-muted/5">
          <h3
            className={cn(
              "font-semibold text-foreground",
              size === "sm"
                ? "text-base"
                : size === "md"
                  ? "text-lg"
                  : "text-xl",
            )}
          >
            {title}
          </h3>
        </div>
      )}

      <div className="p-4 border-b border-border bg-muted/5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {enableSearch && (
            <div className="relative w-full md:w-72 lg:w-96 shrink-0">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
                  iconSize,
                )}
              />
              <input
                type="text"
                placeholder={searchPlaceholderText}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all",
                  sizeClass,
                )}
              />
            </div>
          )}

          <div className="flex flex-row items-center gap-2 w-full md:w-auto md:justify-end">
            {enableQuickFilter &&
              quickFilterColumn &&
              quickFilterColumn.options.length > 0 && (
                <Select
                  size="sm"
                  options={[
                    { value: "", label: "All" },
                    ...quickFilterColumn.options,
                  ]}
                  value={quickFilterValue}
                  onChange={(e) => setQuickFilterValue(e.target.value)}
                  placeholder={`Filter by ${quickFilterColumn.header}`}
                  className="flex-1 sm:flex-none min-w-25 sm:min-w-30"
                />
              )}
            {enableExport && filteredData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                leftIcon={<Download className="w-4 h-4" />}
                className="flex-1 sm:flex-none justify-center"
              >
                Export
              </Button>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                leftIcon={<FilterX className="w-4 h-4" />}
                className="flex-1 sm:flex-none justify-center"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="block w-full overflow-x-auto max-w-full">
        <table className="w-full min-w-max border-collapse text-left">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              {processedColumns.map((col, idx) => {
                const isNumber = col.type === "number";
                const alignText =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right" || (isNumber && !col.align)
                      ? "text-right"
                      : "text-left";
                const alignFlex =
                  col.align === "center"
                    ? "justify-center"
                    : col.align === "right" || (isNumber && !col.align)
                      ? "justify-end"
                      : "justify-start";

                return (
                  <th
                    key={idx}
                    className={cn(
                      cellPadding,
                      "font-semibold text-foreground whitespace-nowrap",
                      alignText,
                    )}
                    style={
                      col.width
                        ? {
                            width: col.width,
                            minWidth: col.width,
                            maxWidth: col.width,
                          }
                        : { minWidth: "120px" }
                    }
                  >
                    <div className={cn("flex items-center gap-1", alignFlex)}>
                      {col.header}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={processedColumns.length}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Loading Data
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={processedColumns.length}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText
                      className={cn(
                        "text-muted-foreground",
                        size === "sm" ? "w-12 h-12" : "w-16 h-16",
                      )}
                    />
                    <span className="text-muted-foreground">
                      No data available
                    </span>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer text-foreground"
                >
                  {processedColumns.map((col, colIndex) => {
                    const isNumber = col.type === "number";
                    const alignText =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right" || (isNumber && !col.align)
                          ? "text-right"
                          : "text-left";

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          cellPadding,
                          alignText,
                          "whitespace-nowrap",
                        )}
                        style={
                          col.width
                            ? {
                                width: col.width,
                                minWidth: col.width,
                                maxWidth: col.width,
                              }
                            : { minWidth: "120px" }
                        }
                      >
                        {renderCell(col, row, rowIndex)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && filteredData.length > 0 && (
        <div className="p-3 sm:p-4 border-t border-border bg-muted/5">
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 w-full">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-sm text-muted-foreground whitespace-nowrap">
                  Rows per page:
                </span>
                <Select
                  size="sm"
                  dropdownPosition="up"
                  options={pageSizeOptions.map((opt) => ({
                    value: String(opt),
                    label: String(opt),
                  }))}
                  value={String(pageSize)}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-16 sm:w-20"
                />
              </div>
              <span className="hidden lg:inline-block text-sm text-muted-foreground whitespace-nowrap">
                Showing {startEntry} to {endEntry} of {filteredData.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={cn(
                  "p-1.5 sm:p-2 rounded-md transition-colors",
                  currentPage === 1
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-foreground hover:bg-muted cursor-pointer",
                )}
              >
                <ChevronsLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "p-1.5 sm:p-2 rounded-md transition-colors",
                  currentPage === 1
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-foreground hover:bg-muted cursor-pointer",
                )}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-muted rounded-md text-foreground whitespace-nowrap mx-0.5 sm:mx-1">
                <span className="hidden sm:inline">Page </span>
                {currentPage}
                <span className="hidden sm:inline"> of </span>
                <span className="sm:hidden"> / </span>
                {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={cn(
                  "p-1.5 sm:p-2 rounded-md transition-colors",
                  currentPage === totalPages
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-foreground hover:bg-muted cursor-pointer",
                )}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-1.5 sm:p-2 rounded-md transition-colors",
                  currentPage === totalPages
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-foreground hover:bg-muted cursor-pointer",
                )}
              >
                <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
