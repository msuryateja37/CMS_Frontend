import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '../common/DataTable';
import { Pill } from '../common/Pill';
import { Select } from '../common/Select';
import { Eye, Plus, FileText, Calendar, CheckCircle, Info } from 'lucide-react';
import { MOCK_INVOICES, INVOICE_STATUS_OPTIONS, type InvoiceRecord } from '../../data/invoiceMockData';
import clsx from 'clsx';

interface InvoiceListProps {
    role: 'supervisor' | 'admin';
}

interface SummaryCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: 'green' | 'red' | 'blue' | 'amber';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, label, value, color }) => {
    const styles = {
        green: { icon: 'text-green bg-green/10', bar: 'bg-green', value: 'text-gray-800' },
        red: { icon: 'text-red bg-red/10', bar: 'bg-red', value: 'text-red' },
        blue: { icon: 'text-blue-600 bg-blue-50', bar: 'bg-blue-500', value: 'text-gray-800' },
        amber: { icon: 'text-yellow bg-yellow/10', bar: 'bg-yellow', value: 'text-gray-800' },
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-5 flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <div className={clsx('p-2 rounded-lg', styles[color].icon)}>
                        <Icon size={18} />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                </div>
                <span className={clsx('text-2xl font-bold', styles[color].value)}>{value}</span>
            </div>
            <div className={clsx('h-1.5 w-full', styles[color].bar)} />
        </div>
    );
};

const InvoiceList: React.FC<InvoiceListProps> = ({ role }) => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredInvoices = MOCK_INVOICES.filter(inv => {
        const matchesSearch = !searchTerm || (
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.landlordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = !statusFilter || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const paginatedData = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const basePath = role === 'supervisor' ? '/supervisor/invoices' : '/admin/invoice-management';

    const columns: Column<InvoiceRecord>[] = [
        {
            header: 'Invoice No.',
            accessorKey: 'invoiceNumber',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-light-green flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-dark-green" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.invoiceNumber}</span>
                </div>
            ),
        },
        {
            header: 'Landlord',
            accessorKey: 'landlordName',
            sortable: true,
            cell: (item) => (
                <div>
                    <span className="text-sm font-medium text-gray-700 block">{item.landlordName}</span>
                    <span className="text-xs text-gray-400">{item.propertyName}</span>
                </div>
            ),
        },
        {
            header: 'Amount',
            accessorKey: 'totalAmount',
            sortable: true,
            cell: (item) => (
                <span className="text-sm font-bold text-gray-800">
                    R {item.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            header: 'Billing Month',
            accessorKey: 'billingMonth',
            sortable: true,
            cell: (item) => <span className="text-sm text-gray-600">{item.billingMonth}</span>,
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => <Pill label={item.status} variant={item.status.toLowerCase()} />,
        },
        {
            header: 'Submitted',
            accessorKey: 'submittedDate',
            sortable: true,
            cell: (item) => (
                <span className="text-sm text-gray-500">
                    {new Date(item.submittedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            ),
        },
        {
            header: 'Actions',
            cell: (item) => (
                <button
                    onClick={() => navigate(`${basePath}/${item.id}`)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-light-green text-dark-green text-xs font-bold rounded-lg hover:bg-green/10 transition-colors whitespace-nowrap"
                >
                    <Eye size={14} />
                    View
                </button>
            ),
        },
    ];

    const pendingCount = MOCK_INVOICES.filter(i => i.status === 'Pending Approval').length;
    const inReviewCount = MOCK_INVOICES.filter(i => i.status === 'In Review').length;
    const approvedCount = MOCK_INVOICES.filter(i => i.status === 'Approved' || i.status === 'Paid').length;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <SummaryCard icon={FileText} label="Total Invoices" value={MOCK_INVOICES.length} color="green" />
                <SummaryCard icon={Calendar} label="Pending Approval" value={pendingCount} color="amber" />
                <SummaryCard icon={Info} label="In Review" value={inReviewCount} color="blue" />
                <SummaryCard icon={CheckCircle} label="Approved / Paid" value={approvedCount} color="green" />
            </div>

            {/* New Invoice Button (Supervisor only) */}
            {role === 'supervisor' && (
                <div className="flex justify-end">
                    <button
                        onClick={() => navigate('/supervisor/invoices/new')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-dark-green text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-sm text-sm"
                    >
                        <Plus size={18} />
                        New Invoice
                    </button>
                </div>
            )}

            {/* Search + Filter */}
            <DataTable
                data={paginatedData}
                columns={columns}
                keyField="id"
                selectable={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchable={true}
                onSearch={setSearchTerm}
                searchPlaceholder="Search by invoice number, landlord, or property..."
                filterable={true}
                filterOptions={
                    <div className="flex gap-2">
                        <Select
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            options={INVOICE_STATUS_OPTIONS}
                            placeholder="All Statuses"
                            bgColor="bg-light-green"
                        />
                    </div>
                }
                paginatable={true}
                totalItems={filteredInvoices.length}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                emptyMessage="No invoices found matching your criteria."
            />
        </div>
    );
};

export default InvoiceList;
