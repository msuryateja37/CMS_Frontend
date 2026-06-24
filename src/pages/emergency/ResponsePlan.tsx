import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Search,
    Plus,
    Eye,
} from 'lucide-react';
import { Select } from '../../components/common/Select';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { formatCategory } from '../../utils/formatters';

interface ResponsePlanData {
    id: string;
    erpId: string;
    title: string;
    type: string;
    version: string;
    status: string;
    nextReview: string;
    selected: boolean;
}

// --- MOCK DATA ---
const RESPONSE_PLANS: ResponsePlanData[] = [
    {
        id: '1',
        erpId: 'ERP-001',
        title: 'Fire Emergency Response Plan',
        type: 'Fire',
        version: 'v3.2',
        status: 'Active',
        nextReview: '20 May 2035',
        selected: false
    },
    {
        id: '2',
        erpId: 'ERP-002',
        title: 'Medical Emergency Procedure',
        type: 'Medical',
        version: 'v2.1',
        status: 'Active',
        nextReview: '31 May 2035',
        selected: false
    },
    {
        id: '3',
        erpId: 'ERP-003',
        title: 'Natural Disaster Response',
        type: 'Natural Disaster',
        version: 'v1.5',
        status: 'Under Review',
        nextReview: '05 Jun 2035',
        selected: true
    },
    {
        id: '4',
        erpId: 'ERP-004',
        title: 'Security Breach Protocol',
        type: 'Security',
        version: 'v2.0',
        status: 'Active',
        nextReview: '16 Jun 2035',
        selected: false
    }
];

const ResponsePlan: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [activeTab, setActiveTab] = useState('Response Plans');
    const [selectedIds, setSelectedIds] = useState<string[]>(['3']);

    const STATUS_OPTIONS = [
        { value: '', label: 'All Statuses' },
        { value: 'Active', label: 'Active' },
        { value: 'Under Review', label: 'Under Review' },
        { value: 'Draft', label: 'Draft' },
    ];

    const TYPE_OPTIONS = [
        { value: '', label: 'All Types' },
        { value: 'Fire', label: 'Fire' },
        { value: 'Medical', label: 'Medical' },
        { value: 'Natural Disaster', label: 'Natural Disaster' },
        { value: 'Security', label: 'Security' },
    ];



    const columns: Column<ResponsePlanData>[] = [
        {
            header: 'ERP ID',
            accessorKey: 'erpId',
            sortable: true,
            cell: (item) => <span className="text-xs text-gray-500">{item.erpId}</span>
        },
        {
            header: 'Plan Title',
            accessorKey: 'title',
            sortable: true,
            cell: (item) => <span className="text-sm font-bold text-gray-800">{item.title}</span>
        },
        {
            header: 'Type',
            accessorKey: 'type',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{formatCategory(item.type)}</span>
        },
        {
            header: 'Version',
            accessorKey: 'version',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.version}</span>
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.status}
                    variant={item.status === 'Active' ? 'active' : 'under review'}
                    className="rounded-lg"
                />
            )
        },
        {
            header: 'Next review',
            accessorKey: 'nextReview',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.nextReview}</span>
        },
        {
            header: '',
            cell: () => (
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye size={16} />
                </button>
            ),
            className: "w-10"
        }
    ];

    const filteredPlans = RESPONSE_PLANS.filter(plan => {
        const matchesSearch = !searchTerm || (
            plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.erpId.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = !statusFilter || plan.status === statusFilter;
        const matchesType = !typeFilter || plan.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const actionButton = {
        label: 'Quick Report',
        onClick: () => console.log('Quick Report'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Emergency Preparedness"
            description="Manage response plans, drills, and equipment"
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Tabs */}
                <div className="inline-flex p-1 bg-[#E5E6E6] rounded-[20px] border border-gray-150 shadow-sm gap-2 w-fit">
                    {['Response Plans', 'Drill Schedule', 'Equipment Inventory'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                                activeTab === tab ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search emergency response plans ..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="w-44">
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={STATUS_OPTIONS}
                                placeholder="Status"
                                bgColor="bg-light-gold"
                            />
                        </div>
                        <div className="w-44">
                            <Select
                                value={typeFilter}
                                onChange={setTypeFilter}
                                options={TYPE_OPTIONS}
                                placeholder="Type"
                                bgColor="bg-light-gold"
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Emergency Response Plan"
                    data={filteredPlans}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    paginatable={true}
                    totalItems={filteredPlans.length}
                />
            </div>
        </DashboardLayout>
    );
};

export default ResponsePlan;
