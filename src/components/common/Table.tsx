import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export interface Column<T> {
    key: keyof T | string; // keyof T for strict typing, string for custom columns
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean; // If true, shows a simple text input filter
    width?: string; // Tailwind width class
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    totalItems?: number;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    pagination?: PaginationProps;
    isLoading?: boolean;
    onSort?: (key: keyof T | string, direction: 'asc' | 'desc') => void;
    selectable?: boolean;
    onSelectionChange?: (selectedItems: T[]) => void;
    className?: string;
}

function Table<T extends { id?: string | number } & Record<string, any>>({
    columns,
    data,
    pagination,
    isLoading = false,
    onSort,
    selectable = false,
    onSelectionChange,
    className
}: TableProps<T>) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    // Internal Sorting Logic (applied if onSort prop is NOT provided, client-side sort)
    // If onSort is provided, we assume server-side or parent-controlled sorting.
    const sortedData = useMemo(() => {
        if (onSort) return data; // Parent handles sorting

        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig, onSort]);

    // Internal Filtering Logic (Client-side)
    const filteredData = useMemo(() => {
        if (Object.keys(filters).length === 0) return sortedData;

        return sortedData.filter(item => {
            return Object.entries(filters).every(([key, filterValue]) => {
                if (!filterValue) return true;
                const itemValue = String(item[key] || '').toLowerCase();
                return itemValue.includes(filterValue.toLowerCase());
            });
        });
    }, [sortedData, filters]);

    // Handlers
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        if (onSort) onSort(key, direction);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(data.map(item => item.id!).filter(id => id !== undefined));
            setSelectedIds(allIds);
            if (onSelectionChange) onSelectionChange(data);
        } else {
            setSelectedIds(new Set());
            if (onSelectionChange) onSelectionChange([]);
        }
    };

    const handleSelectRow = (id: string | number, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) newSelected.add(id);
        else newSelected.delete(id);
        setSelectedIds(newSelected);

        if (onSelectionChange) {
            const selectedItems = data.filter(item => newSelected.has(item.id!));
            onSelectionChange(selectedItems);
        }
    };

    // Calculate currently visible data
    // If pagination is provided, we show a slice of filteredData
    const displayData = useMemo(() => {
        if (!pagination) return filteredData;

        const { currentPage, pageSize = 10 } = pagination;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, pagination]);

    // Calculate totals for footer
    const totalItems = pagination?.totalItems || filteredData.length;
    // Use internal length if client-side filtering is active (onSort missing implies client mode usually)
    const effectiveTotalItems = (!onSort && Object.keys(filters).length > 0) ? filteredData.length : totalItems;
    const effectiveTotalPages = Math.ceil(effectiveTotalItems / (pagination?.pageSize || 10));

    return (
        <div className={clsx("bg-white rounded-xl shadow-sm border border-subtle-grey overflow-hidden flex flex-col", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-dark-grey">
                    <thead className="bg-subtle-grey text-xs uppercase font-bold text-dark-grey border-b border-semi-subtle-grey">
                        <tr>
                            {selectable && (
                                <th className="px-6 py-4 w-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-light-grey text-green focus:ring-green"
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        checked={data.length > 0 && selectedIds.size === data.length}
                                    />
                                </th>
                            )}
                            {columns.map((col, idx) => (
                                <th
                                    key={String(col.key) || idx}
                                    className={clsx("px-6 py-4 group", col.width)}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div
                                            className={clsx("flex items-center gap-1", col.sortable && "cursor-pointer select-none hover:text-dark-green")}
                                            onClick={() => col.sortable && handleSort(String(col.key))}
                                        >
                                            {col.header}
                                            {col.sortable && (
                                                <div className="flex flex-col">
                                                    <ChevronUp size={10} className={clsx("text-light-grey", sortConfig?.key === col.key && sortConfig.direction === 'asc' && "text-dark-green")} />
                                                    <ChevronDown size={10} className={clsx("-mt-1 text-light-grey", sortConfig?.key === col.key && sortConfig.direction === 'desc' && "text-dark-green")} />
                                                </div>
                                            )}
                                        </div>

                                        {col.filterable && (
                                            <div className="relative mt-1">
                                                <input
                                                    type="text"
                                                    placeholder="Filter..."
                                                    className="w-full px-2 py-1 text-xs border border-semi-subtle-grey rounded bg-white focus:outline-none focus:border-green font-normal normal-case"
                                                    onChange={(e) => handleFilterChange(String(col.key), e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle-grey">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {selectable && <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>}
                                    {columns.map((_, c) => (
                                        <td key={c} className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : displayData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-light-grey">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            displayData.map((item, rowIdx) => (
                                <tr key={item.id || rowIdx} className="hover:bg-subtle-green/30 transition-colors">
                                    {selectable && (
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-light-grey text-green focus:ring-green"
                                                checked={selectedIds.has(item.id!)}
                                                onChange={(e) => handleSelectRow(item.id!, e.target.checked)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col, colIdx) => (
                                        <td key={String(col.key) || colIdx} className="px-6 py-4">
                                            {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="p-4 border-t border-subtle-grey flex items-center justify-between bg-white text-sm text-dark-grey">
                    <div>
                        Showing <span className="font-bold">{effectiveTotalItems > 0 ? Math.min(effectiveTotalItems, (pagination.currentPage - 1) * (pagination.pageSize || 10) + 1) : 0}</span> to <span className="font-bold">{Math.min(pagination.currentPage * (pagination.pageSize || 10), effectiveTotalItems)}</span> of <span className="font-bold">{effectiveTotalItems}</span> results
                    </div>
                    <div className="flex gap-1 items-center">
                        <button
                            className="p-1 rounded hover:bg-subtle-grey disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pagination.currentPage === 1}
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {Array.from({ length: Math.min(5, effectiveTotalPages) }, (_, i) => {
                            let pageNum = i + 1;
                            if (effectiveTotalPages > 5 && pagination.currentPage > 3) {
                                pageNum = pagination.currentPage - 2 + i;
                            }
                            if (pageNum > effectiveTotalPages || pageNum < 1) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => pagination.onPageChange(pageNum)}
                                    className={clsx(
                                        "w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors",
                                        pagination.currentPage === pageNum
                                            ? "bg-dark-green text-white"
                                            : "hover:bg-subtle-grey text-dark-grey"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            className="p-1 rounded hover:bg-subtle-grey disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pagination.currentPage >= effectiveTotalPages}
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Table;
