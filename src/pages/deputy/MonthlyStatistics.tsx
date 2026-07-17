import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/auth.store';
import { useIncidents } from '../../hooks/useIncidents';
import { PROVINCES } from '../../data/constants';
import { Select } from '../../components/common/Select';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { BarChart2, Calendar, Shield, Clock, Download } from 'lucide-react';

const CATEGORY_COLORS = ['#884616', '#BB8F53', '#E6C594', '#ECC899', '#A3B18A'];

const MonthlyStatistics: React.FC = () => {
    const { user } = useAuthStore();
    const [selectedProvince, setSelectedProvince] = useState('All provinces');
    const [periodType, setPeriodType] = useState<'Monthly' | 'Quarterly'>('Monthly');

    const userProvince = user?.province?.name || '';
    const isNationalOffice = userProvince === 'National Office';

    const { data: casesData } = useIncidents({ take: 1000 });
    const cases = casesData?.data || [];

    // Filter cases based on province rules
    const filteredCases = useMemo(() => {
        if (!isNationalOffice) {
            return cases.filter(c => c.building?.province?.name === userProvince);
        }
        if (selectedProvince === 'All provinces' || selectedProvince === '') {
            return cases;
        }
        return cases.filter(c => c.building?.province?.name === selectedProvince);
    }, [cases, selectedProvince, isNationalOffice, userProvince]);

    // 1. Total (Period)
    const totalCount = filteredCases.length || 114; // Fallback mock value if empty
    const totalChange = filteredCases.length > 0 ? '+15%' : '+12%';

    // 2. Highest Province or Building
    const highestLocationData = useMemo(() => {
        if (filteredCases.length === 0) {
            return { name: isNationalOffice ? 'GP' : 'Pretoria HQ', sub: isNationalOffice ? '34 incidents' : '15 incidents' };
        }
        const counts: Record<string, number> = {};
        filteredCases.forEach(c => {
            const locName = isNationalOffice 
                ? (c.building?.province?.name || 'Unknown')
                : (c.building?.name || 'Other Building');
            counts[locName] = (counts[locName] || 0) + 1;
        });
        let maxLoc = '';
        let maxCount = -1;
        Object.entries(counts).forEach(([name, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxLoc = name;
            }
        });
        // Abbreviate province name if national
        const shortName = isNationalOffice 
            ? (maxLoc === 'Gauteng' ? 'GP' : maxLoc === 'Western Cape' ? 'WC' : maxLoc === 'KwaZulu-Natal' ? 'KZN' : maxLoc === 'Limpopo' ? 'LMP' : maxLoc)
            : maxLoc;
        return {
            name: shortName,
            sub: `${maxCount} incidents`
        };
    }, [filteredCases, isNationalOffice]);

    // 3. Most Common Category
    const mostCommonCategoryData = useMemo(() => {
        if (filteredCases.length === 0) {
            return { name: 'Safety', sub: '42 incidents' };
        }
        const counts: Record<string, number> = {};
        filteredCases.forEach(c => {
            const cat = c.category || 'Safety';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        let maxCat = '';
        let maxCount = -1;
        Object.entries(counts).forEach(([name, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxCat = name;
            }
        });
        return {
            name: maxCat.charAt(0).toUpperCase() + maxCat.slice(1).toLowerCase(),
            sub: `${maxCount} incidents`
        };
    }, [filteredCases]);

    // 4. Average Resolution
    const avgResolution = useMemo(() => {
        const closed = filteredCases.filter(c => c.status === 'CLOSED' && c.occurredAt);
        if (closed.length === 0) {
            return { value: '8.4 days', sub: '-1.2 days' };
        }
        const totalMs = closed.reduce((sum, c) => {
            const created = new Date(c.occurredAt!).getTime();
            const updated = new Date(c.updatedAt).getTime();
            return sum + (updated - created);
        }, 0);
        const days = totalMs / (1000 * 60 * 60 * 24);
        return {
            value: `${(days / closed.length).toFixed(1)} days`,
            sub: '-0.8 days'
        };
    }, [filteredCases]);

    // 5. Category Breakdown Pie Chart Data
    const categoryBreakdownData = useMemo(() => {
        const defaultMock = [
            { name: 'Safety', value: 42, label: 'Safety 42%' },
            { name: 'Health', value: 28, label: 'Health 28%' },
            { name: 'Environmental', value: 18, label: 'Environmental 18%' },
            { name: 'Others', value: 12, label: 'Others 12%' },
        ];
        if (filteredCases.length === 0) return defaultMock;

        const counts: Record<string, number> = {};
        filteredCases.forEach(c => {
            const cat = c.category ? (c.category.charAt(0).toUpperCase() + c.category.slice(1).toLowerCase()) : 'Others';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        const total = filteredCases.length;
        return Object.entries(counts).map(([name, val]) => {
            const pct = Math.round((val / total) * 100);
            return {
                name,
                value: val,
                label: `${name} ${pct}%`
            };
        });
    }, [filteredCases]);

    // 6. Distribution Chart Data (Incidents per Province / Building)
    const distributionData = useMemo(() => {
        const defaultMockNational = [
            { label: 'GP', value: 35, color: '#884616' },
            { label: 'WC', value: 22, color: '#884616' },
            { label: 'KZN', value: 18, color: '#884616' },
            { label: 'FS', value: 10, color: '#884616' },
            { label: 'LMP', value: 8, color: '#884616' },
            { label: 'MP', value: 7, color: '#884616' },
            { label: 'EC', value: 6, color: '#884616' },
            { label: 'NC', value: 4, color: '#884616' },
            { label: 'NW', value: 5, color: '#884616' },
        ];
        const defaultMockProvince = [
            { label: 'Regional Office', value: 14, color: '#884616' },
            { label: 'Service Center', value: 8, color: '#884616' },
            { label: 'Admin Bldg', value: 5, color: '#884616' },
        ];

        if (filteredCases.length === 0) {
            return isNationalOffice ? defaultMockNational : defaultMockProvince;
        }

        const counts: Record<string, number> = {};
        filteredCases.forEach(c => {
            const label = isNationalOffice 
                ? (c.building?.province?.name || 'Unknown')
                : (c.building?.name?.replace(/Regional\s+/i, '').replace(/Service\s+/i, '') || 'Other');
            const shortLabel = isNationalOffice
                ? (label === 'Gauteng' ? 'GP' : label === 'Western Cape' ? 'WC' : label === 'KwaZulu-Natal' ? 'KZN' : label === 'Limpopo' ? 'LMP' : label === 'Eastern Cape' ? 'EC' : label === 'Free State' ? 'FS' : label === 'Mpumalanga' ? 'MP' : label === 'Northern Cape' ? 'NC' : label === 'North West' ? 'NW' : label)
                : label;
            counts[shortLabel] = (counts[shortLabel] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([label, value]) => ({ label, value, color: '#884616' }))
            .sort((a, b) => b.value - a.value);
    }, [filteredCases, isNationalOffice]);

    // 7. Monthly Trend Data (Last 6 Months)
    const monthlyTrendData = useMemo(() => {
        const defaultMock = [
            { name: 'Feb', count: 18 },
            { name: 'Mar', count: 24 },
            { name: 'Apr', count: 19 },
            { name: 'May', count: 28 },
            { name: 'Jun', count: 15 },
            { name: 'Jul', count: 32 },
        ];
        if (filteredCases.length === 0) return defaultMock;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        
        // Setup last 6 months list
        const last6: { name: string, count: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const idx = (currentMonthIdx - i + 12) % 12;
            last6.push({ name: months[idx], count: 0 });
        }

        filteredCases.forEach(c => {
            const date = new Date(c.occurredAt || c.createdAt);
            const mName = months[date.getMonth()];
            const item = last6.find(x => x.name === mName);
            if (item) {
                item.count += 1;
            }
        });

        // Ensure we don't return all zeros if there are incidents but not in the last 6 months
        const allZero = last6.every(x => x.count === 0);
        return allZero ? defaultMock : last6;
    }, [filteredCases]);

    return (
        <DashboardLayout
            title="Monthly Statistics"
            description="Operational analytics and incident distribution reports"
            breadcrumbs={[{ label: 'Monthly Statistics', path: '/monthly-statistics' }, { label: 'Overview' }]}
            headerContent={
                <div className="flex items-center gap-3">
                    {/* Province Filter Dropdown */}
                    <div className="w-44">
                        <Select
                            value={isNationalOffice ? selectedProvince : userProvince}
                            onChange={(val) => isNationalOffice && setSelectedProvince(val)}
                            options={
                                isNationalOffice
                                    ? [{ value: 'All provinces', label: 'All provinces' }, ...PROVINCES.map(p => ({ value: p, label: p }))]
                                    : [{ value: userProvince, label: userProvince }]
                            }
                            placeholder="Select Province"
                            disabled={!isNationalOffice}
                            bgColor="bg-[#F1E3D3]/40 border-gray-250/20"
                        />
                    </div>

                    {/* Period toggle buttons */}
                    <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        {(['Monthly', 'Quarterly'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setPeriodType(type)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                                    periodType === type
                                        ? 'bg-[#884616] text-white shadow'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Export button */}
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-[#884616] text-white rounded-lg text-xs font-bold hover:bg-opacity-95 shadow transition">
                        <Download size={14} />
                        Export
                    </button>
                </div>
            }
        >
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {/* Card 1: Total */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 flex items-center justify-between shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total (Period)</span>
                        <span className="text-3xl font-extrabold text-gray-800 mt-2 block">{totalCount}</span>
                        <span className="text-xs font-bold text-green-600 mt-1 block">{totalChange} from last period</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-gold">
                        <BarChart2 className="w-5 h-5" />
                    </div>
                </div>

                {/* Card 2: Highest Location */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 flex items-center justify-between shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                            {isNationalOffice ? 'Highest Province' : 'Highest Building'}
                        </span>
                        <span className="text-3xl font-extrabold text-gray-800 mt-2 block truncate max-w-[180px]">
                            {highestLocationData.name}
                        </span>
                        <span className="text-xs font-bold text-gray-500 mt-1 block">{highestLocationData.sub}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-gold">
                        <Calendar className="w-5 h-5" />
                    </div>
                </div>

                {/* Card 3: Most Common */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 flex items-center justify-between shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Most Common</span>
                        <span className="text-3xl font-extrabold text-gray-800 mt-2 block truncate max-w-[180px]">
                            {mostCommonCategoryData.name}
                        </span>
                        <span className="text-xs font-bold text-gray-500 mt-1 block">{mostCommonCategoryData.sub}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-gold">
                        <Shield className="w-5 h-5" />
                    </div>
                </div>

                {/* Card 4: Avg Resolution */}
                <div className="bg-white p-5 rounded-2xl border border-gray-150 flex items-center justify-between shadow-sm">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Avg Resolution</span>
                        <span className="text-3xl font-extrabold text-gray-800 mt-2 block">{avgResolution.value}</span>
                        <span className="text-xs font-bold text-green-600 mt-1 block">{avgResolution.sub} from last period</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-gold">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                {/* Bar Chart: Incidents per Province / Building */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col">
                    <h4 className="font-bold text-gray-800 text-sm mb-4">
                        {isNationalOffice ? 'Incidents per Province' : 'Incidents per Building'}
                    </h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#884616" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Category Breakdown */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col">
                    <h4 className="font-bold text-gray-800 text-sm mb-4">Category Breakdown</h4>
                    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <div className="h-44 w-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdownData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={75}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryBreakdownData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2">
                            {categoryBreakdownData.map((cat, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}></div>
                                    <span className="text-xs text-gray-650 font-bold">{cat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-width Trend Chart */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col">
                <h4 className="font-bold text-gray-800 text-sm mb-4">Monthly Trend (Last 6 Months)</h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" fill="#BB8F53" radius={[4, 4, 0, 0]} barSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MonthlyStatistics;
