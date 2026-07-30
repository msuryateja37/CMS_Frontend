import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useExecutiveData } from './useExecutiveData';
import {
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    Zap,
    Gavel,
    MapPin,
    Clock,
    ChevronRight,
} from 'lucide-react';

// ---- Illustrative sample data (fallback when the DB has no incidents) ----
const SAMPLE_TREND = [
    { month: 'Jan', safety: 42, health: 28, environmental: 18, other: 12 },
    { month: 'Feb', safety: 38, health: 24, environmental: 16, other: 10 },
    { month: 'Mar', safety: 55, health: 34, environmental: 22, other: 15 },
    { month: 'Apr', safety: 50, health: 30, environmental: 20, other: 14 },
    { month: 'May', safety: 60, health: 38, environmental: 24, other: 16 },
    { month: 'Jun', safety: 58, health: 36, environmental: 23, other: 18 },
];

const TREND_SERIES = [
    { key: 'safety', label: 'Safety', color: '#884616' },
    { key: 'health', label: 'Health', color: '#A1743E' },
    { key: 'environmental', label: 'Environmental', color: '#D49D51' },
    { key: 'other', label: 'Other', color: '#ECD2AA' },
] as const;

const SAMPLE_ALERTS = [
    { type: 'Infrastructure', title: 'Power Outage — Limpopo Office', time: '2h ago', tone: 'amber' },
    { type: 'Escalation', title: 'Serious IOD — Gauteng (Unresolved)', time: '5h ago', tone: 'red' },
    { type: 'Infrastructure', title: 'Water Outage — North West', time: '1d ago', tone: 'gray' },
    { type: 'Compliance', title: 'Free State — Audit Overdue', time: '2d ago', tone: 'gray' },
];

const PROVINCE_SNAPSHOT = [
    { name: 'Gauteng', pct: 85, incidents: 312 },
    { name: 'Western Cape', pct: 91, incidents: 198 },
    { name: 'KwaZulu-Natal', pct: 74, incidents: 221 },
    { name: 'Free State', pct: 62, incidents: 89 },
    { name: 'Limpopo', pct: 70, incidents: 143 },
];

const alertToneStyle = (tone: string) => {
    switch (tone) {
        case 'red':
            return 'bg-subtle-red border-l-4 border-red';
        case 'amber':
            return 'bg-light-yellow border-l-4 border-yellow';
        default:
            return 'bg-subtle-grey border-l-4 border-gray-200';
    }
};

const alertTypeColor = (tone: string) => {
    switch (tone) {
        case 'red':
            return 'text-red';
        case 'amber':
            return 'text-yellow';
        default:
            return 'text-gray-500';
    }
};

const ChiefDirectorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { hasData: live, metrics, byProvince, trends, criticalAlerts } = useExecutiveData();

    // Live values where the DB has data, else illustrative sample values.
    const kpiTotal = live ? metrics.totalYtd.toLocaleString() : '1,247';
    const kpiOpen = live ? metrics.open.toLocaleString() : '84';
    const kpiEscalated = live ? metrics.escalated.toLocaleString() : '6';
    const kpiCompliance = live ? `${metrics.nationalCompliance}%` : '78%';

    const trendData = live ? trends : SAMPLE_TREND;
    const alerts = live && criticalAlerts.length ? criticalAlerts : SAMPLE_ALERTS;

    const liveSnapshot = [...byProvince]
        .filter((p) => p.incidents > 0)
        .sort((a, b) => b.incidents - a.incidents)
        .slice(0, 5)
        .map((p) => ({ name: p.name, pct: p.pct, incidents: p.incidents }));
    const snapshot = live && liveSnapshot.length ? liveSnapshot : PROVINCE_SNAPSHOT;

    const maxTotal = Math.max(
        1,
        ...trendData.map((d) => d.safety + d.health + d.environmental + d.other),
    );

    return (
        <DashboardLayout
            title="Dashboard"
            description="National OHS executive overview"
            breadcrumbs={[{ label: 'Dashboard', path: '/chief-director/dashboard' }, { label: 'Overview' }]}
        >
            <div className="space-y-6">
                {/* Data source indicator */}
                <div className={`flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-lg w-fit ${live ? 'bg-green-50 text-green-700' : 'bg-light-yellow text-yellow'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500' : 'bg-yellow'}`} />
                    {live ? 'Showing live incident data from the database' : 'Showing sample data — no incidents in the database yet'}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Total Incidents (YTD)</span>
                        <span className="text-3xl font-black text-gray-800 mt-2 block">{kpiTotal}</span>
                        <span className="text-[11px] font-bold text-green-600 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> {live ? 'Recorded this year' : '+12% vs last quarter'}
                        </span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Open Cases</span>
                        <span className="text-3xl font-black text-gray-800 mt-2 block">{kpiOpen}</span>
                        <span className="text-[11px] font-bold text-green-600 mt-2 flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" /> {live ? 'Currently open' : '-8% vs last quarter'}
                        </span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Escalated to DDG</span>
                        <span className="text-3xl font-black text-gray-800 mt-2 block">{kpiEscalated}</span>
                        <span className="text-[11px] font-bold text-orange-500 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> {live ? 'Under director review' : '+2 vs last quarter'}
                        </span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">National Compliance</span>
                        <span className="text-3xl font-black text-gray-800 mt-2 block">{kpiCompliance}</span>
                        <span className="text-[11px] font-bold text-green-600 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> {live ? 'Share of incidents closed' : '+3% vs last quarter'}
                        </span>
                    </div>
                </div>

                {/* Trends + Critical Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* National Incident Trends */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-black text-gray-800">National Incident Trends</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">Monthly incident volume by category · 2026</p>
                            </div>
                            <span className="text-[10px] font-extrabold text-brown bg-light-gold px-2.5 py-1 rounded-full">YTD 2026</span>
                        </div>

                        {/* Stacked bar chart */}
                        <div className="flex items-end justify-between gap-4 h-52 px-2">
                            {trendData.map((d) => {
                                const total = d.safety + d.health + d.environmental + d.other;
                                const heightPct = total > 0 ? (total / maxTotal) * 100 : 0;
                                return (
                                    <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                        <div
                                            className="w-full max-w-[46px] rounded-t-md overflow-hidden flex flex-col-reverse shadow-sm"
                                            style={{ height: `${heightPct}%` }}
                                            title={`${d.month}: ${total} incidents`}
                                        >
                                            {TREND_SERIES.map((s) => (
                                                <div
                                                    key={s.key}
                                                    style={{
                                                        backgroundColor: s.color,
                                                        height: total > 0 ? `${(d[s.key] / total) * 100}%` : '0%',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-400">{d.month}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">
                            {TREND_SERIES.map((s) => (
                                <div key={s.key} className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-[11px] font-semibold text-gray-500">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Critical Alerts */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-gray-800">Critical Alerts</h3>
                            <span className="w-5 h-5 rounded-full bg-brown text-white text-[10px] font-bold flex items-center justify-center">
                                {alerts.length}
                            </span>
                        </div>
                        <div className="space-y-2.5">
                            {alerts.map((a, i) => (
                                <div key={i} className={`p-3 rounded-lg ${alertToneStyle(a.tone)}`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-extrabold uppercase tracking-wide ${alertTypeColor(a.tone)}`}>{a.type}</span>
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {a.time}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700 mt-1 leading-snug">{a.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Province Snapshot + Executive Navigation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Province Snapshot */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-black text-gray-800">Province Snapshot</h3>
                            <button
                                onClick={() => navigate('/chief-director/compliance')}
                                className="text-xs text-brown hover:underline font-bold flex items-center gap-0.5"
                            >
                                View All <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {snapshot.map((p) => (
                                <div key={p.name} className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-gray-600 w-28 shrink-0">{p.name}</span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-gold" style={{ width: `${p.pct}%` }} />
                                    </div>
                                    <span className="text-xs font-black text-gray-700 w-9 text-right">{p.pct}%</span>
                                    <span className="text-[11px] font-medium text-gray-400 w-14 text-right">{p.incidents} inc.</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Executive Navigation */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
                        <h3 className="text-sm font-black text-gray-800 mb-5">Executive Navigation</h3>
                        <div className="space-y-2.5">
                            <ExecNavItem
                                icon={Zap}
                                title="Monitor Infrastructure Incidents"
                                subtitle="Power, water & facility outages"
                                badge="3 active"
                                onClick={() => navigate('/chief-director/infrastructure')}
                            />
                            <ExecNavItem
                                icon={ArrowUpRight}
                                title="Review Escalation Reports"
                                subtitle="Critical incidents pending decision"
                                badge="6 new"
                                onClick={() => navigate('/chief-director/escalations')}
                            />
                            <ExecNavItem
                                icon={Gavel}
                                title="Make Strategic Decisions"
                                subtitle="Approve corrective measures"
                                badge="4 pending"
                                onClick={() => navigate('/chief-director/strategic-decisions')}
                            />
                            <ExecNavItem
                                icon={MapPin}
                                title="Monitor Provincial Compliance"
                                subtitle="9 provinces + National Office"
                                onClick={() => navigate('/chief-director/compliance')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const ExecNavItem: React.FC<{
    icon: React.ElementType;
    title: string;
    subtitle: string;
    badge?: string;
    onClick: () => void;
}> = ({ icon: Icon, title, subtitle, badge, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gold hover:bg-subtle-gold transition-all text-left group"
    >
        <div className="w-9 h-9 rounded-lg bg-light-gold flex items-center justify-center text-brown shrink-0">
            <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 leading-tight">{title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</p>
        </div>
        {badge && (
            <span className="text-[10px] font-extrabold text-brown bg-light-gold px-2 py-0.5 rounded-full shrink-0">{badge}</span>
        )}
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brown shrink-0" />
    </button>
);

export default ChiefDirectorDashboard;
