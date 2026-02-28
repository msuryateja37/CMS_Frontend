import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Plus,
    AlertCircle,
    Calendar,
    CheckCircle2,
    FileText
} from 'lucide-react';
import clsx from 'clsx';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';
import { kpiService } from '../../services/kpiService';
import { formatCategory } from '../../utils/formatters';

// --- MOCK DATA ---
const STATS = [
    {
        label: 'Total Incidents (YTD)',
        value: 342,
        change: '16.7%',
        trend: 'up',
        icon: AlertCircle,
        bg: 'bg-[#E4F2D3]',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-white/60'
    },
    {
        label: 'Near Miss Rate',
        value: '4.2%',
        change: '4.7%',
        trend: 'down',
        icon: Calendar,
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Training Completion',
        value: '87%',
        change: '33.3%',
        trend: 'up',
        icon: FileText,
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]'
    },
    {
        label: 'Safety Actions Closed',
        value: '92%',
        change: '50.0%',
        trend: 'up',
        icon: CheckCircle2,
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]'
    }
];

const PROVINCE_SCORES = [
    { name: 'Gauteng', score: 92, incidents: 48, target: 90 },
    { name: 'Western Cape', score: 88, incidents: 32, target: 90 },
    { name: 'KwaZulu-Natal', score: 85, incidents: 38, target: 90 },
    { name: 'Eastern Cape', score: 78, incidents: 24, target: 90 },
    { name: 'Free State', score: 91, incidents: 44, target: 90 },
    { name: 'Northern Cape', score: 64, incidents: 12, target: 90 },
    { name: 'Limpopo', score: 73, incidents: 20, target: 90 },
    { name: 'Mpumalanga', score: 71, incidents: 19, target: 90 },
    { name: 'North West', score: 88, incidents: 32, target: 90 },
];

const TREND_DATA = [
    { name: 'Jan', value1: 48, value2: 12, value3: 18 },
    { name: 'Feb', value1: 52, value2: 15, value3: 20 },
    { name: 'Mar', value1: 45, value2: 11, value3: 17 },
    { name: 'Apr', value1: 54, value2: 18, value3: 22 },
    { name: 'May', value1: 49, value2: 16, value3: 21 },
    { name: 'Jun', value1: 58, value2: 15, value3: 19 },
    { name: 'Jul', value1: 55, value2: 17, value3: 20 },
];

const ACTIONS = [
    {
        id: '1',
        actionId: 'AP-2025-0001',
        description: 'Electrical Safety Improvement Program',
        category: 'Physical',
        phase: 'Do',
        status: 'On Track',
        progress: 60,
        owner: 'Thabo',
        dueDate: '20 May 2035'
    },
    {
        id: '2',
        actionId: 'AP-2025-0002',
        description: 'Fire Safety Equipment Upgrade',
        category: 'Chemical',
        phase: 'Do',
        status: 'At Risk',
        progress: 25,
        owner: 'Nerison',
        dueDate: '31 May 2035'
    },
    {
        id: '3',
        actionId: 'AP-2025-0003',
        description: 'OHS Training Rollout',
        category: 'Physical',
        phase: 'Do',
        status: 'On Track',
        progress: 60,
        owner: 'Mbali',
        dueDate: '05 Jun 2035'
    },
    {
        id: '4',
        actionId: 'AP-2025-0004',
        description: 'Hazard Identification System',
        category: 'Physical',
        phase: 'Check',
        status: 'Complete',
        progress: 100,
        owner: 'Ndlovu',
        dueDate: '16 Jun 2035'
    }
];

const KPIDashboard: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>(['3']);
    const [stats, setStats] = useState(STATS);

    React.useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await kpiService.getDashboardMetrics();
                // Map backend data to STATS
                if (data) {
                    const newStats = [...STATS];
                    // 0: Total Incidents
                    newStats[0].value = data.totalCases;
                    newStats[0].change = data.activeCases > 0 ? '+1' : '0'; // Logic placeholder

                    // 3: Safety Actions (Closure Rate)
                    newStats[3].value = `${data.closureRate}%`;

                    setStats(newStats);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchMetrics();
    }, []);


    const columns: Column<typeof ACTIONS[0]>[] = [
        {
            header: '',
            accessorKey: 'id',
            cell: () => (
                <div className="w-8 h-8 rounded-full bg-[#45bfa3] flex items-center justify-center text-white text-[10px] font-bold">
                </div>
            ),
            className: "w-10"
        },
        {
            header: 'Action Plan ID',
            accessorKey: 'actionId',
            sortable: true,
            cell: (item) => <span className="text-xs text-gray-500">{item.actionId}</span>
        },
        {
            header: 'Risk Description',
            accessorKey: 'description',
            sortable: true,
            cell: (item) => <span className="text-sm font-bold text-gray-800">{item.description}</span>
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{formatCategory(item.category)}</span>
        },
        {
            header: 'Phase',
            accessorKey: 'phase',
            sortable: true,
            cell: (item) => <span className="text-sm font-medium text-gray-600">{item.phase}</span>
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (item) => (
                <Pill
                    label={item.status}
                    variant={
                        item.status === 'On Track' ? 'resolved' :
                            item.status === 'At Risk' ? 'critical' :
                                'resolved'
                    }
                />
            )
        },
        {
            header: 'Progress',
            accessorKey: 'progress',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#004D40] rounded-full"
                            style={{ width: `${item.progress}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">{item.progress}%</span>
                </div>
            )
        },
        {
            header: 'Owner',
            accessorKey: 'owner',
            sortable: true,
            cell: (item) => <span className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-600">{item.owner}</span>
        },
        {
            header: 'Due Date',
            accessorKey: 'dueDate',
            sortable: true,
            cell: (item) => <span className="text-xs text-gray-600">{item.dueDate}</span>
        }
    ];

    const actionButton = {
        label: 'Quick Report',
        onClick: () => console.log('Quick Report'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Performance Dashboard"
            description="Key performance indicators and continuous improvement tracking"
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={clsx("p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-all", stat.bg)}>
                            <div className="flex justify-between items-start z-10">
                                <div className={clsx("flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-bold text-[#0E4D41]")}>
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
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#E4F2D3] text-[#0E4D41] flex items-center gap-0.5">
                                        {stat.change}
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

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-6">Monthly Incident Trends</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={TREND_DATA} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="value1" stroke="#45bfa3" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="value2" stroke="#004D40" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="value3" stroke="#FBBF24" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <h3 className="font-bold text-lg text-gray-800 mb-6">Providence Safety Scores</h3>
                        <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {PROVINCE_SCORES.map((prov, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between items-end text-xs">
                                        <span className="font-bold text-gray-700">{prov.name}</span>
                                        <span className="font-bold text-[#45bfa3]">{prov.score}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#004D40] rounded-full transition-all duration-500"
                                            style={{ width: `${prov.score}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400">
                                        <span>{prov.incidents} Incidents | Target: {prov.target}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Monthly Incident Trends"
                    data={ACTIONS}
                    columns={columns}
                    keyField="id"
                    selectable={true}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    paginatable={true}
                    totalItems={ACTIONS.length}
                />
            </div>
        </DashboardLayout>
    );
};

export default KPIDashboard;
