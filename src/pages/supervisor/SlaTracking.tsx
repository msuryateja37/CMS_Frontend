import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService from '../../services/cases.service';
import {
    FileText,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ChevronRight,
    FileSearch,
    FilePlus,
    Clock,
    Loader2
} from 'lucide-react';

interface SlaItem {
    id: string;
    incidentId: string;
    incidentNumber: string;
    category: string;
    severity: string;
    status: string;
    isEscalated: boolean;
    assignedTo: { id: string; name: string } | null;
    responseDueAt: string;
    resolutionDueAt: string;
    responseBreached: boolean;
    resolutionBreached: boolean;
    responseHoursLeft: number;
    resolutionHoursLeft: number;
    totalResolutionHours: number;
    progress: number;
    slaStatus: 'breached' | 'warning' | 'on-track';
}

const SlaTracking: React.FC = () => {
    const navigate = useNavigate();
    const [slaData, setSlaData] = useState<SlaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSlaData();
    }, []);

    const fetchSlaData = async () => {
        try {
            setLoading(true);
            const data = await casesService.getSlaTracking();
            setSlaData(data);
        } catch (err) {
            console.error('Error fetching SLA data:', err);
            setError('Failed to load SLA tracking data.');
        } finally {
            setLoading(false);
        }
    };

    const breached = slaData.filter(s => s.slaStatus === 'breached');
    const atRisk = slaData.filter(s => s.slaStatus === 'warning');
    const onTrack = slaData.filter(s => s.slaStatus === 'on-track');

    const complianceRate = slaData.length > 0
        ? Math.round(((onTrack.length) / slaData.length) * 100)
        : 0;

    const renderCaseCard = (item: SlaItem) => {
        const statusColor = item.slaStatus === 'breached' ? 'text-red-600' :
            item.slaStatus === 'warning' ? 'text-amber-600' : 'text-green-600';
        const statusLabel = item.slaStatus === 'breached' ? 'Overdue' :
            item.slaStatus === 'warning' ? 'At Risk' : 'On Track';

        return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-gray-800 font-bold">{item.incidentNumber}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                            {item.category}
                        </span>
                        {item.isEscalated && (
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">
                                Escalated
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm">
                        {item.assignedTo ? `Assigned to ${item.assignedTo.name}` : 'Unassigned'} | {item.severity}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 w-48">
                        <div className="bg-gray-200 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${item.slaStatus === 'breached' ? 'bg-red-500' : item.slaStatus === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, item.progress)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className={`${statusColor} font-bold text-sm`}>{statusLabel}</p>
                        <p className="text-gray-400 text-xs">
                            Due: {new Date(item.resolutionDueAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-gray-300 text-[10px]">
                            {item.resolutionHoursLeft > 0
                                ? `${item.resolutionHoursLeft}h remaining`
                                : `${Math.abs(item.resolutionHoursLeft)}h overdue`}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/supervisor/cases/${item.incidentId}`)}
                        className="flex items-center gap-1 bg-[#E4F2D3] text-[#203430] hover:bg-[#d0e5b8] px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        View Case <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout title="SLA Tracking" description="SLA Tracking" breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "SLA Tracking" }]}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-green animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="SLA Tracking"
            description="SLA Tracking"
            breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "SLA Tracking" }]}
        >
            <div className="flex flex-col gap-6">
                {/* Top Actions */}
                <div className="flex justify-end gap-3 -mt-4 mb-2">
                    <button
                        onClick={() => navigate('/supervisor/cases-review')}
                        className="flex items-center gap-2 px-4 py-2 bg-green text-white font-bold rounded-lg hover:bg-[#2aa88f] transition-colors shadow-sm"
                    >
                        <FileSearch size={18} />
                        Review Cases
                    </button>
                    <button
                        onClick={() => navigate('/supervisor/submit-case')}
                        className="flex items-center gap-2 px-4 py-2 bg-green text-white font-bold rounded-lg hover:bg-[#2aa88f] transition-colors shadow-sm"
                    >
                        <FilePlus size={18} />
                        Submit New Case
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Overall Compliance */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <FileText size={18} className="text-green" />
                                <span className="text-sm font-medium">Overall Compliance</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <h3 className="text-4xl font-bold text-black">{complianceRate}%</h3>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div className="bg-dark-green h-2 rounded-full" style={{ width: `${complianceRate}%` }}></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">{slaData.length} cases tracked</p>
                        </div>
                    </div>

                    {/* Card 2: At Risk */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={18} className="text-amber-500" />
                                <span className="text-sm font-medium">At Risk</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-4xl font-bold text-amber-600">{atRisk.length}</h3>
                            <p className="text-xs text-gray-400">Approaching deadline</p>
                        </div>
                    </div>

                    {/* Card 3: On Track */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <CheckCircle2 size={18} className="text-green" />
                                <span className="text-sm font-medium">On Track</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-4xl font-bold text-green-600">{onTrack.length}</h3>
                            <p className="text-xs text-gray-400">Within SLA targets</p>
                        </div>
                    </div>

                    {/* Card 4: Overdue */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <AlertCircle size={18} className="text-red-500" />
                                <span className="text-sm font-medium">Overdue</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-4xl font-bold text-red-600">{breached.length}</h3>
                            <p className="text-xs text-gray-400">SLA breached</p>
                        </div>
                    </div>
                </div>

                {slaData.length === 0 && !error && (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                        <Clock className="mx-auto text-gray-300 mb-3" size={32} />
                        <p className="text-gray-500 font-medium">No SLA tracking data available.</p>
                        <p className="text-gray-400 text-sm mt-1">SLA tracking starts when cases are created with matching SLA rules.</p>
                    </div>
                )}

                {/* Overdue Cases Section */}
                {breached.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="text-red-500" size={18} />
                            <h3 className="text-red-600 font-bold text-md">Overdue Cases - Immediate Action Required</h3>
                        </div>
                        <div className="space-y-3">
                            {breached.map(renderCaseCard)}
                        </div>
                    </div>
                )}

                {/* At Risk Cases Section */}
                {atRisk.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="text-amber-500" size={18} />
                            <h3 className="text-amber-700 font-bold text-md">At Risk Cases - Approaching Deadline</h3>
                        </div>
                        <div className="space-y-3">
                            {atRisk.map(renderCaseCard)}
                        </div>
                    </div>
                )}

                {/* On Track Cases Section */}
                {onTrack.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="text-green-500" size={18} />
                            <h3 className="text-gray-800 font-bold text-md">On Track Cases</h3>
                        </div>
                        <div className="space-y-3">
                            {onTrack.map(renderCaseCard)}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SlaTracking;
