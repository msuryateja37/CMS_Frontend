import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';
import { DataTable, type Column } from '../../components/common/DataTable';
import supervisorService from '../../services/supervisorService';
import type { Case } from '../../services/cases.service';
import {
    CheckCircle2,
    ArrowUpRight,
    FileSearch,
    FilePlus,
    Loader2
} from 'lucide-react';
import { STATUS_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS, getStatusLabel } from '../../data/constants';



const OHSCasesReview: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [cases, setCases] = useState<Case[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch cases from API
    useEffect(() => {
        const fetchCases = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching cases for OHS Practitioner...');
                const { data, total } = await supervisorService.getCasesForReview({
                    take: itemsPerPage,
                    skip: (currentPage - 1) * itemsPerPage,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    categoryId: categoryFilter || undefined,
                    priorityLevel: priorityFilter || undefined
                });
                console.log('Cases received:', data);
                setCases(data);
                setTotalItems(total);
            } catch (err) {
                console.error('Error fetching cases:', err);
                setError('Failed to load cases. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, [currentPage, itemsPerPage, statusFilter, categoryFilter, priorityFilter]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, categoryFilter, priorityFilter]);

    const columns: Column<Case>[] = [
        {
            header: 'Case ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green flex-shrink-0"></div>
                    <span className="font-medium text-gray-500">{item.incidentNumber}</span>
                </div>
            )
        },
        {
            header: 'Type',
            accessorKey: 'type',
            sortable: true,
            cell: (item) => <span className="text-gray-600">{item.type}</span>
        },
        {
            header: 'Priority',
            accessorKey: 'severity',
            sortable: true,
            cell: (item) => {
                const priority = item.severity || 'medium';
                return <Pill label={priority.charAt(0).toUpperCase() + priority.slice(1)} variant={priority.toLowerCase()} />;
            }
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-gray-600">{item.category || 'N/A'}</span>
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => {
                const statusLabel = getStatusLabel(item.status);
                return <Pill label={statusLabel} variant={item.status.toLowerCase().replace(/_/g, ' ')} />;
            }
        },
        {
            header: 'Submitted',
            accessorKey: 'createdAt',
            sortable: true,
            cell: (item) => <span className="text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</span>
        },
        {
            header: 'Actions',
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => supervisorService.resolveCase(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-light-green text-dark-green text-xs font-bold rounded-lg hover:bg-green/10 transition-colors whitespace-nowrap"
                    >
                        <CheckCircle2 size={14} />
                        Resolve
                    </button>
                    <button
                        onClick={() => supervisorService.escalateCase(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 whitespace-nowrap"
                    >
                        <ArrowUpRight size={14} />
                        Escalate
                    </button>
                </div>
            )
        }
    ];

    const filteredCases = cases.filter(c => {
        const matchesSearch = (
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const isNotClosed = c.status !== 'CLOSED';
        return matchesSearch && isNotClosed;
    });

    return (
        <DashboardLayout
            title="OHS Cases for Review"
            description="Cases Review"
            breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Cases Review" }]}
            userProfile={{ name: 'OHS Practitioner', role: 'OHS Practitioner' }}
        >
            <div className="flex flex-col gap-6">
                {/* Top Actions */}
                <div className="flex justify-end gap-3 -mt-4 mb-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green text-white font-bold rounded-lg hover:bg-[#2aa88f] transition-colors shadow-sm">
                        <FileSearch size={18} />
                        Review Cases
                    </button>
                    <button
                        onClick={() => navigate('/ohs/submit-case')}
                        className="flex items-center gap-2 px-4 py-2 bg-green text-white font-bold rounded-lg hover:bg-[#2aa88f] transition-colors shadow-sm">
                        <FilePlus size={18} />
                        Submit New Case
                    </button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-green animate-spin" />
                        <span className="ml-3 text-gray-600">Loading cases...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <DataTable
                        data={filteredCases}
                        columns={columns}
                        keyField="id"
                        emptyMessage={(searchTerm || statusFilter !== 'all' || categoryFilter || priorityFilter)
                            ? "No cases found matching your criteria."
                            : "No cases for review."}
                        selectable={true}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        searchable={true}
                        onSearch={setSearchTerm}
                        searchPlaceholder="Search Cases..."
                        filterable={true}
                        totalItems={totalItems}
                        paginatable={true}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                        totalPages={Math.ceil(totalItems / itemsPerPage)}
                        filterOptions={
                            <div className="flex gap-2">
                                <Select
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={STATUS_FILTER_OPTIONS.filter(o => o.value !== 'CLOSED')}
                                    placeholder="Status"
                                />
                                <Select
                                    value={categoryFilter}
                                    onChange={setCategoryFilter}
                                    options={CATEGORY_FILTER_OPTIONS}
                                    placeholder="Category"
                                />
                                <Select
                                    value={priorityFilter}
                                    onChange={setPriorityFilter}
                                    options={PRIORITY_FILTER_OPTIONS}
                                    placeholder="Priority"
                                />
                            </div>
                        }
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default OHSCasesReview;
