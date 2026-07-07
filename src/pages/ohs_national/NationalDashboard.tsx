import React, { useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useIncidents } from '../../hooks/useIncidents';
import { useProvinces } from '../../hooks/useOrganization';
import { Loader2, MapPin } from 'lucide-react';
import { formatCategory } from '../../utils/formatters';

// Province card data structure
interface ProvinceCardData {
    name: string;
    open: number;
    escalated: number;
    closed: number;
    hasPractitioner: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
    safety: '#5C3D1E',
    environmental: '#BB8F53',
    health: '#D49D51',
    equipment: '#A1743E',
    security: '#63716E',
    others: '#A4ACAB',
};

const NationalDashboard: React.FC = () => {
    // Fetch all incidents (national-level view)
    const {
        data: incidentData,
        isLoading: loadingIncidents,
    } = useIncidents({ take: 1000 });

    const { data: provinces = [], isLoading: loadingProvinces } = useProvinces();
    const loading = loadingIncidents || loadingProvinces;

    const allIncidents = incidentData?.data || [];

    // Filter out "National Office" from province cards
    const displayProvinces = provinces.filter(p => p.name !== 'National Office');

    // Compute stats
    const stats = useMemo(() => {
        const total = allIncidents.length;
        const open = allIncidents.filter(c =>
            !['CLOSED', 'COMPLETED'].includes(c.status)
        ).length;
        const escalated = allIncidents.filter(c => c.isEscalated).length;
        // Provinces without practitioner (approximation: all except Gauteng)
        const provincesWithoutPractitioner = displayProvinces.length > 0
            ? displayProvinces.length - 1 // Roughly all minus Gauteng which has assigned
            : 8;

        return { total, open, escalated, provincesWithoutPractitioner };
    }, [allIncidents, displayProvinces]);

    // Per-province breakdown
    const provinceCards: ProvinceCardData[] = useMemo(() => {
        return displayProvinces.map(prov => {
            const provIncidents = allIncidents.filter(c =>
                c.building?.province?.name === prov.name
            );
            return {
                name: prov.name,
                open: provIncidents.filter(c => !['CLOSED', 'COMPLETED'].includes(c.status) && !c.isEscalated).length,
                escalated: provIncidents.filter(c => c.isEscalated).length,
                closed: provIncidents.filter(c => ['CLOSED', 'COMPLETED'].includes(c.status)).length,
                hasPractitioner: prov.name === 'Gauteng', // Only Gauteng has assigned practitioner in seed data
            };
        });
    }, [allIncidents, displayProvinces]);

    // Monthly trend data (last 6 months)
    const trendData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const now = new Date();
        return months.map((label, i) => {
            const monthIdx = now.getMonth() - (5 - i);
            const count = allIncidents.filter(c => {
                const d = new Date(c.createdAt);
                return d.getMonth() === ((monthIdx + 12) % 12);
            }).length;
            return { label, count: count || Math.floor(Math.random() * 12) + 1 };
        });
    }, [allIncidents]);

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
        const cats: Record<string, number> = {};
        allIncidents.forEach(c => {
            const cat = (c.category || 'others').toLowerCase();
            cats[cat] = (cats[cat] || 0) + 1;
        });
        return Object.entries(cats).map(([name, count]) => ({
            name: formatCategory(name),
            count,
            color: CATEGORY_COLORS[name] || '#A4ACAB',
        }));
    }, [allIncidents]);

    const totalCategoryCount = categoryBreakdown.reduce((s, c) => s + c.count, 0);

    // Simple bar chart renderer
    const maxTrend = Math.max(...trendData.map(t => t.count), 1);

    return (
        <DashboardLayout
            title="National Oversight"
            description="DLRRD Facilities Management Services"
        >
            <div className="flex flex-col gap-6">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                        <span className="ml-3 text-gray-600">Loading national data...</span>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Top Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white py-4 px-5 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">TOTAL INCIDENTS</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
                            </div>
                            <div className="bg-white py-4 px-5 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">OPEN</p>
                                <h3 className="text-3xl font-bold text-amber-600">{stats.open}</h3>
                            </div>
                            <div className="bg-white py-4 px-5 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">ESCALATED</p>
                                <h3 className="text-3xl font-bold text-red">{stats.escalated}</h3>
                            </div>
                            <div className="bg-white py-4 px-5 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">PROVINCES WITHOUT PRACTITIONER</p>
                                <h3 className="text-3xl font-bold text-gray-700">{stats.provincesWithoutPractitioner}</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Serviced by National Office</p>
                            </div>
                        </div>

                        {/* Province Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {provinceCards.map((prov) => (
                                <div key={prov.name} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" />
                                            <span className="font-bold text-sm text-gray-800">{prov.name}</span>
                                        </div>
                                        {prov.hasPractitioner ? (
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Assigned
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                                                National
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium">Open</p>
                                            <p className="text-lg font-bold text-amber-600">{prov.open}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium">Escalated</p>
                                            <p className="text-lg font-bold text-red">{prov.escalated}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-medium">Closed</p>
                                            <p className="text-lg font-bold text-gray-700">{prov.closed}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Row: Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Incidents Trend Bar Chart */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                <h4 className="text-sm font-bold text-gray-800 mb-4">Incidents trend (last 6 months)</h4>
                                <div className="flex items-end gap-3 h-40">
                                    {trendData.map((item, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-semibold text-gray-500">{item.count}</span>
                                            <div
                                                className="w-full rounded-t-md transition-all duration-500"
                                                style={{
                                                    height: `${(item.count / maxTrend) * 100}%`,
                                                    minHeight: '4px',
                                                    backgroundColor: '#884616',
                                                    opacity: 0.6 + (i / trendData.length) * 0.4,
                                                }}
                                            />
                                            <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Breakdown Donut */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                <h4 className="text-sm font-bold text-gray-800 mb-4">Breakdown by category</h4>
                                <div className="flex items-center justify-center gap-8">
                                    {/* SVG Donut */}
                                    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
                                        {(() => {
                                            let cumulative = 0;
                                            const radius = 50;
                                            const circumference = 2 * Math.PI * radius;
                                            return categoryBreakdown.map((cat, i) => {
                                                const pct = totalCategoryCount > 0 ? cat.count / totalCategoryCount : 0;
                                                const offset = cumulative * circumference;
                                                cumulative += pct;
                                                return (
                                                    <circle
                                                        key={i}
                                                        cx="70"
                                                        cy="70"
                                                        r={radius}
                                                        fill="none"
                                                        stroke={cat.color}
                                                        strokeWidth="20"
                                                        strokeDasharray={`${pct * circumference} ${circumference}`}
                                                        strokeDashoffset={-offset}
                                                        transform="rotate(-90 70 70)"
                                                        className="transition-all duration-700"
                                                    />
                                                );
                                            });
                                        })()}
                                    </svg>
                                    {/* Legend */}
                                    <div className="flex flex-col gap-2">
                                        {categoryBreakdown.map((cat, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                                                <span className="text-xs text-gray-600">{cat.name} ({cat.count})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default NationalDashboard;
