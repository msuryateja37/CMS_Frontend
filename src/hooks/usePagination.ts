import { useState, useMemo, useEffect } from 'react';

export interface UsePaginationOptions<T> {
    data: T[];
    /** Items to show per page. Defaults to 10. */
    defaultItemsPerPage?: number;
    /** Any values that, when they change, should reset the current page back to 1
     *  (e.g. search terms, active filter values). Pass as an array like [search, status]. */
    resetOnChange?: unknown[];
}

export interface UsePaginationResult<T> {
    /** The slice of `data` that belongs to the current page. */
    paginatedData: T[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    setItemsPerPage: (size: number) => void;
}

/**
 * Reusable pagination hook.
 *
 * @example
 * const { paginatedData, currentPage, setCurrentPage, totalPages, itemsPerPage, setItemsPerPage } =
 *   usePagination({ data: filteredItems, defaultItemsPerPage: 10, resetOnChange: [search, statusFilter] });
 */
function usePagination<T>({
    data,
    defaultItemsPerPage = 10,
    resetOnChange = [],
}: UsePaginationOptions<T>): UsePaginationResult<T> {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

    // Reset to page 1 whenever any of the tracked values change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setCurrentPage(1);
    }, resetOnChange);

    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    const handleSetItemsPerPage = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1); // Always reset to p.1 when page-size changes
    };

    return {
        paginatedData,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        setItemsPerPage: handleSetItemsPerPage,
    };
}

export default usePagination;
