import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Plus,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Edit,
    Download
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { useJSAs, useOHSStats } from '../../hooks/useOHS';

// ... (keep Stats)

const JSADocuments: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // TanStack Query hooks
    const { data: jsaData, isLoading: loading } = useJSAs();
    const { data: statsData } = useOHSStats();

    const jsaList = useMemo(() => {
        if (!jsaData) return [];
        return jsaData.map((j: any) => ({
            id: j.id,
            jsaId: j.jsa_id || j.id,
            title: j.job_name || 'Untitled',
            description: j.description || j.remarks || 'No description',
            status: j.status || 'Draft',
            tags: j.hazards ? j.hazards.split(',').map((s: string) => s.trim()) : [],
            created: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'N/A',
            review: j.review_date ? new Date(j.review_date).toLocaleDateString() : 'N/A',
            author: j.created_by ? j.created_by.substring(0, 8) : 'Unknown'
        }));
    }, [jsaData]);

    const stats = useMemo(() => ({
        approved: statsData?.jsa?.approved ?? 0,
        pending: statsData?.jsa?.pending ?? 0,
        expired: statsData?.jsa?.expired ?? 0,
        total: statsData?.jsa?.total ?? 0,
    }), [statsData]);

    const STATS = [
        {
            label: 'Approved JSAs',
            value: stats.approved,
            change: '-', // Calculating change requires history, skipping for now
            trend: 'up',
            icon: CheckCircle2,
            bg: 'bg-[#F1E3D3]',
            text: 'text-[#884616]',
            iconBg: 'bg-white/60'
        },
        {
            label: 'Pending Review',
            value: stats.pending,
            change: '-',
            trend: 'up',
            icon: Clock,
            bg: 'bg-white',
            text: 'text-[#884616]',
            iconBg: 'bg-[#F1E3D3]'
        },
        {
            label: 'Expired',
            value: stats.expired,
            change: '-',
            trend: 'up',
            icon: AlertCircle,
            bg: 'bg-white',
            text: 'text-[#884616]',
            iconBg: 'bg-[#F1E3D3]'
        },
        {
            label: 'Total Documents',
            value: stats.total,
            change: '-',
            trend: 'up',
            icon: FileText,
            bg: 'bg-white',
            text: 'text-[#884616]',
            iconBg: 'bg-[#F1E3D3]'
        }
    ];

    const columns: Column<typeof jsaList[0]>[] = [
        {
            header: 'JSA ID',
            accessorKey: 'jsaId',
            sortable: true,
            cell: (item) => <span className="font-bold text-gray-800">{item.jsaId}</span>
        },
        {
            header: 'Title & Description',
            accessorKey: 'title',
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-[#884616] font-bold text-sm mb-1">{item.title}</span>
                    <span className="text-gray-500 text-xs">{item.description}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.status}
                    variant={item.status === 'Approved' ? 'resolved' : item.status.toLowerCase()}
                />
            )
        },
        {
            header: 'Hazards',
            accessorKey: 'tags',
            cell: (item) => (
                <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] whitespace-nowrap">
                            {tag}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: 'Dates',
            accessorKey: 'created',
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col text-[10px] text-gray-500">
                    <span>Created: {item.created}</span>
                    <span>Review: {item.review}</span>
                </div>
            )
        },
        {
            header: 'Author',
            accessorKey: 'author',
            sortable: true,
            cell: (item) => <span className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-600 shadow-sm">{item.author}</span>
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center gap-2">
                    <button title="View JSA" aria-label="View JSA" className="p-1.5 text-gray-400 hover:text-[#004D40] hover:bg-gray-50 rounded-lg transition-colors">
                        <Eye size={16} />
                    </button>
                    <button title="Edit JSA" aria-label="Edit JSA" className="p-1.5 text-gray-400 hover:text-[#004D40] hover:bg-gray-50 rounded-lg transition-colors">
                        <Edit size={16} />
                    </button>
                    <button title="Download JSA" aria-label="Download JSA" className="p-1.5 text-gray-400 hover:text-[#004D40] hover:bg-gray-50 rounded-lg transition-colors">
                        <Download size={16} />
                    </button>
                </div>
            )
        }
    ];

    const filteredJSA = jsaList.filter((jsa: any) =>
        jsa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jsa.jsaId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const actionButton = {
        label: 'Create New JSA',
        onClick: () => console.log('Create New JSA'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Job Safety Analysis"
            description="JSA Documents"
            breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "JSA Documents" }]}
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STATS.map((stat, idx) => (
                        <div key={idx} className={clsx("p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-all", stat.bg)}>
                            <div className="flex justify-between items-start z-10">
                                <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                                <div className={clsx("p-1.5 rounded-lg shadow-sm", stat.iconBg)}>
                                    <stat.icon size={16} className={clsx(stat.text)} />
                                </div>
                            </div>
                            <div className="z-10 mt-2">
                                <div className={clsx("text-4xl font-bold mb-1", stat.text)}>
                                    {stat.value}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#F1E3D3] text-[#884616] flex items-center gap-0.5">
                                        +{stat.change}
                                    </span>
                                    <span className="text-xs text-gray-400">from last month</span>
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <stat.icon size={120} />
                            </div>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading JSA documents...</div>
                ) : (
                    <DataTable
                        title="JSA Documents"
                        data={filteredJSA}
                        columns={columns}
                        keyField="id"
                        selectable={true}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        searchable={true}
                        onSearch={setSearchTerm}
                        paginatable={true}
                        totalItems={filteredJSA.length}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default JSADocuments;
