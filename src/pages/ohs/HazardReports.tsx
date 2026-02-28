import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    AlertTriangle,
    FileText,
    CheckCircle2,
    Plus,
    MoreHorizontal,
    Eye
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';

import { ohsService } from '../../services/ohsService';

const TABS = [
    'Hazard Reports',
    'Risk Register',
    'Job Safety Analysis',
    'Safe Work Procedures'
];

// ... (keep Stats)

const HazardReports: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Hazard Reports');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [hazards, setHazards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        openHazards: 0,
        criticalRisks: 0,
        activeJSAs: 0,
        resolvedHazards: 0
    });

    React.useEffect(() => {
        const loadHazards = async () => {
            try {
                setLoading(true);
                const [hazardsData, statsData] = await Promise.all([
                    ohsService.getHazards(),
                    ohsService.getStats()
                ]);
                const mapped = hazardsData.map((h: any) => ({
                    id: h.id,
                    hazId: h.caseNumber,
                    title: h.title,
                    priority: h.priorityLevel || 'Low',
                    status: h.status === 'OPEN' ? 'Open' : h.status === 'IN_PROGRESS' ? 'Under Review' : h.status,
                    location: h.building?.name || 'Unknown',
                    date: new Date(h.occurredAt).toLocaleDateString(),
                    reporter: h.reportedBy?.fullName || 'Unknown'
                }));
                setHazards(mapped);
                setStats({
                    openHazards: statsData.hazards.open,
                    criticalRisks: statsData.risks.critical,
                    activeJSAs: statsData.jsa.active,
                    resolvedHazards: statsData.hazards.resolved
                });
            } catch (err) {
                console.error("Failed to load hazards", err);
            } finally {
                setLoading(false);
            }
        };
        loadHazards();
    }, []);

    const STATS = [
        {
            label: 'Open Hazards',
            value: stats.openHazards,
            icon: <AlertTriangle size={20} />,
            bg: 'bg-[#E4F2D3]',
            text: 'text-dark-green',
            iconBg: 'bg-white/60'
        },
        {
            label: 'Critical Risks',
            value: stats.criticalRisks,
            icon: <AlertTriangle size={20} />,
            bg: 'bg-white',
            text: 'text-brand-red',
            iconBg: 'bg-subtle-red'
        },
        {
            label: 'Active JSAs',
            value: stats.activeJSAs,
            icon: <FileText size={20} />,
            bg: 'bg-white',
            text: 'text-dark-grey',
            iconBg: 'bg-subtle-grey'
        },
        {
            label: 'Resolved (YTD)',
            value: stats.resolvedHazards,
            icon: <CheckCircle2 size={20} />,
            bg: 'bg-white',
            text: 'text-dark-green',
            iconBg: 'bg-subtle-green'
        }
    ];

    const columns: Column<typeof hazards[0]>[] = [
        {
            header: 'ID',
            accessorKey: 'hazId',
            sortable: true,
            cell: (item) => <span className="text-sm font-bold text-gray-900">{item.hazId}</span>
        },
        {
            header: 'Title',
            accessorKey: 'title',
            sortable: true,
            cell: (item) => <h3 className="text-sm font-bold text-[#0E4D41]">{item.title}</h3>
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
                    variant={item.status.toLowerCase()}
                />
            )
        },
        {
            header: 'Location',
            accessorKey: 'location',
            sortable: true,
            cell: (item) => <span className="text-xs text-gray-500">{item.location}</span>
        },
        {
            header: 'Date',
            accessorKey: 'date',
            sortable: true,
            cell: (item) => <span className="text-xs text-gray-500">{item.date}</span>
        },
        {
            header: 'Reporter',
            accessorKey: 'reporter',
            sortable: true,
            cell: (item) => <span className="text-xs text-gray-500">{item.reporter}</span>
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#E4F2D3] text-[#0E4D41] rounded-lg text-xs font-bold hover:bg-[#d4eabc] transition-colors">
                        <Eye size={14} /> View
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            )
        }
    ];

    const filteredHazards = hazards.filter(hazard =>
        hazard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hazard.hazId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const actionButton = {
        label: "Quick Report",
        onClick: () => console.log("Quick report clicked"),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="OHS Management"
            description="Hazard Reports"
            breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Hazard Reports" }]}
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map((stat, idx) => (
                        <div key={idx} className={clsx("p-6 rounded-2xl border border-[#E9ECEF] flex flex-col justify-between h-32 relative overflow-hidden", stat.bg)}>
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shadow-sm", stat.iconBg)}>
                                    {stat.icon}
                                </div>
                                <span className="text-sm text-gray-600 font-medium">{stat.label}</span>
                            </div>
                            <div className={clsx("text-4xl font-bold relative z-10", stat.text)}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-[#F8F9FA] p-1 rounded-xl inline-flex">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab ? "bg-white text-dark-grey shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading hazards...</div>
                ) : (
                    <DataTable
                        title="Hazard Reports"
                        data={filteredHazards}
                        columns={columns}
                        keyField="id"
                        selectable={true}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        searchable={true}
                        onSearch={setSearchTerm}
                        paginatable={true}
                        totalItems={filteredHazards.length}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default HazardReports;
