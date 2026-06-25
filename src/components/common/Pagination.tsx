import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { Select } from './Select';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number | string;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (size: number) => void;
    /** Page-size options shown in the "Show X" dropdown. Defaults to [5, 10, 20, 50]. */
    pageSizeOptions?: Array<{ value: string; label: string }>;
    /** Optional class applied to the root wrapper div. */
    className?: string;
    /** When true the "Show X of Y" left side is hidden. */
    hidePageSizeSelector?: boolean;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
];

/**
 * Reusable, standalone pagination bar.
 *
 * Renders a "Show X of Y results" section on the left and
 * Prev / page-number buttons / Next on the right.
 *
 * @example
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   totalItems={filteredItems.length}
 *   itemsPerPage={itemsPerPage}
 *   onPageChange={setCurrentPage}
 *   onItemsPerPageChange={setItemsPerPage}
 * />
 */
const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    className,
    hidePageSizeSelector = false,
}) => {
    /**
     * Build the list of page numbers to display.
     * We show at most 5 consecutive pages, centred around the current page.
     */
    const visiblePages = React.useMemo(() => {
        const pages: number[] = [];
        const windowSize = Math.min(5, totalPages);

        let start: number;
        if (totalPages <= 5) {
            start = 1;
        } else if (currentPage <= 3) {
            start = 1;
        } else if (currentPage >= totalPages - 2) {
            start = totalPages - 4;
        } else {
            start = currentPage - 2;
        }

        for (let i = 0; i < windowSize; i++) {
            pages.push(start + i);
        }
        return pages;
    }, [currentPage, totalPages]);

    const showEllipsis = totalPages > 5 && currentPage < totalPages - 2;

    return (
        <div
            className={clsx(
                'flex flex-col sm:flex-row items-center justify-between gap-4',
                className
            )}
        >
            {/* Left — page-size selector */}
            {!hidePageSizeSelector && (
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <span>Show</span>
                    <div className="w-20">
                        <Select
                            value={String(itemsPerPage)}
                            onChange={(val) => onItemsPerPageChange?.(Number(val))}
                            options={pageSizeOptions}
                            className="w-full"
                            bgColor="bg-light-gold"
                        />
                    </div>
                    <span>of {totalItems} results</span>
                </div>
            )}

            {/* Right — prev / pages / next */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-brown hover:bg-light-gold transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1 overflow-auto max-w-[200px] sm:max-w-none no-scrollbar">
                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={clsx(
                                'w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors shrink-0',
                                currentPage === page
                                    ? 'bg-gold text-white shadow-md shadow-gold/20'
                                    : 'hover:bg-light-gold text-brown'
                            )}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    ))}

                    {showEllipsis && (
                        <>
                            <span className="w-10 h-10 flex items-center justify-center text-light-grey tracking-widest">
                                ...
                            </span>
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-light-gold text-brown font-bold transition-colors"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-brown hover:bg-light-gold transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-label="Next page"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
