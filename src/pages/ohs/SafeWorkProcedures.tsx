import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Search,
    Plus,
    Eye,
    Edit,
    Download,
    Siren,
    Settings,
    Beaker,
    HardHat,
    Zap,
    ArrowUp
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';

// --- MOCK DATA ---
const STATS = [
    {
        label: 'Emergency Response',
        value: 12,
        icon: Siren,
        bg: 'bg-[#E4F2D3]',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-white/60'
    },
    {
        label: 'Equipment Operation',
        value: 18,
        icon: Settings,
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Hazardous Materials',
        value: 8,
        icon: Beaker,
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Personal Protective Equipment',
        value: 6,
        icon: HardHat,
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Electrical Safety',
        value: 10,
        icon: Zap,
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Working at Heights',
        value: 5,
        icon: ArrowUp,
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]'
    }
];

import { ohsService } from '../../services/ohsService';

// ... (keep Stats)

const SafeWorkProcedures: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>(['3']);
    const [procedures, setProcedures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const loadSwps = async () => {
            try {
                const data = await ohsService.getSWPs();
                const mapped = data.map((item: any) => ({
                    id: item.id,
                    swpId: item.swp_id,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    version: item.version,
                    status: item.status,
                    lastUpdated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A',
                    reviewDue: item.review_date ? new Date(item.review_date).toLocaleDateString() : 'N/A',
                    selected: false
                }));
                setProcedures(mapped);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadSwps();
    }, []);

    const columns: Column<typeof procedures[0]>[] = [
        {
            header: 'SWP ID',
            accessorKey: 'swpId',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#45bfa3] flex items-center justify-center text-white text-[10px] font-bold">
                    </div>
                    <span className="text-sm font-medium text-gray-500">{item.swpId}</span>
                </div>
            )
        },
        {
            header: 'Title',
            accessorKey: 'title',
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">{item.title}</span>
                    <span className="text-xs text-gray-400">{item.description}</span>
                </div>
            )
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-800">{item.category}</span>
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
                    variant={item.status === 'Active' ? 'active' : 'pending approval'}
                />
            )
        },
        {
            header: 'Last Updated',
            accessorKey: 'lastUpdated',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.lastUpdated}</span>
        },
        {
            header: 'Review Due',
            accessorKey: 'reviewDue',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.reviewDue}</span>
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                    <button className="hover:text-[#004D40] transition-colors"><Eye size={16} /></button>
                    <button className="hover:text-[#004D40] transition-colors"><Edit size={16} /></button>
                    <button className="hover:text-[#004D40] transition-colors"><Download size={16} /></button>
                </div>
            ),
            className: "text-center"
        }
    ];

    const filteredProcedures = procedures.filter(proc =>
        proc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.swpId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const actionButton = {
        label: 'New Procedure',
        onClick: () => console.log('New Procedure'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Safe Work Procedures"
            description="Safe Work Procedures"
            breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Safe Work Procedures" }]}
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {STATS.map((stat, idx) => (
                        <div key={idx} className={clsx("p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow", stat.bg)}>
                            <div className="flex justify-between items-start">
                                <div className={clsx("p-1.5 rounded-lg", stat.iconBg)}>
                                    <stat.icon size={16} className={clsx(stat.text)} />
                                </div>
                            </div>
                            <div className="mt-2 text-left">
                                <div className="text-[11px] font-medium text-gray-500 leading-tight mb-1 h-8 flex items-end pb-1">{stat.label}</div>
                                <div className={clsx("text-3xl font-bold", stat.text)}>
                                    {stat.value}
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <stat.icon size={80} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search procedures ..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading procedures...</div>
                ) : (
                    <DataTable
                        title="Procedure Library"
                        data={filteredProcedures}
                        columns={columns}
                        keyField="id"
                        selectable={true}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        paginatable={true}
                        totalItems={filteredProcedures.length}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default SafeWorkProcedures;
