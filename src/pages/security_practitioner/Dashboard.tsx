import React, { useState, useMemo } from 'react';
import usePagination from '../../hooks/usePagination';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import {
    Plus,
    ShieldAlert,
    Clock,
    CheckCircle2,
    ExternalLink,
    Search,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Tooltip
} from 'recharts';
import { DataTable, type Column } from '../../components/common/DataTable';
import { useSecurityStats, useSecurityIncidents, useSecurityTrends, useSecuritySeverity } from '../../hooks/useSecurity';
import { Select } from '../../components/common/Select';
import { STATUS_OPTIONS, SEVERITY_OPTIONS } from '../../data/constants';

// --- MOCK DATA ---
const STATS_DATA = [
    { id: 1, label: 'Critical', value: '46', icon: ShieldAlert, color: 'bg-red-200', borderColor: 'bg-[#b91c1c]', textColor: 'text-[#b91c1c]', iconColor: 'text-[#b91c1c]', iconBg: 'bg-white' },
    { id: 2, label: 'High Priority', value: '8', icon: Clock, color: 'bg-white', borderColor: 'bg-orange-500', textColor: 'text-orange-500', iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
    { id: 3, label: 'Under investigation', value: '12', icon: Clock, color: 'bg-white', borderColor: 'bg-blue-500', textColor: 'text-blue-600', iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
    { id: 4, label: 'Resolution Rate', value: '89%', icon: CheckCircle2, color: 'bg-white', borderColor: 'bg-green-500', textColor: 'text-green-600', iconColor: 'text-green-600', iconBg: 'bg-green-50' },
];

const BAR_CHART_DATA = [
    { name: 'Aug', count: 400 },
    { name: 'Sep', count: 450 },
    { name: 'Oct', count: 480 },
    { name: 'Nov', count: 420 },
    { name: 'Dec', count: 520 },
    { name: 'Jan', count: 400 },
];

const PIE_CHART_DATA = [
    { name: 'Critical', value: 50, color: '#ef4444' },
    { name: 'High', value: 50, color: '#f97316' },
    { name: 'Medium', value: 33.3, color: '#3b82f6' },
    { name: 'Low', value: 16.7, color: '#22c55e' },
];

const INCIDENTS_DATA = [
    { id: '1', incId: 'INC-2025-0001', description: 'Unauthorized access ...', detail: 'Unknown individual gain access.', severity: 'Medium', status: 'Open' },
    { id: '2', incId: 'INC-2025-0002', description: 'Unauthorized access ...', detail: 'Unknown individual gain access.', severity: 'Critical', status: 'Investigating' },
    { id: '3', incId: 'INC-2025-0003', description: 'Unauthorized access ...', detail: 'Unknown individual gain access.', severity: 'Critical', status: 'Resolved' },
    { id: '4', incId: 'INC-2025-0004', description: 'Unauthorized access ...', detail: 'Unknown individual gain access.', severity: 'High', status: 'Resolved' },
    { id: '5', incId: 'INC-2025-0005', description: 'Unauthorized access ...', detail: 'Unknown individual gain access.', severity: 'Low', status: 'Closed' },
];

const SecurityDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>(['3']);
    const [statusFilter, setStatusFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');

    // TanStack Query hooks
    const { data: statsData } = useSecurityStats();
    const { data: incidentsData } = useSecurityIncidents();
    const { data: trendsData } = useSecurityTrends();
    const { data: severityApiData } = useSecuritySeverity();

    const stats = useMemo(() => {
        if (!statsData || statsData.length === 0) return STATS_DATA;
        return STATS_DATA.map(s => {
            const backendItem = statsData.find((b: any) => b.id === s.id);
            return backendItem ? { ...s, value: backendItem.value } : s;
        });
    }, [statsData]);

    const incidents = useMemo(() => {
        if (!incidentsData) return INCIDENTS_DATA;
        return incidentsData.map((dict: any) => {
            let status = dict.status || 'Open';
            if (status === 'IN_PROGRESS') status = 'Investigating';
            if (status === 'RESOLVED') status = 'Resolved';
            if (status === 'CLOSED') status = 'Closed';
            if (status === 'OPEN') status = 'Open';
            return {
                id: dict.id,
                incId: dict.caseNumber || 'INC-NEW',
                description: dict.description ? (dict.description.length > 50 ? dict.description.substring(0, 50) + '...' : dict.description) : 'Security Incident',
                detail: dict.description || 'No details',
                severity: dict.severity || dict.severityLevel || 'Low',
                status
            };
        });
    }, [incidentsData]) as any[];

    const chartData = useMemo(() => (trendsData as any[] | undefined) || BAR_CHART_DATA, [trendsData]);
    const severityData = useMemo(() => (severityApiData as any[] | undefined) || PIE_CHART_DATA, [severityApiData]);

    const filteredIncidents = incidents.filter((inc: any) => {
        const matchesSearch = inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inc.incId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || inc.status === statusFilter;
        const matchesSeverity = !severityFilter || inc.severity === severityFilter;
        return matchesSearch && matchesStatus && matchesSeverity;
    });

    const {
        paginatedData: paginatedIncidents,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        setItemsPerPage,
    } = usePagination({
        data: filteredIncidents,
        defaultItemsPerPage: 10,
        resetOnChange: [statusFilter, severityFilter, searchTerm],
    });

    const columns: Column<typeof INCIDENTS_DATA[0]>[] = [
        {
            header: 'ID',
            accessorKey: 'incId',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#45bfa3]"></div>
                    <span className="text-sm font-medium text-gray-700">{item.incId}</span>
                </div>
            )
        },
        {
            header: 'Description',
            accessorKey: 'description',
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{item.description}</span>
                    <span className="text-xs text-gray-400">{item.detail}</span>
                </div>
            )
        },
        {
            header: 'Severity',
            accessorKey: 'severity',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.severity}
                    variant={item.severity.toLowerCase()}
                />
            ),
            className: "text-center"
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.status}
                    variant={item.status.toLowerCase() === 'inprogress' ? 'in progress' : item.status.toLowerCase()}
                />
            ),
            className: "text-center"
        },
        {
            header: 'Actions',
            cell: () => (
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <ExternalLink size={14} />
                    <span>View Details</span>
                </button>
            ),
            className: "text-right"
        }
    ];

    const navigate = useNavigate();

    return (
        <DashboardLayout title="Security Incidents" description="Security Incidents" breadcrumbs={[{ label: "Dashboard", path: "/security/dashboard" }, { label: "Security Incidents" }]}
            actionButton={{
                label: "Quick Report",
                onClick: () => navigate('/ohs/report-incident?type=SECURITY'),
                icon: Plus
            }}
        >
            <div className="flex flex-col gap-6 p-1 pb-10">

                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Left Column: Stats Cards & Bar Chart */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat) => (
                                <div key={stat.id} className={`${stat.color} rounded-2xl relative overflow-hidden flex flex-col justify-between h-36 shadow-sm hover:shadow-md transition-all group `}>
                                    <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-full ${stat.id === 1 ? 'bg-transparent' : 'bg-transparent'} ${stat.iconColor === 'text-[#b91c1c]' ? 'text-[#b91c1c]' : 'text-gray-400'}`}>
                                                {stat.id === 1 ? <stat.icon size={20} className={stat.iconColor} /> : <stat.icon size={18} className={stat.id === 2 ? 'text-orange-500' : stat.id === 3 ? 'text-blue-500' : 'text-green-500'} />}
                                            </div>
                                            <span className={`text-sm font-semibold ${stat.id === 1 ? 'text-[#b91c1c]' : 'text-gray-500'}`}>{stat.label}</span>
                                        </div>
                                        <div className={`text-5xl font-bold tracking-tight ${stat.textColor} mt-2`}>
                                            {stat.value}
                                        </div>
                                    </div>

                                    {/* Bottom Color Bar */}
                                    <div className={`h-4 w-full ${stat.borderColor}`}></div>

                                    {/* Background Decor */}
                                    {stat.id === 1 && (
                                        <div className="absolute bottom-[25%] right-[10%] ">
                                            <img src="/sidebar.png" alt="" className="w-32 h-32 " />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-800 text-lg">Security Incidents (6 Months)</h3>
                                <button className="bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                                    <ChevronDown size={14} className="text-gray-500" />
                                </button>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={50}>
                                            {chartData.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={index === chartData.length - 2 ? '#0f4c3a' : '#45bfa3'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Severity Chart */}
                    <div className="w-full xl:w-[320px] shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full max-h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 text-lg">By Severity</h3>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="flex-1 min-h-[220px] relative mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={severityData}
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={4}
                                        >
                                            {severityData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center content if needed, e.g. Total */}
                            </div>

                            <div className="space-y-4">
                                {severityData.map((item: any) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="px-2 py-1 rounded-md text-xs font-bold text-white min-w-[55px] text-center" style={{ backgroundColor: item.color }}>
                                                {item.value}%
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative w-full ">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search security incidents ...."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-green focus:ring-1 focus:ring-green focus:border-green outline-none transition-all placeholder:text-gray-400 text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-[160px]">
                            <Select
                                value={severityFilter}
                                onChange={setSeverityFilter}
                                options={[
                                    { value: '', label: 'All severities' },
                                    ...SEVERITY_OPTIONS
                                ]}
                                placeholder="Severity"
                                bgColor="bg-light-green"
                            />
                        </div>
                        <div className="w-[160px]">
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    { value: '', label: 'All statuses' },
                                    ...STATUS_OPTIONS
                                ]}
                                placeholder="Status"
                                bgColor="bg-light-green"
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Recent Incidents"
                    data={paginatedIncidents}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    searchable={false}
                    onSearch={setSearchTerm}
                    paginatable={true}
                    totalItems={filteredIncidents.length}
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

export default SecurityDashboard;
