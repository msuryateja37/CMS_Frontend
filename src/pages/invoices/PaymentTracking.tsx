import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import clsx from 'clsx';
import { Pill } from '../../components/common/Pill';
import {
    Clock,
    AlertCircle,
    Wallet,
    CheckCircle2,
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronRight as ArrowRight
} from 'lucide-react';

import { Select } from '../../components/common/Select';

interface SummaryCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: 'green' | 'red' | 'blue' | 'teal';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, label, value, color }) => {
    const colorClasses = {
        green: 'text-green-600 bg-green-50 border-green-200',
        red: 'text-red-600 bg-red-50 border-red-200',
        blue: 'text-blue-600 bg-blue-50 border-blue-200',
        teal: 'text-teal-600 bg-teal-50 border-teal-200',
    };

    const bottomBarClasses = {
        green: 'bg-green-500',
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        teal: 'bg-teal-500',
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
                    <span className={clsx("text-4xl font-bold tracking-tight text-gray-800")}>{value}</span>
                </div>
            </div>
            <div className={clsx("h-1.5 w-full", bottomBarClasses[color])}></div>
        </div>
    );
};


interface TrackingStep {
    label: string;
    status: 'completed' | 'current' | 'pending';
}

const ProgressBar: React.FC<{ steps: TrackingStep[], percentage: number, title: string }> = ({ steps, percentage, title }) => {
    return (
        <div className="flex-1 px-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-800">{title}</h4>
                <span className="text-sm font-bold text-gray-800">{percentage}%</span>
            </div>
            <div className="relative pt-4 pb-8">
                {/* Track */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-100 rounded-full"></div>
                {/* Progress */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-dark-green rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                ></div>

                {/* Steps */}
                <div className="relative flex justify-between items-center">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center relative group">
                            <div className={clsx(
                                "w-4 h-4 rounded-full border-2 z-10 transition-colors duration-300",
                                step.status === 'completed' ? "bg-dark-green border-dark-green" :
                                    step.status === 'current' ? "bg-orange-400 border-white shadow-[0_0_0_2px_#fb923c]" :
                                        "bg-gray-200 border-gray-200"
                            )}></div>
                            <span className={clsx(
                                "absolute -bottom-6 text-[10px] font-bold whitespace-nowrap transition-colors",
                                step.status === 'completed' || step.status === 'current' ? "text-gray-800" : "text-gray-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TrackingItem: React.FC<{
    vendor: string;
    invoiceId: string;
    status: 'In Progress' | 'Paid';
    amount: string;
    dueDate: string;
    percentage: number;
    title: string;
    steps: TrackingStep[];
}> = ({ vendor, invoiceId, status, amount, dueDate, percentage, title, steps }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-6 hover:shadow-md transition-all group">
            {/* Info Section */}
            <div className="w-1/4 space-y-2">
                <div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{vendor}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-gray-800">{invoiceId}</span>
                        <Pill
                            label={status}
                            variant={status.toLowerCase()}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{amount}</span>
                    <span className="text-[11px] font-medium text-gray-400 tracking-tight">Due: {dueDate}</span>
                </div>
            </div>

            {/* Progress Section */}
            <ProgressBar steps={steps} percentage={percentage} title={title} />

            {/* Action Section */}
            <button className="p-2 text-gray-300 group-hover:text-gray-600 transition-colors">
                <ArrowRight size={20} />
            </button>
        </div>
    );
};

const PaymentTracking: React.FC = () => {
    const [rowsPerPage, setRowsPerPage] = useState('10');
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const STATUS_CHOICES = [
        { value: '', label: 'All Statuses' },
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Verified', label: 'Verified' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Payment', label: 'Payment' },
        { value: 'Paid', label: 'Paid' },
    ];

    const trackingItems = [
        {
            vendor: 'City of Johannesburg',
            invoiceId: 'INV-2024-1240',
            status: 'In Progress' as const,
            amount: 'R45 300,00',
            dueDate: '2024-02-15',
            percentage: 60,
            title: 'Payment Processing',
            steps: [
                { label: 'Submitted', status: 'completed' },
                { label: 'Verified', status: 'completed' },
                { label: 'Approved', status: 'completed' },
                { label: 'Payment', status: 'current' },
                { label: 'Paid', status: 'pending' },
            ] as TrackingStep[]
        },
        {
            vendor: 'Vodacom',
            invoiceId: 'INV-2024-1246',
            status: 'In Progress' as const,
            amount: 'R12 800,00',
            dueDate: '2024-02-25',
            percentage: 40,
            title: 'Approval',
            steps: [
                { label: 'Submitted', status: 'completed' },
                { label: 'Verified', status: 'completed' },
                { label: 'Approved', status: 'current' },
                { label: 'Payment', status: 'pending' },
                { label: 'Paid', status: 'pending' },
            ] as TrackingStep[]
        },
        {
            vendor: 'Rand Water',
            invoiceId: 'INV-2024-1289',
            status: 'Paid' as const,
            amount: 'R32 202,00',
            dueDate: '2024-03-03',
            percentage: 100,
            title: 'Completed',
            steps: [
                { label: 'Submitted', status: 'completed' },
                { label: 'Verified', status: 'completed' },
                { label: 'Approved', status: 'completed' },
                { label: 'Payment', status: 'completed' },
                { label: 'Paid', status: 'completed' },
            ] as TrackingStep[]
        },
        {
            vendor: 'City of Johannesburg',
            invoiceId: 'INV-2024-1240',
            status: 'In Progress' as const,
            amount: 'R45 300,00',
            dueDate: '2024-02-15',
            percentage: 60,
            title: 'Payment Processing',
            steps: [
                { label: 'Submitted', status: 'completed' },
                { label: 'Verified', status: 'completed' },
                { label: 'Approved', status: 'completed' },
                { label: 'Payment', status: 'current' },
                { label: 'Paid', status: 'pending' },
            ] as TrackingStep[]
        },
        {
            vendor: 'Vodacom',
            invoiceId: 'INV-2024-1246',
            status: 'In Progress' as const,
            amount: 'R12 800,00',
            dueDate: '2024-02-25',
            percentage: 40,
            title: 'Approval',
            steps: [
                { label: 'Submitted', status: 'completed' },
                { label: 'Verified', status: 'completed' },
                { label: 'Approved', status: 'current' },
                { label: 'Payment', status: 'pending' },
                { label: 'Paid', status: 'pending' },
            ] as TrackingStep[]
        },
        {
            vendor: 'Rand Water',
            invoiceId: 'INV-2024-1289',
            status: 'Paid' as const,
            amount: 'R32 202,00',
            dueDate: '2024-03-03',
            percentage: 100,
            title: 'Completed',
            steps: [
                { label: 'Submitted', status: 'completed' },
                { label: 'Verified', status: 'completed' },
                { label: 'Approved', status: 'completed' },
                { label: 'Payment', status: 'completed' },
                { label: 'Paid', status: 'completed' },
            ] as TrackingStep[]
        },
    ];

    // Filter logic
    const filteredItems = trackingItems.filter(item => {
        const matchesSearch = !searchTerm || (
            item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Find if the item is in one of the stages
        const matchesStatus = !statusFilter || item.steps.some(step => step.label === statusFilter && (step.status === 'completed' || step.status === 'current'));

        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const itemsPerPage = Number(rowsPerPage);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Search/Status tracking logic
    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm]);

    return (
        <DashboardLayout
            title="Pending Tracking"
            description="Payment Tracking"
            breadcrumbs={[{ label: "Invoice Inbox", path: "/invoices/inbox" }, { label: "Payment Tracking" }]}
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
                        icon={Clock}
                        label="In Progress"
                        value="12"
                        color="green"
                    />
                    <SummaryCard
                        icon={AlertCircle}
                        label="Overdue"
                        value="2"
                        color="red"
                    />
                    <SummaryCard
                        icon={Wallet}
                        label="Total Pending"
                        value="R 65k"
                        color="blue"
                    />
                    <SummaryCard
                        icon={CheckCircle2}
                        label="Paid This Month"
                        value="45"
                        color="teal"
                    />
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by invoice or vendor ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex gap-3 w-44">
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={STATUS_CHOICES}
                            placeholder="All Status"
                            bgColor="bg-light-green"
                        />
                    </div>
                </div>

                {/* Tracking List */}
                <div className="space-y-4">
                    {paginatedItems.length > 0 ? (
                        paginatedItems.map((item, idx) => (
                            <TrackingItem key={idx} {...item} />
                        ))
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 font-medium">
                            No tracking items found matching your filters.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500 font-medium">Show</span>
                        <div className="w-20">
                            <Select
                                value={rowsPerPage}
                                onChange={(val) => {
                                    setRowsPerPage(val);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { value: '5', label: '5' },
                                    { value: '10', label: '10' },
                                    { value: '20', label: '20' },
                                    { value: '50', label: '50' }
                                ]}
                                className="w-full"
                                bgColor="bg-light-green"
                            />
                        </div>
                        <span className="text-gray-500 font-medium">
                            showing {paginatedItems.length} of {filteredItems.length} results
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-30"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={clsx(
                                        "w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all",
                                        currentPage === page
                                            ? "bg-green text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-30"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PaymentTracking;
