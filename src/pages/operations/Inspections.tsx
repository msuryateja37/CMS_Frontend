import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Plus,
    Calendar,
    CheckCircle2,
    PlayCircle,
    MapPin,
    User,
    MoreHorizontal,
    AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { formatCategory } from '../../utils/formatters';


// --- MOCK DATA ---
const STATS = [
    {
        label: 'Overdue',
        value: 2,
        icon: AlertCircle,
        bg: 'bg-[#F1E3D3]',
        text: 'text-[#884616]',
        iconBg: 'bg-white/60'
    },
    {
        label: 'Scheduled',
        value: 18,
        icon: Calendar,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'In Progress',
        value: 4,
        icon: PlayCircle,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Completed MTD',
        value: 45,
        icon: CheckCircle2,
        bg: 'bg-white',
        text: 'text-[#884616]',
        iconBg: 'bg-[#F2FDF0]'
    }
];

import { operationsService } from '../../services/operationsService';

// ... (keep STATS)

const Inspections: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Scheduled' | 'Completed'>('Scheduled');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [inspections, setInspections] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchInspections = async () => {
            try {
                const data = await operationsService.getInspections();
                const mapped = data.map((i: any) => ({
                    id: i.id,
                    insId: i.id.substring(0, 8).toUpperCase(),
                    type: i.type,
                    status: i.status === 'SCHEDULED' ? 'Scheduled' : i.status === 'COMPLETED' ? 'Completed' : 'Overdue',
                    title: `${i.type} Inspection`, // Basic title if not in DB
                    location: i.building?.name || 'Unknown',
                    date: i.conductedAt ? new Date(i.conductedAt).toLocaleDateString() : 'Pending',
                    inspector: i.inspector?.fullName || 'Unassigned',
                    frequency: i.frequency || 'Adhoc'
                }));
                setInspections(mapped);
            } catch (err) {
                console.error(err);
            }
        };
        fetchInspections();
    }, []);

    const filteredInspections = inspections.filter(i => activeTab === 'Scheduled' ? (i.status === 'Scheduled' || i.status === 'Overdue' || i.status === 'IN_PROGRESS') : i.status === 'Completed');

    const columns: Column<typeof inspections[0]>[] = [
        {
            header: 'Inspection ID',
            accessorKey: 'insId',
            sortable: true,
            cell: (item) => <span className="font-bold text-sm text-gray-800">{item.insId}</span>
        },
        {
            header: 'Title',
            accessorKey: 'title',
            sortable: true,
            cell: (item) => <h4 className="text-[#BB8F53] font-bold text-sm">{item.title}</h4>
        },
        {
            header: 'Type',
            accessorKey: 'type',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={formatCategory(item.type)}
                    variant="default"
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
                        item.status === 'Completed' ? 'resolved' :
                            item.status === 'Overdue' ? 'critical' :
                                item.status === 'Scheduled' ? 'operational' :
                                    'in progress'
                    }
                />
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
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Calendar size={14} className="text-gray-400" /> {item.date}
                </div>
            )
        },
        {
            header: 'Inspector',
            accessorKey: 'inspector',
            cell: (item) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <User size={14} className="text-gray-400" /> {item.inspector}
                </div>
            )
        },
        {
            header: 'Action',
            cell: () => (
                <div className="flex items-center gap-2">
                    <button className="px-4 py-1.5 bg-[#F1E3D3] text-[#884616] rounded-lg text-xs font-bold hover:bg-[#d4eabc] transition-colors">
                        Start
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            )
        }
    ];

    const actionButton = {
        label: 'Schedule Inspection',
        onClick: () => console.log('Schedule Inspection'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Inspections"
            description="Schedule and manage facility inspections"
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

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-100">
                    <button
                        className={clsx(
                            "pb-3 text-sm font-bold transition-colors relative",
                            activeTab === 'Scheduled' ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                        )}
                        onClick={() => setActiveTab('Scheduled')}
                    >
                        Scheduled ({inspections.filter(i => i.status !== 'Completed').length})
                        {activeTab === 'Scheduled' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-full"></div>}
                    </button>
                    <button
                        className={clsx(
                            "pb-3 text-sm font-bold transition-colors relative",
                            activeTab === 'Completed' ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                        )}
                        onClick={() => setActiveTab('Completed')}
                    >
                        Completed ({inspections.filter(i => i.status === 'Completed').length})
                        {activeTab === 'Completed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 rounded-full"></div>}
                    </button>
                </div>


                <DataTable
                    title={activeTab === 'Scheduled' ? "Upcoming Inspections" : "Completed Inspections"}
                    data={filteredInspections}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    paginatable={true}
                    totalItems={filteredInspections.length}
                    searchable={true}
                />
            </div>
        </DashboardLayout>
    );
};

export default Inspections;
