import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Plus,
    Search,
    MoreHorizontal,
    TrendingUp,
    TrendingDown,
    Activity,
    AlertTriangle,
    Shield
} from 'lucide-react';
import clsx from 'clsx';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';
import { ohsService } from '../../services/ohsService';
import { SEVERITY_OPTIONS as LEVEL_OPTIONS } from '../../data/constants';
import { formatCategory } from '../../utils/formatters';

const RiskRegister: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [risks, setRisks] = useState<any[]>([]);
    const [stats, setStats] = useState({
        highRisks: 0,
        mediumRisks: 0,
        activeControls: 0
    });

    const STATUS_OPTIONS = [
        { value: '', label: 'All Statuses' },
        // { value: 'Open', label: 'Open' },
        { value: 'In Review', label: 'In Review' },
        { value: 'Mitigated', label: 'Mitigated' },
        { value: 'Closed', label: 'Closed' }
    ];

    const LEVEL_CHOICES = [
        { value: '', label: 'All Levels' },
        ...LEVEL_OPTIONS
    ];

    React.useEffect(() => {
        const fetchRisks = async () => {
            try {
                const [riskData, statsData] = await Promise.all([
                    ohsService.getRisks(),
                    ohsService.getStats()
                ]);
                // Map backend data if needed
                const mapped = riskData.map((r: any) => ({
                    id: r.riskId || r.id,
                    description: r.description || 'No description',
                    category: r.category || 'General',
                    level: r.riskLevel || 'Medium',
                    status: r.status || 'Open',
                    owner: 'Unassigned',
                    mitigation: r.mitigationStrategy || r.mitigation || 'None',
                    lastReview: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'
                }));
                if (riskData.length > 0) setRisks(mapped);

                setStats({
                    highRisks: statsData.risks.high + statsData.risks.critical, // Combine or just High?
                    mediumRisks: statsData.risks.medium,
                    activeControls: statsData.risks.activeControls
                });

            } catch (err) {
                console.error(err);
            }
        };
        fetchRisks();
    }, []);

    const STATS = [
        {
            label: 'High Risks',
            value: stats.highRisks,
            change: '-',
            trend: 'up',
            icon: AlertTriangle,
            bg: 'bg-white',
            text: 'text-brand-red',
            iconBg: 'bg-subtle-red'
        },
        {
            label: 'Medium Risks',
            value: stats.mediumRisks,
            change: '-',
            trend: 'down',
            icon: Shield,
            bg: 'bg-white',
            text: 'text-[#FFAD0D]',
            iconBg: 'bg-subtle-yellow'
        },
        {
            label: 'Active Controls',
            value: stats.activeControls,
            change: '-',
            trend: 'up',
            icon: Shield,
            bg: 'bg-white',
            text: 'text-green',
            iconBg: 'bg-subtle-green'
        },
        {
            label: 'Risk Trend',
            value: 'Stable',
            change: '0%',
            trend: 'stable',
            icon: Activity,
            bg: 'bg-[#E4F2D3]',
            text: 'text-dark-green',
            iconBg: 'bg-white/60'
        }
    ];

    const filteredData = risks.filter(risk => {
        const matchesSearch = !searchQuery || (
            risk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            risk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            risk.owner.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesStatus = !statusFilter || risk.status === statusFilter;
        const matchesLevel = !levelFilter || risk.level === levelFilter;

        return matchesSearch && matchesStatus && matchesLevel;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page on filter change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, levelFilter, searchQuery]);



    const columns: Column<typeof risks[0]>[] = [
        {
            header: 'Risk ID',
            accessorKey: 'id',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center">
                        <Shield size={16} className="text-green" />
                    </div>
                    <span className="font-bold text-dark-green text-xs uppercase tracking-wider">{item.id}</span>
                </div>
            )
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: (item) => <span className="text-sm text-dark-grey font-medium line-clamp-1">{item.description}</span>
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-xs text-light-grey font-bold">{formatCategory(item.category)}</span>
        },
        {
            header: 'Level',
            accessorKey: 'level',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.level}
                    variant={item.level.toLowerCase()}
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
                    variant={item.status === 'In Review' ? 'under review' : item.status.toLowerCase()}
                />
            )
        },
        {
            header: 'Owner',
            accessorKey: 'owner',
            cell: (item) => <span className="text-sm text-dark-grey font-bold">{item.owner}</span>
        },
        {
            header: 'Last Review',
            accessorKey: 'lastReview',
            sortable: true,
            cell: (item) => <span className="text-sm text-light-grey font-medium">{item.lastReview}</span>
        },
        {
            header: '',
            cell: () => (
                <button className="p-2 text-light-grey hover:text-dark-green transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            ),
            className: "w-10"
        }
    ];

    // Moved filtering logic to render based on state 'risks'


    return (
        <DashboardLayout
            title="Risk Register"
            description="Risk Register"
            breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Risk Register" }]}
            actionButton={{
                label: "Add Risk",
                onClick: () => console.log("Add risk clicked"),
                icon: Plus
            }}
        >
            <div className="flex flex-col gap-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STATS.map((stat, idx) => (
                        <div key={idx} className={clsx("p-6 rounded-3xl border border-semi-subtle-grey flex flex-col justify-between h-40 relative group overflow-hidden transition-all hover:shadow-lg", stat.bg)}>
                            <div className="flex justify-between items-start relative z-10">
                                <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.iconBg)}>
                                    <stat.icon size={20} className={stat.text} />
                                </div>
                                <div className={clsx("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                                    stat.trend === 'up' ? 'bg-red-50 text-red-500' :
                                        stat.trend === 'down' ? 'bg-green-50 text-green-500' :
                                            'bg-gray-50 text-gray-500'
                                )}>
                                    {stat.trend === 'up' && <TrendingUp size={12} />}
                                    {stat.trend === 'down' && <TrendingDown size={12} />}
                                    {stat.change}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-sm text-light-grey font-medium mb-1">{stat.label}</h4>
                                <div className={clsx("text-3xl font-bold", stat.text)}>
                                    {stat.value}
                                </div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <stat.icon size={140} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mt-4">
                    <div className="relative w-full xl:max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-light-grey group-focus-within:text-green transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by risk ID, description or owner ...."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-semi-subtle-grey rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="w-44">
                            <Select
                                value={levelFilter}
                                onChange={setLevelFilter}
                                options={LEVEL_CHOICES}
                                placeholder="Risk Level"
                                bgColor="bg-light-green"
                            />
                        </div>
                        <div className="w-44">
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={STATUS_OPTIONS}
                                placeholder="Status"
                                bgColor="bg-light-green"
                            />
                        </div>
                    </div>
                </div>

                {/* Risks Table */}
                <DataTable
                    title="Risk Register"
                    data={paginatedData}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    searchable={false}
                    filterable={false}
                    paginatable={true}
                    totalItems={filteredData.length}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => {
                        setItemsPerPage(val);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </DashboardLayout>
    );
};

export default RiskRegister;
