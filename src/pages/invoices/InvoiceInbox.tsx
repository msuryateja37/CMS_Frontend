import React, { useState, useMemo } from 'react';
import usePagination from '../../hooks/usePagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import {
    FileText,
    Calendar,
    Info,
    CheckCircle,
    Search,
    MoreHorizontal,
    Plus
} from 'lucide-react';
import { Select } from '../../components/common/Select';
import { useInvoices } from '../../hooks/useFinance';

interface SummaryCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    change: string;
    color: 'gold' | 'red' | 'blue' | 'light-gold';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, label, value, change, color }) => {
    const colorClasses = {
        gold: 'text-gold-600 bg-gold-50 border-gold-200',
        red: 'text-red-600 bg-red-50 border-red-200',
        blue: 'text-blue-600 bg-blue-50 border-blue-200',
        'light-gold': 'text-gold-600 bg-gold-50 border-gold-200',
    };

    const bottomBarClasses = {
        gold: 'bg-gold-500',
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        'light-gold': 'bg-gold-500',
    };

    const valueClasses = {
        gold: 'text-gray-800',
        red: 'text-red-500',
        blue: 'text-gray-800',
        'light-gold': 'text-gray-800',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-6 flex-1">
                <div className="flex items-center gap-3 mb-4">
                    <div className={clsx("p-2 rounded-lg", colorClasses[color].split(' ')[1])}>
                        <Icon className={colorClasses[color].split(' ')[0]} size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-500">{label}</span>
                </div>
                <div className="flex flex-col">
                    <span className={clsx("text-3xl font-bold", valueClasses[color])}>{value}</span>
                    <span className="text-xs font-semibold text-gold-500 mt-1">{change} <span className="text-gray-400 font-normal">from last month</span></span>
                </div>
            </div>
            <div className={clsx("h-1.5 w-full", bottomBarClasses[color])}></div>
        </div>
    );
};

const InvoiceInbox: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const STATUS_CHOICES = [
        { value: '', label: 'All statuses' },
        { value: 'Pending Approval', label: 'Pending Approval' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Overdue', label: 'Overdue' },
        { value: 'In Review', label: 'In Review' },
    ];

    // TanStack Query hook
    const { data: rawInvoices, isLoading: loading } = useInvoices();

    const invoices = useMemo(() => {
        if (!rawInvoices || !Array.isArray(rawInvoices)) return [];
        return rawInvoices.map((inv: any) => ({
            id: inv.invoiceNumber || inv.id,
            vendor: inv.vendorName || 'Unknown Vendor',
            desc: inv.description || 'Invoice ' + (inv.invoiceNumber || inv.id),
            amount: `R ${inv.amount || 0}`,
            status: inv.status === 'Pending' || !inv.status ? 'Pending Approval' : inv.status,
            province: inv.province?.name || inv.provinceName || (typeof inv.province === 'string' ? inv.province : '') || 'N/A',
            progress: inv.status === 'Paid' || inv.status === 'COMPLETED' ? 100 : (inv.status === 'Approved' ? 75 : (inv.status === 'Rejected' ? 0 : 25)),
            dueDate: inv.receivedDate ? new Date(inv.receivedDate).toLocaleDateString() : 'N/A'
        }));
    }, [rawInvoices]);

    // Filter logic
    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch = !searchTerm || (
            inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.desc.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = !statusFilter || inv.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const {
        paginatedData,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        setItemsPerPage,
    } = usePagination({
        data: filteredInvoices,
        defaultItemsPerPage: 10,
        resetOnChange: [statusFilter, searchTerm],
    });

    type InvoiceItem = (typeof invoices)[0];
    const columns: Column<InvoiceItem>[] = [
        {
            header: 'Invoice ID',
            accessorKey: 'id',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold flex-shrink-0"></div>
                    <span className="text-[13px] font-medium text-gray-700">{item.id}</span>
                </div>
            )
        },
        {
            header: 'Vendor',
            accessorKey: 'vendor',
            sortable: true,
            cell: (item) => <span className="text-[13px] text-gray-600 font-medium">{item.vendor}</span>
        },
        {
            header: 'Description',
            accessorKey: 'desc',
            sortable: true,
            cell: (item) => <span className="text-[13px] text-gray-500">{item.desc}</span>
        },
        {
            header: 'Amount',
            accessorKey: 'amount',
            sortable: true,
            cell: (item) => <span className="text-[13px] font-bold text-gray-700">{item.amount}</span>
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.status}
                    variant={item.status.toLowerCase()}
                />
            )
        },

        {
            header: 'Progress',
            accessorKey: 'progress',
            sortable: true,
            cell: (item) => (
                <div className="w-32">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brown rounded-full transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-800 mt-1 block text-right">{item.progress}%</span>
                </div>
            )
        },
        {
            header: 'Due Date',
            accessorKey: 'dueDate',
            sortable: true,
            cell: (item) => <span className="text-[13px] font-medium text-gray-600">{item.dueDate}</span>
        },
        {
            header: '',
            cell: () => (
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            ),
            className: "w-10"
        }
    ];

    return (
        <DashboardLayout
            title="Invoice Management"
            description="Invoice Inbox"
            breadcrumbs={[{ label: "Dashboard", path: "/invoices/inbox" }, { label: "Invoice Inbox" }]}
            actionButton={{
                label: "Quick Report",
                onClick: () => console.log("Quick Report clicked"),
                icon: Plus
            }}
        >
            <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard
                        icon={FileText}
                        label="Pending Approval"
                        value={invoices.filter(i => i.status === 'Pending Approval' || i.status === 'RECEIVED').length}
                        change="-"
                        color="gold"
                    />
                    <SummaryCard
                        icon={Calendar}
                        label="Overdue"
                        value={invoices.filter(i => i.status === 'Overdue').length}
                        change="-"
                        color="red"
                    />
                    <SummaryCard
                        icon={Info}
                        label="Total Pending"
                        value={invoices.reduce((acc, curr) => {
                            // Parse amount "R xxx" -> number
                            const val = typeof curr.amount === 'string'
                                ? parseFloat(curr.amount.replace(/[^0-9.-]+/g, ""))
                                : Number(curr.amount);
                            return acc + (curr.status === 'Pending Approval' ? (isNaN(val) ? 0 : val) : 0);
                        }, 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                        change="-"
                        color="blue"
                    />
                    <SummaryCard
                        icon={CheckCircle}
                        label="Paid / Approved"
                        value={invoices.filter(i => i.status === 'Paid' || i.status === 'Approved').length}
                        change="-"
                        color="light-gold"
                    />
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search invoices by ID, vendor, or description ...."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="w-44">
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={STATUS_CHOICES}
                                placeholder="All statuses"
                                bgColor="bg-light-gold"
                            />
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading invoices...</div>
                ) : (
                    <DataTable
                        data={paginatedData}
                        columns={columns}
                        keyField="id"
                        selectable={true}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        searchable={false}
                        filterable={false}
                        paginatable={true}
                        totalItems={filteredInvoices.length}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default InvoiceInbox;
