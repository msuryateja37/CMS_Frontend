import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { type EmployeeCase } from '../../services/employeeService';
import { useMyCases } from '../../hooks/useEmployee';
import { Select } from '../../components/common/Select';
import {
    Search,
    ChevronDown,
    Eye,
    AlertCircle
} from 'lucide-react';
import { STATUS_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, PRIORITY_FILTER_OPTIONS, getStatusLabel } from '../../data/constants';
import { formatCategory } from '../../utils/formatters';


const MyCases: React.FC = () => {
    const navigate = useNavigate();
    // Filters and Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Use custom hook for fetching cases
    const { data: casesData, isLoading, error: queryError } = useMyCases({
        take: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        categoryId: categoryFilter || undefined,
        severity: priorityFilter || undefined
    });

    const cases = casesData?.data || [];
    const totalItems = casesData?.total || 0;
    const error = queryError ? (queryError as any).message : null;

    // Filter cases based on search term (local filtering for name/code)
    const filteredCases = cases.filter((c: EmployeeCase) =>
        c.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Columns Definition
    const columns: Column<EmployeeCase>[] = [
        {
            header: 'Case ID',
            accessorKey: 'incidentNumber',
            sortable: true,
            cell: (item) => (
                <span className="font-mono text-sm font-medium text-gray-600 whitespace-nowrap">{item.incidentNumber}</span>
            )
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-gray-700 font-medium text-xs whitespace-nowrap">{formatCategory(item.category || item.type || 'Incident')}</span>
        },
        {
            header: 'Priority',
            cell: (item) => {
                const sev = item.severity || 'medium';
                return <Pill label={sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase()} variant={sev.toLowerCase()} />;
            }
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => {
                const statusLabel = getStatusLabel(item.status);
                return <Pill label={statusLabel.toUpperCase()} variant={item.status.toLowerCase().replace(/_/g, ' ')} />;
            }
        },
        {
            header: '',
            cell: (item) => (
                <button
                    onClick={() => navigate(`/employee/my-cases/${item.id}`)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#E8F5E9] text-brown text-xs font-bold rounded-lg hover:bg-gold hover:text-white transition-colors border border-gold/20"
                >
                    <Eye size={14} />
                    View
                    <ChevronDown size={14} className="-rotate-90" />
                </button>
            )
        }
    ];

    if (error && !cases.length) {
        return (
            <DashboardLayout
                title="Welcome back, Thabo"
                description="My Cases"
                breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "My Cases" }]}
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium mb-2">Failed to load cases</p>
                        <p className="text-gray-500 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-[#A1743E] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Welcome back, Thabo"
            description="My Cases"
            breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "My Cases" }]}
        >
            <div className="flex flex-col gap-6">

                {/* Header section inside main content */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-black mb-1">My Cases</h2>
                        <p className="text-gray-500 text-sm">View and track your submitted cases</p>
                    </div>
                </div>

                {/* Custom Filter Bar */}
                <div className="bg-white p-2 rounded-xl flex flex-col lg:flex-row items-center gap-3 border border-gray-100 shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search  by Cases Number ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-lg focus:outline-none text-sm placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto px-2">
                        <div className="w-32">
                            <Select
                                placeholder="Status"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                bgColor="bg-gray-50"
                                options={STATUS_FILTER_OPTIONS}
                            />
                        </div>
                        <div className="w-32">
                            <Select
                                placeholder="Category"
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                bgColor="bg-gray-50"
                                options={CATEGORY_FILTER_OPTIONS}
                            />
                        </div>
                        <div className="w-32">
                            <Select
                                placeholder="Priority"
                                value={priorityFilter}
                                onChange={setPriorityFilter}
                                bgColor="bg-gray-50"
                                options={PRIORITY_FILTER_OPTIONS}
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    data={filteredCases}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    paginatable={true}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                    }}
                    totalItems={totalItems}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    loading={isLoading}
                    emptyMessage={(searchTerm || statusFilter !== 'all' || categoryFilter || priorityFilter)
                        ? "No cases found matching your criteria."
                        : "No cases found. Submit your first case to get started."}
                />
            </div>
        </DashboardLayout>
    );
};

export default MyCases;
