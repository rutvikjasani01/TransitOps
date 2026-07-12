"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { Input, Select } from "./FormElements";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  filters?: FilterConfig[];
  actions?: React.ReactNode;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKey,
  filters = [],
  actions,
  onRowClick,
  pageSize: initialPageSize = 5
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset page when search or filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value === "ALL" || !value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter, Search and Sort Pipeline
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Filter
    Object.entries(activeFilters).forEach(([key, value]) => {
      result = result.filter(item => {
        const itemVal = item[key];
        if (itemVal === undefined || itemVal === null) return false;
        return String(itemVal).toLowerCase() === value.toLowerCase();
      });
    });

    // 2. Search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        if (searchKey) {
          const val = item[searchKey as string];
          return val ? String(val).toLowerCase().includes(query) : false;
        }
        // Fallback to global row search
        return Object.values(item).some(val =>
          val ? String(val).toLowerCase().includes(query) : false
        );
      });
    }

    // 3. Sort
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return direction === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return direction === "asc" ? -1 : 1;
        if (strA > strB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchKey, activeFilters, sortConfig]);

  // Pagination Math
  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Table Action bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Global Search */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filters */}
          {filters.map(filter => (
            <div key={filter.key} className="flex items-center space-x-1 min-w-[120px]">
              <Select
                value={activeFilters[filter.key] || "ALL"}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="h-9 text-xs py-1"
              >
                <option value="ALL">All {filter.label}</option>
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>

        {/* Actions slot */}
        {actions && <div className="flex items-center space-x-2 self-end md:self-auto">{actions}</div>}
      </div>

      {/* Table Layout */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card/30 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              {columns.map((col, idx) => (
                <th key={idx} className="p-4 align-middle">
                  {col.sortable && col.accessorKey ? (
                    <button
                      onClick={() => handleSort(col.accessorKey as string)}
                      className="flex items-center space-x-1 hover:text-foreground transition-colors uppercase font-semibold text-xs tracking-wider cursor-pointer"
                    >
                      <span>{col.header}</span>
                      {sortConfig?.key === col.accessorKey ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-55" />
                      )}
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-sm">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col, colIdx) => {
                    const content = col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? row[col.accessorKey as string]
                      : null;

                    return (
                      <td key={colIdx} className="p-4 align-middle font-medium max-w-[250px] truncate">
                        {content !== undefined && content !== null ? content : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="h-10 w-10 opacity-30 text-muted-foreground" />
                    <p className="font-semibold text-base">No results found</p>
                    <p className="text-xs max-w-xs text-muted-foreground">
                      Try adjusting your search query or removing column filters to find what you are looking for.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 text-sm text-muted-foreground px-1">
          <div className="flex items-center space-x-2">
            <span>Rows per page</span>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 w-16 py-0 px-2 text-xs"
            >
              {[5, 10, 20, 50].map(sz => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </Select>
            <span className="hidden sm:inline">
              Showing {Math.min(totalItems, (currentPage - 1) * pageSize + 1)}-
              {Math.min(totalItems, currentPage * pageSize)} of {totalItems} items
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
