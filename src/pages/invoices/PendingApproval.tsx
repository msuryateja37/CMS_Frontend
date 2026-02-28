import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import {
    FileText,
    AlertCircle,
    Wallet,
    Clock,
    Plus,
    Eye,
    Check,
    X
} from 'lucide-react';

interface SummaryCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: 'green' | 'red' | 'blue' | 'orange';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, label, value, color }) => {
    const colorClasses = {
        green: 'text-green-600 bg-green-50 border-green-200',
        red: 'text-red-600 bg-red-50 border-red-200',
        blue: 'text-blue-600 bg-blue-50 border-blue-200',
        orange: 'text-orange-600 bg-orange-50 border-orange-200',
    };

    const bottomBarClasses = {
        green: 'bg-green-500',
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
    };

    const valueClasses = {
        green: 'text-green-600',
        red: 'text-red-600',
        blue: 'text-blue-600',
        orange: 'text-orange-500',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} />
            </div>

            <div className="p-6 flex-1 z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={clsx("p-2 rounded-lg", colorClasses[color].split(' ')[1])}>
                        <Icon className={colorClasses[color].split(' ')[0]} size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-500">{label}</span>
                </div>
                <div className="flex flex-col">
                    <span className={clsx("text-4xl font-bold tracking-tight", valueClasses[color])}>{value}</span>
                </div>
            </div>
            <div className={clsx("h-1.5 w-full", bottomBarClasses[color])}></div>
        </div>
    );
};



const PendingApproval: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>(['3']);

    const items = [
        { id: '1', invoiceId: 'INV-2025-0001', vendor: 'Eskom Holdings SOC Ltd', amount: 'R35 700,00', stage: 'Supervisor Review', assignee: 'Thabo', days: '5 Days', priority: 'Medium' },
        { id: '2', invoiceId: 'INV-2025-0002', vendor: 'City of Tshwane Metropolitan', amount: 'R22 150,00', stage: 'Financial Verification', assignee: 'Nerlson', days: '16 Days', priority: 'High' },
        { id: '3', invoiceId: 'INV-2025-0003', vendor: 'Rand water', amount: 'R35 150,00', stage: 'Director Approval', assignee: 'Mbali', days: '4 Days', priority: 'Low' },
        { id: '4', invoiceId: 'INV-2025-0004', vendor: 'City of Cape Town', amount: 'R35 150,00', stage: 'Compliance Check', assignee: 'Ndlovu', days: '10 Days', priority: 'Medium' },
        { id: '5', invoiceId: 'INV-2025-0005', vendor: 'City of Tshwane Metropolitan', amount: 'R35 150,00', stage: 'Budget Allocation', assignee: 'Sibusiso', days: '11 Days', priority: 'Medium' },
    ];

    const columns: Column<typeof items[0]>[] = [
        {
            header: 'Invoice ID',
            accessorKey: 'invoiceId',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-400 flex-shrink-0"></div>
                    <span className="text-[13px] font-medium text-gray-700">{item.invoiceId}</span>
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
            header: 'Amount',
            accessorKey: 'amount',
            sortable: true,
            cell: (item) => <span className="text-[13px] font-bold text-gray-700">{item.amount}</span>
        },
        {
            header: 'Stage',
            accessorKey: 'stage',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.stage}
                    variant={item.stage.toLowerCase()}
                />
            )
        },

        {
            header: 'Assignee',
            accessorKey: 'assignee',
            sortable: true,
            cell: (item) => <span className="px-3 py-1 bg-gray-100 rounded-full text-[12px] font-medium text-gray-600">{item.assignee}</span>
        },
        {
            header: 'Days Waiting',
            accessorKey: 'days',
            sortable: true,
            cell: (item) => <span className="text-[13px] font-medium text-gray-600">{item.days}</span>
        },
        {
            header: 'Priority',
            accessorKey: 'priority',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.priority}
                    variant={item.priority.toLowerCase()}
                />
            )
        },

        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center justify-center gap-2">
                    <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm">
                        <Eye size={16} />
                    </button>
                    <button className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                        <Check size={16} />
                    </button>
                    <button className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors shadow-sm">
                        <X size={16} />
                    </button>
                </div>
            ),
            className: "text-center"
        }
    ];

    const filteredItems = items.filter(item =>
        item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Pending Approval"
            description="Pending Approval"
            breadcrumbs={[{ label: "Invoice Inbox", path: "/invoices/inbox" }, { label: "Pending Approval" }]}
            actionButton={{
                label: "Quick Report",
                onClick: () => console.log("Quick Report clicked"),
                icon: Plus
            }}
        >
            <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard icon={FileText} label="Pending" value="3" color="green" />
                    <SummaryCard icon={AlertCircle} label="High Priority" value="2" color="red" />
                    <SummaryCard icon={Wallet} label="Total Value" value="R 35k" color="blue" />
                    <SummaryCard icon={Clock} label="Avg Days Waiting" value="7.8" color="orange" />
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <input
                            type="text"
                            placeholder="Search Invoices ..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    title="Recent Incidents"
                    data={filteredItems}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    paginatable={true}
                    totalItems={filteredItems.length}
                />
            </div>
        </DashboardLayout>
    );
};

export default PendingApproval;
