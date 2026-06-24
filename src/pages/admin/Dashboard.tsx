import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
// import Legend from '../../components/dashboard/Legend';
import IncidentTrendsChart from '../../components/dashboard/IncidentTrendsChart';
import RegionalDistributionChart from '../../components/dashboard/RegionalDistributionChart';
import RecentIncidentsTable from '../../components/dashboard/RecentIncidentsTable';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
    CATEGORY_DATA
} from '../../data/mockData';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents';
import { Select } from '../../components/common/Select';
import { PROVINCES } from '../../data/constants';

const Dashboard: React.FC = () => {
    const [selectedProvince, setSelectedProvince] = useState('All provinces');
    const [selectedTimeRange, setSelectedTimeRange] = useState('Last 30 Days');

    const {
        data: casesData,
        isLoading: loading,
    } = useIncidents({ take: 1000 });

    const cases = casesData?.data || [];

    // Derived statistics and filtered cases
    const filteredCases = selectedProvince === 'All provinces' || selectedProvince === ''
        ? cases
        : cases.filter(c => c.building?.province?.name === selectedProvince);

    const stats_data = {
        total: filteredCases.length,
        closed: filteredCases.filter(c => c.status === 'CLOSED').length,
        pending: filteredCases.filter(c => c.status === 'OPEN' || c.status === 'PENDING' || c.status === 'RAISED').length,
        resolved: filteredCases.filter(c => c.status === 'RESOLVED').length,
    };

    const DASHBOARD_STATS = [
        {
            title: 'Total Incidents',
            value: stats_data.total.toString(),
            change: '12%',
            trend: 'up' as const,
        },
        {
            title: 'Closed',
            value: stats_data.closed.toString(),
            change: '8%',
            trend: 'up' as const,
        },
        {
            title: 'Pending',
            value: stats_data.pending.toString(),
            change: '3%',
            trend: 'down' as const,
        },
        {
            title: 'Resolved',
            value: stats_data.resolved.toString(),
            change: '15%',
            trend: 'up' as const,
        },
    ];

    // PROVINCES moved to constants

    const TIME_RANGES = [
        'Last 10 Days', 'Last 30 Days', 'Last 2 Months', 'Last 6 Months'
    ];

    const headerContent = (
        <div className="flex items-center gap-3">
            <div className="w-40">
                <Select
                    value={selectedProvince}
                    onChange={setSelectedProvince}
                    options={[{ value: 'All provinces', label: 'All provinces' }, ...PROVINCES.map(p => ({ value: p, label: p }))]}
                    placeholder="All provinces"
                    bgColor="bg-light-gold"
                />
            </div>

            <div className="w-40">
                <Select
                    value={selectedTimeRange}
                    onChange={setSelectedTimeRange}
                    options={TIME_RANGES.map(range => ({ value: range, label: range }))}
                    placeholder="Select Time Range"
                    bgColor="bg-light-gold"
                />
            </div>
        </div>
    );

    return (
        <DashboardLayout
            title="Executive Dashboard"
            description="Dashboard"
            breadcrumbs={[{ label: "Dashboard", path: "/admin/dashboard" }, { label: "Overview" }]}
            headerContent={headerContent}
        >

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
                {/* Left Column: Stats & Trends */}
                <div className="xl:col-span-3 flex flex-col gap-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {DASHBOARD_STATS.map((stat, index) => (
                            <StatCard
                                key={index}
                                {...stat}
                                icon={[
                                    <ClipboardList size={22} />,
                                    <CheckCircle2 size={22} />,
                                    <Clock size={22} />,
                                    <AlertCircle size={22} />
                                ][index]}
                                variant={index === 0 ? 'primary' : 'default'}
                            />
                        ))}
                    </div>

                    {/* Incident Trends Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9ECEF] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[#1F2937] text-lg">Incident Trends</h3>
                            <button className="flex items-center gap-2 px-3 py-1 bg-[#F1E3D3] text-[#884616] rounded-lg text-xs font-bold transition-colors">
                                This Week <ChevronDown size={14} />
                            </button>
                        </div>

                        <div className="flex-1 w-full">
                            <IncidentTrendsChart />
                        </div>

                        <div className="flex justify-center gap-8 mt-6">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-3 bg-[#F1E3D3] rounded-sm"></span>
                                <span className="text-sm font-bold text-gray-600">Total Incident</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-3 bg-[#BB8F53] rounded-sm"></span>
                                <span className="text-sm font-bold text-gray-600">Resolved</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: By Category Donut Chart */}
                <div className="xl:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9ECEF] flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-[#1F2937] text-lg">By Category</h3>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="h-[220px] w-full relative mb-6">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200}>
                                    <PieChart>
                                        <Pie
                                            data={CATEGORY_DATA}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {CATEGORY_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="w-full space-y-3 px-2">
                                {CATEGORY_DATA.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="px-2 py-0.5 rounded text-[10px] font-bold min-w-[45px] text-center"
                                                style={{ backgroundColor: cat.color, color: idx === 1 ? '#1F2937' : 'white' }}
                                            >
                                                {cat.pct}
                                            </div>
                                            <span className="text-sm font-bold text-gray-600">{cat.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Regional Distribution Chart */}
            <div className="mb-8">
                <RegionalDistributionChart />
            </div>

            {/* Recent Incidents Table */}
            <div>
                <RecentIncidentsTable cases={filteredCases} loading={loading} />
            </div>

        </DashboardLayout>
    );
};

export default Dashboard;
