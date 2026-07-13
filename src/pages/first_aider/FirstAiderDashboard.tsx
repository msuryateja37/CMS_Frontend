import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { type Case } from '../../services/cases.service';
import { useIncidents } from '../../hooks/useIncidents';
import { useAuthStore } from '../../store/auth.store';
import {
    AlertTriangle,
    Eye,
    Loader2,
    Clock,
    CheckCircle2,
    Stethoscope,
    ChevronRight
} from 'lucide-react';
import { formatCategory } from '../../utils/formatters';
import { getStatusLabel } from '../../data/constants';
import casesService from '../../services/cases.service';

const FirstAiderDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Pending Acceptance — POOL cases in same province not yet picked up
    const {
        data: poolData,
        isLoading: loadingPool,
        refetch: refetchPool,
    } = useIncidents({
        status: 'POOL',
        provinceId: user?.province?.id,
        take: 10,
    });

    // Assigned to me — In Progress
    const {
        data: assignedData,
        isLoading: loadingAssigned,
    } = useIncidents({
        assignedToId: user?.id,
        take: 100,
    });

    const poolCases = (poolData?.data || []).filter(c => {
        if (c.annexureOne) return false;
        const cat = c.category?.toLowerCase() || '';
        return cat === 'safety' || cat === 'health';
    });
    const assignedCases = (assignedData?.data || []).filter(c => {
        const cat = c.category?.toLowerCase() || '';
        return cat === 'safety' || cat === 'health';
    });

    const pendingAcceptance = poolCases.length;
    const inProgress = assignedCases.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
    const underReview = assignedCases.filter(c => {
        const s = c.status?.toUpperCase() || '';
        return s !== 'POOL' && s !== 'CLOSED' && s !== 'RESOLVED' && s !== 'COMPLETED';
    }).length;
    const treatedByMe = assignedCases.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length;

    const loading = loadingPool || loadingAssigned;

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleAccept = async (c: Case) => {
        setAcceptingId(c.id);
        try {
            await casesService.pickupCase(c.id);
            showSuccess('Incident accepted and assigned to you.');
            refetchPool?.();
        } catch {
            // silently fail
        } finally {
            setAcceptingId(null);
        }
    };

    const getSeverityStyle = (severity?: string) => {
        if (!severity) return { border: 'border-gray-200', bg: 'bg-white' };
        const s = severity.toLowerCase();
        if (s === 'critical') return { border: 'border-red-300', bg: 'bg-red-50/50' };
        if (s === 'high') return { border: 'border-orange-300', bg: 'bg-orange-50/30' };
        return { border: 'border-gray-200', bg: 'bg-white' };
    };

    const timeSince = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${mins}m ago`;
        return `${mins}m ago`;
    };

    return (
        <DashboardLayout
            title="Dashboard"
            description="First Aid Dashboard"
            breadcrumbs={[{ label: 'Dashboard' }]}
        >
            <div className="flex flex-col gap-6 max-w-4xl">

                {successMsg && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <CheckCircle2 size={16} />
                        {successMsg}
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Pending Acceptance</p>
                        <p className="text-3xl font-bold text-gray-900">{loading ? '...' : pendingAcceptance}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">In Progress</p>
                        <p className="text-3xl font-bold text-gray-900">{loading ? '...' : inProgress}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Under Review</p>
                        <p className="text-3xl font-bold text-gray-900">{loading ? '...' : underReview}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Treated by Me</p>
                        <p className="text-3xl font-bold text-gray-900">{loading ? '...' : treatedByMe}</p>
                    </div>
                </div>

                {/* Pending Acceptance section */}
                <div>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Pending Acceptance</h2>

                    {loadingPool && (
                        <div className="flex items-center gap-2 py-8 justify-center">
                            <Loader2 size={20} className="animate-spin text-gold" />
                            <span className="text-sm text-gray-500">Loading...</span>
                        </div>
                    )}

                    {!loadingPool && poolCases.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                            <CheckCircle2 size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-400 text-sm font-medium">No pending incidents in your province.</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {poolCases.map(c => {
                            const style = getSeverityStyle(c.severity);
                            const isEscalated = c.isEscalated;
                            const hoursOpen = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60));
                            return (
                                <div
                                    key={c.id}
                                    className={`rounded-2xl border ${style.border} ${style.bg} p-4 relative overflow-hidden`}
                                >
                                    {/* Escalation badge */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="font-mono text-sm font-bold text-gray-700">{c.incidentNumber}</span>
                                            <span className="ml-2 text-xs text-gray-400">
                                                Reported by {c.reportedBy?.name || 'Employee'} · {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} {new Date(c.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {isEscalated && (
                                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wide">Escalated</span>
                                        )}
                                    </div>

                                    {/* Escalated time warning */}
                                    {isEscalated && hoursOpen >= 4 && (
                                        <div className="mb-2 flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
                                            <AlertTriangle size={12} className="text-red-500" />
                                            <span className="text-xs font-bold text-red-600">Escalated — over {hoursOpen}h</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</p>
                                            <p className="text-sm font-semibold text-gray-800">{formatCategory(c.category || 'N/A')}</p>
                                        </div>
                                        {c.location && (
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                                <p className="text-sm font-semibold text-gray-800">{c.location}</p>
                                            </div>
                                        )}
                                        {c.description && (
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</p>
                                                <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{c.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={() => handleAccept(c)}
                                            disabled={acceptingId === c.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brown text-white rounded-xl text-xs font-bold hover:bg-opacity-90 transition disabled:opacity-50"
                                        >
                                            {acceptingId === c.id ? <Loader2 size={13} className="animate-spin" /> : null}
                                            Accept Incident
                                        </button>
                                        <button
                                            onClick={() => navigate(`/first-aider/cases/${c.id}`)}
                                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                                        >
                                            Full details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Treatment History */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Treatment History</h2>
                        <button onClick={() => navigate('/first-aider/my-registry')} className="flex items-center gap-1 text-xs font-bold text-brown hover:underline">
                            View All <ChevronRight size={13} />
                        </button>
                    </div>

                    {loadingAssigned && (
                        <div className="flex items-center gap-2 py-6 justify-center">
                            <Loader2 size={18} className="animate-spin text-gold" />
                        </div>
                    )}

                    {!loadingAssigned && assignedCases.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                            <Stethoscope size={28} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-400 text-sm">No treatment history yet.</p>
                        </div>
                    )}

                    {!loadingAssigned && assignedCases.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['Ref #', 'Date', 'Employee', 'Category', 'Office', 'Status', 'Open for', 'Actions'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedCases.slice(0, 8).map(c => {
                                        const isClosed = c.status === 'CLOSED' || c.status === 'RESOLVED';
                                        return (
                                            <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 font-mono font-semibold text-gray-700">{c.incidentNumber}</td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700 font-medium">{c.reportedBy?.name || '—'}</td>
                                                <td className="px-4 py-3 text-gray-700">{formatCategory(c.category || 'N/A')}</td>
                                                <td className="px-4 py-3 text-gray-500">{c.building?.name || '—'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        isClosed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {isClosed ? 'Closed' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-400">—</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => navigate(`/first-aider/cases/${c.id}`)}
                                                        className="text-brown font-bold hover:underline"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FirstAiderDashboard;
