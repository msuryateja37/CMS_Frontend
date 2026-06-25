import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Plus,
    FileText,
    Clock,
    AlertCircle,
    CheckCircle2,
    MapPin,
    Calendar,
    User,
    MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';

// --- MOCK DATA ---
const STATS = [
    {
        label: 'Active Permits',
        value: 12,
        icon: FileText,
        bg: 'bg-[#F1E3D3]',
        text: 'text-[#884616]',
        iconBg: 'bg-white/60'
    },
    {
        label: 'Pending Approval',
        value: 5,
        icon: Clock,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Expired Today',
        value: 2,
        icon: AlertCircle,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Completed MTD',
        value: 34,
        icon: CheckCircle2,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    }
];

import { operationsService } from '../../services/operationsService';

// ... (keep STATS)

const PermitToWork: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [permits, setPermits] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchPermits = async () => {
            try {
                const data = await operationsService.getPermits();
                const mapped = data.map((p: any) => ({
                    id: p.id,
                    ptwId: p.caseNumber,
                    title: p.title,
                    location: p.building?.name || 'Unknown',
                    date: p.occurredAt ? new Date(p.occurredAt).toLocaleDateString() : 'N/A',
                    owner: p.assignedTo?.fullName || 'Unassigned',
                    priority: p.priorityLevel || 'Low',
                    status: p.status === 'OPEN' ? 'Active' : p.status === 'PENDING' ? 'Pending Approval' : 'Completed'
                }));
                setPermits(mapped);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPermits();
    }, []);

    const filteredPermits = permits.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ptwId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: Column<typeof permits[0]>[] = [
        {
            header: 'Permit ID',
            accessorKey: 'ptwId',
            sortable: true,
            cell: (item) => <span className="text-xs font-bold text-gray-800">{item.ptwId}</span>
        },
        {
            header: 'Title',
            accessorKey: 'title',
            sortable: true,
            cell: (item) => <span className="text-sm font-bold text-[#BB8F53] hover:underline cursor-pointer">{item.title}</span>
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
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.status}
                    variant={
                        item.status === 'Active' ? 'active' :
                            item.status === 'Completed' ? 'resolved' :
                                item.status === 'Pending Approval' ? 'pending approval' :
                                    item.status.toLowerCase()
                    }
                />
            )
        },
        {
            header: 'Location',
            accessorKey: 'location',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={14} className="text-gray-400" />
                    {item.location}
                </div>
            )
        },
        {
            header: 'Date',
            accessorKey: 'date',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={14} className="text-gray-400" />
                    {item.date}
                </div>
            )
        },
        {
            header: 'Owner',
            accessorKey: 'owner',
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <User size={14} className="text-gray-400" />
                    {item.owner}
                </div>
            )
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

    const actionButton = {
        label: 'New Permit Request',
        onClick: () => console.log('New Permit'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Permit to Work"
            description="Manage work permits for high-risk activities"
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STATS.map((stat, idx) => (
                        <div key={idx} className={clsx("p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-shadow", stat.bg)}>
                            <div className="flex justify-between items-start z-10">
                                <div className={clsx("flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-bold")}>
                                    <div className={clsx("p-1.5 rounded-lg", stat.iconBg)}>
                                        <stat.icon size={16} className={clsx(stat.text)} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                                </div>
                            </div>
                            <div className="z-10 mt-2">
                                <div className={clsx("text-4xl font-bold mb-1", stat.text)}>
                                    {stat.value}
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <stat.icon size={120} />
                            </div>
                        </div>
                    ))}
                </div>

                <DataTable
                    title="Work Permits"
                    data={filteredPermits}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    paginatable={true}
                    totalItems={filteredPermits.length}
                    searchable={true}
                    onSearch={setSearchTerm}
                />
            </div>
        </DashboardLayout>
    );
};

export default PermitToWork;
