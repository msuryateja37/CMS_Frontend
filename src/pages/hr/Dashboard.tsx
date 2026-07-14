import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import { useAuthStore } from '../../store/auth.store';
import { FileText, ClipboardList, CheckCircle, ArrowRight, Eye, Calendar, User, Clock } from 'lucide-react';

const HRDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCases = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const res = await casesService.getCases({
                    take: 200,
                    provinceId: user.province?.id,
                    hrFlow: 'true'
                });
                setCases(res.data ?? []);
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        loadCases();
    }, [user]);

    // Calculate stats based on hrStatus
    const awaitingPickup = cases.filter(c => c.hrStatus === 'HR_UNASSIGNED' || c.hrStatus === 'HR_ASSIGNED').length;
    const awaitingIssue = cases.filter(c => c.hrStatus === 'WCL_ISSUED').length;
    const processed = cases.filter(c => c.hrStatus === 'WCL_PROCESSED').length;

    // Filter cases requiring processing queue (i.e. not closed)
    const queueCases = cases.filter(c => c.hrStatus !== 'CLOSED');

    const getDaysAwaiting = (dateStr?: string) => {
        if (!dateStr) return 0;
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
    };

    return (
        <DashboardLayout
            title="HR Benefits Dashboard"
            description="Manage Workmen's Compensation (WCL) processing and employee injury benefits."
            breadcrumbs={[{ label: 'HR Benefits', path: '/hr/dashboard' }, { label: 'Dashboard' }]}
        >
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Awaiting Pickup/Processing */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <FileText size={22} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Awaiting Processing</span>
                                <h3 className="text-2xl font-black text-gray-900 mt-1">{awaitingPickup}</h3>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 border-t border-gray-50 pt-4 cursor-pointer" onClick={() => navigate('/hr/logged-incidents')}>
                            <span>View details</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Card 2: Awaiting WCL Issue */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                <ClipboardList size={22} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Awaiting WCL Issue</span>
                                <h3 className="text-2xl font-black text-gray-900 mt-1">{awaitingIssue}</h3>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-600 border-t border-gray-50 pt-4 cursor-pointer" onClick={() => navigate('/hr/wcl-records')}>
                            <span>View WCL records</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>

                    {/* Card 3: Processed */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <CheckCircle size={22} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">WCL Processed</span>
                                <h3 className="text-2xl font-black text-gray-900 mt-1">{processed}</h3>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-600 border-t border-gray-50 pt-4 cursor-pointer" onClick={() => navigate('/hr/wcl-records')}>
                            <span>View processed files</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Queue Table */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Cases Requiring WCL Processing Queue</h2>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Log of active, uncompleted Workmen's Compensation claims</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-sm text-gray-400 font-medium">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                            Loading cases queue...
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center text-sm text-red-500 font-medium">{error}</div>
                    ) : queueCases.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-400 font-semibold">
                            <ClipboardList className="mx-auto text-gray-300 mb-3" size={32} />
                            No cases require processing at this time.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Ref #</th>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Incident Date</th>
                                        <th className="px-6 py-4">Referred To</th>
                                        <th className="px-6 py-4">Days Awaiting</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                    {queueCases.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4.5 font-mono text-xs font-bold text-indigo-600">
                                                {c.incidentNumber}
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <User size={12} />
                                                    </div>
                                                    <span>{c.reportedBy?.name || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                    <Calendar size={13} className="text-gray-400" />
                                                    <span>
                                                        {c.occurredAt
                                                            ? new Date(c.occurredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                            : '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-150">
                                                    {c.assignedTo?.name || 'Unassigned OHS'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="flex items-center gap-1 text-gray-900 font-bold">
                                                    <Clock size={13} className="text-gray-400" />
                                                    <span>{getDaysAwaiting(c.occurredAt)} days</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5 text-right">
                                                <button
                                                    onClick={() => navigate(`/hr/cases/${c.id}`)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                >
                                                    <Eye size={12} />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;
