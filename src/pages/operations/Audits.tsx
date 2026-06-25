import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Plus,
    Calendar,
    CheckCircle2,
    AlertCircle,
    FileText,
    MapPin,
    MoreHorizontal,
    Building,
    ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { formatCategory } from '../../utils/formatters';

// --- MOCK DATA ---
const STATS = [
    {
        label: 'Active Audits',
        value: 3,
        icon: Calendar,
        bg: 'bg-[#F1E3D3]',
        text: 'text-[#884616]',
        iconBg: 'bg-white/60'
    },
    {
        label: 'Open Findings',
        value: 28,
        icon: AlertCircle,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Avg Compliance',
        value: '56%',
        icon: FileText,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Completed YTD',
        value: 12,
        icon: CheckCircle2,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    }
];

import { operationsService } from '../../services/operationsService';

// ... (keep STATS)

const Audits: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [audits, setAudits] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchAudits = async () => {
            try {
                const data = await operationsService.getAudits();
                const mapped = data.map((a: any) => ({
                    id: a.id,
                    audId: a.caseNumber,
                    type: a.category?.name?.includes('Internal') ? 'Internal' : 'External', // heuristic
                    title: a.title,
                    status: a.status === 'OPEN' ? 'In Progress' : a.status === 'CLOSED' ? 'Completed' : a.status,
                    system: a.description?.split('System:')[1]?.trim() || 'OHS System',
                    location: a.building?.name || 'Unknown',
                    date: a.occurredAt ? new Date(a.occurredAt).toLocaleDateString() : 'Pending'
                }));
                setAudits(mapped);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAudits();
    }, []);

    const columns: Column<typeof audits[0]>[] = [
        {
            header: 'Audit ID',
            accessorKey: 'audId',
            sortable: true,
            cell: (item) => <span className="font-bold text-gray-800">{item.audId}</span>
        },
        {
            header: 'Title',
            accessorKey: 'title',
            sortable: true,
            cell: (item) => <h4 className="text-[#BB8F53] font-bold text-sm tracking-tight">{item.title}</h4>
        },
        {
            header: 'Type',
            accessorKey: 'type',
            sortable: true,
            cell: (item) => (
                <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded text-[10px] font-bold tracking-wide">
                    {formatCategory(item.type)}
                </span>
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
                        item.status === 'Completed' || item.status === 'Closed' ? 'resolved' :
                            item.status === 'In Progress' ? 'in progress' :
                                item.status.toLowerCase()
                    }
                />
            )
        },
        {
            header: 'System',
            accessorKey: 'system',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Building size={14} className="text-gray-400" /> {item.system}
                </div>
            )
        },
        {
            header: 'Location',
            accessorKey: 'location',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <MapPin size={14} className="text-gray-400" /> {item.location}
                </div>
            )
        },
        {
            header: 'Date',
            accessorKey: 'date',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                    <Calendar size={14} className="text-gray-400" /> {item.date}
                </div>
            )
        },
        {
            header: '',
            cell: () => (
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                </button>
            ),
            className: "w-10"
        }
    ];

    const actionButton = {
        label: 'Schedule Audit',
        onClick: () => console.log('Schedule'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Audits"
            description="Manage internal and external compliance audits"
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                <div className="flex justify-end gap-3 mb-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#F1E3D3] text-[#884616] rounded-lg text-sm font-bold hover:bg-[#d4eabc] transition-colors">
                        <Plus size={16} /> Export Report <ChevronDown size={14} />
                    </button>
                </div>

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
                    title="Audit Schedule"
                    data={audits}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    paginatable={true}
                    totalItems={audits.length}
                    searchable={true}
                />
            </div>
        </DashboardLayout>
    );
};

export default Audits;
