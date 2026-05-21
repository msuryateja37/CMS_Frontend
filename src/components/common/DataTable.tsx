import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { Select } from './Select';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string; // For width, alignment, etc.
    sortable?: boolean;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T; // Usage: row[keyField] to get unique ID

    // Selection
    selectable?: boolean;
    selectedIds?: string[]; // Controlled selection state
    onSelectionChange?: (selectedIds: string[]) => void;

    // Actions
    onRowClick?: (item: T) => void;

    // Search & Header
    title?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    onSearch?: (query: string) => void;

    // Filter
    filterable?: boolean;
    filterOptions?: React.ReactNode; // Slot for custom filter buttons

    // Sorting
    sortBy?: keyof T;
    sortOrder?: 'asc' | 'desc';
    onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
    defaultSortBy?: keyof T;
    defaultSortOrder?: 'asc' | 'desc';

    // Pagination
    paginatable?: boolean;
    currentPage?: number;
    totalPages?: number;
    itemsPerPage?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onItemsPerPageChange?: (size: number) => void;

    frozenColumnCount?: number;
    loading?: boolean;
    emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    keyField,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    onRowClick,
    title,
    searchable = false,
    searchPlaceholder = "Search...",
    onSearch,
    filterable = false,
    filterOptions,
    paginatable = false,
    currentPage = 1,
    totalPages = 1,
    itemsPerPage = 10,
    totalItems = 0,
    onPageChange,
    onItemsPerPageChange,
    loading = false,
    emptyMessage = "No records found",
    sortBy,
    sortOrder,
    onSort,
    defaultSortBy,
    defaultSortOrder,
    frozenColumnCount = 0
}: DataTableProps<T>) {
    const [localSearch, setLocalSearch] = useState('');
    const [internalSortBy, setInternalSortBy] = useState<keyof T | undefined>(sortBy || defaultSortBy);
    const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc'>(sortOrder || defaultSortOrder || 'asc');

    // Use props if provided (controlled), otherwise use internal state (uncontrolled)
    const effectiveSortBy = onSort ? sortBy : internalSortBy;
    const effectiveSortOrder = (onSort ? sortOrder : internalSortOrder) || 'asc';

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        onSearch?.(val);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onSelectionChange) return;
        if (e.target.checked) {
            onSelectionChange(data.map(item => String(item[keyField])));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectRow = (id: string) => {
        if (!onSelectionChange) return;
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(sid => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const isAllSelected = data.length > 0 && data.every(item => selectedIds.includes(String(item[keyField])));

    const handleSort = (key?: keyof T) => {
        if (!key) return;
        const newOrder = effectiveSortBy === key && effectiveSortOrder === 'asc' ? 'desc' : 'asc';

        if (onSort) {
            onSort(key, newOrder);
        } else {
            setInternalSortBy(key);
            setInternalSortOrder(newOrder);
        }
    };

    // Client-side sorting logic applied only if NOT in controlled mode (no onSort provided)
    const sortedData = useMemo(() => {
        if (onSort || !effectiveSortBy) return data;

        return [...data].sort((a, b) => {
            const aValue = a[effectiveSortBy];
            const bValue = b[effectiveSortBy];

            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
                return effectiveSortOrder === 'asc' ? comparison : -comparison;
            }

            if (aValue < bValue) return effectiveSortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return effectiveSortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, effectiveSortBy, effectiveSortOrder, onSort]);

    // Custom checkbox component
    const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: (e: any) => void }) => (
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="peer appearance-none w-5 h-5 rounded border border-gray-300 bg-white checked:bg-green checked:border-green cursor-pointer transition-all"
            />
            <svg
                className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-semi-subtle-grey overflow-hidden mb-5">
            {/* Header */}
            {(title || searchable || filterable) && (
                <div className="py-4 px-5 flex flex-col md:flex-row items-center justify-between border-b border-semi-subtle-grey gap-3">
                    {title && <h3 className="text-base font-bold text-dark-green">{title}</h3>}

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {searchable && (
                            <div className="relative flex-1 md:flex-none md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-grey" size={16} />
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={localSearch}
                                    onChange={handleSearch}
                                    className="w-full pl-9 pr-4 py-2 bg-subtle-grey border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green"
                                />
                            </div>
                        )}

                        {filterable && (
                            <>
                                {filterOptions || (
                                    <button className="flex items-center gap-2 px-3 py-2 bg-subtle-grey text-dark-grey rounded-lg text-sm font-bold hover:bg-semi-subtle-grey transition-colors">
                                        <Filter size={16} />
                                        Filter
                                        <ChevronDown size={14} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse border-spacing-0">
                    <thead>
                        <tr className="bg-subtle-grey/50 border-b border-semi-subtle-grey">
                            {selectable && (
                                <th
                                    className="px-4 py-3 w-14 text-center sticky left-0 z-20 bg-[#F9FAFB]"
                                    style={{ borderBottomWidth: '1px' }}
                                >
                                    <Checkbox
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}

                            {columns.map((col, idx) => {
                                const isFrozen = idx < frozenColumnCount;
                                // Simplified logic: Assuming 1st frozen col sticks to left (or after checkbox)
                                // If multiple are needed, we'd need passed widths.
                                // For now, we support mainly 1st col frozen nicely.
                                // If checkbox exists, left offset is roughly 4rem (64px).
                                const stickyLeft = selectable ? '4rem' : '0';

                                return (
                                    <th
                                        key={idx}
                                        onClick={() => col.sortable && handleSort(col.accessorKey)}
                                        className={clsx(
                                            "px-4 py-3 text-xs font-bold text-light-grey uppercase tracking-wider bg-[#F9FAFB]", // Added bg color for sticky
                                            col.sortable && "cursor-pointer hover:text-dark-green transition-colors",
                                            col.accessorKey && effectiveSortBy === col.accessorKey && "text-dark-green",
                                            col.className,
                                            isFrozen && "sticky z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                                        )}
                                        style={{
                                            left: isFrozen ? (idx === 0 ? stickyLeft : undefined) : undefined, // Only handling 1st frozen col robustly without exact widths
                                        }}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.header}
                                            {col.sortable && (
                                                <div className="flex flex-col -gap-1">
                                                    <ChevronDown
                                                        size={10}
                                                        className={clsx(
                                                            "rotate-180 transition-colors",
                                                            col.accessorKey && effectiveSortBy === col.accessorKey && effectiveSortOrder === 'asc' ? "text-green" : "text-light-grey/30"
                                                        )}
                                                    />
                                                    <ChevronDown
                                                        size={10}
                                                        className={clsx(
                                                            "transition-colors",
                                                            col.accessorKey && effectiveSortBy === col.accessorKey && effectiveSortOrder === 'desc' ? "text-green" : "text-light-grey/30"
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-semi-subtle-grey">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-light-grey">
                                    Loading data...
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-light-grey">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item) => {
                                const id = String(item[keyField]);
                                const isSelected = selectedIds.includes(id);

                                return (
                                    <tr
                                        key={id}
                                        onClick={() => onRowClick?.(item)}
                                        className={clsx(
                                            "hover:bg-subtle-grey/30 transition-colors group",
                                            isSelected && "bg-green/5",
                                            onRowClick && "cursor-pointer"
                                        )}
                                    >
                                        {selectable && (
                                            <td
                                                className={clsx(
                                                    "px-4 py-2.5 text-center sticky left-0 z-10",
                                                    isSelected ? "bg-[#F3FDF9]" : "bg-white group-hover:bg-[#F9FAFB]" // Match row bg or sticky bg
                                                )}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(id)}
                                                />
                                            </td>
                                        )}

                                        {columns.map((col, colIdx) => {
                                            const isFrozen = colIdx < frozenColumnCount;
                                            const stickyLeft = selectable ? '4rem' : '0';

                                            return (
                                                <td
                                                    key={colIdx}
                                                    className={clsx(
                                                        "px-4 py-2.5 text-[13px] text-dark-grey",
                                                        isFrozen && "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                                                        isFrozen ? (isSelected ? "bg-[#F3FDF9]" : "bg-white group-hover:bg-[#F9FAFB]") : ""
                                                    )}
                                                    style={{
                                                        left: isFrozen ? (colIdx === 0 ? stickyLeft : undefined) : undefined,
                                                    }}
                                                >
                                                    {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {paginatable && (
                <div className="py-4 px-5 flex flex-col sm:flex-row items-center justify-between border-t border-semi-subtle-grey bg-subtle-grey/30 gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-light-grey">Show</span>
                        <div className="w-20">
                            <Select
                                value={String(itemsPerPage)}
                                onChange={(val) => onItemsPerPageChange?.(Number(val))}
                                options={[
                                    { value: '5', label: '5' },
                                    { value: '10', label: '10' },
                                    { value: '20', label: '20' },
                                    { value: '50', label: '50' }
                                ]}
                                className="w-full"
                                position="top"
                            />
                        </div>
                        <span className="text-sm text-light-grey">
                            of {totalItems} results
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange?.(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-dark-green hover:bg-light-green transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-1 overflow-auto max-w-[200px] sm:max-w-none no-scrollbar">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange?.(pageNum)}
                                        className={clsx(
                                            "w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors shrink-0",
                                            currentPage === pageNum
                                                ? "bg-green text-white shadow-md shadow-green/20"
                                                : "hover:bg-light-green text-dark-green"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <>
                                    <span className="w-10 h-10 flex items-center justify-center text-light-grey tracking-widest">...</span>
                                    <button
                                        onClick={() => onPageChange?.(totalPages)}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-light-green text-dark-green font-bold transition-colors"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => onPageChange?.(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-dark-green hover:bg-light-green transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
