import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import { useAuthStore } from '../../store/auth.store';
import { Eye, Calendar, User, Search, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface CaseWithWcl extends Case {
    wclRecord?: {
        wclReference?: string;
        updatedAt?: string;
    };
}

const HRWCLRecords: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [cases, setCases] = useState<CaseWithWcl[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchWclRecords = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await casesService.getCases({
                take: 200,
                provinceId: user.province?.id,
                hrFlow: 'true'
            });
            
            // Map additional Wcl Record properties
            const mappedCases: CaseWithWcl[] = await Promise.all(
                (res.data ?? []).map(async (c) => {
                    try {
                        const wclData = await casesService.getWclRecord(c.id);
                        return { ...c, wclRecord: wclData };
                    } catch {
                        return c;
                    }
                })
            );
            
            // Filter down to records that have started WCL flow (HR_ASSIGNED and onwards)
            setCases(mappedCases.filter(c => c.hrStatus && c.hrStatus !== 'HR_UNASSIGNED'));
        } catch (err) {
            console.error(err);
            setError('Failed to fetch WCL records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWclRecords();
    }, [user]);

    const getHrStatusBadge = (status?: string) => {
        const s = status || 'HR_UNASSIGNED';
        switch (s) {
            case 'HR_ASSIGNED':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Awaiting WCL</span>;
            case 'WCL_ISSUED':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">WCL Sent</span>;
            case 'WCL_PROCESSED':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">WCL Processed</span>;
            case 'CLOSED':
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-150">Closed</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-500">{s}</span>;
        }
    };

    const filteredCases = cases.filter(c => {
        const query = searchQuery.toLowerCase();
        return (
            c.incidentNumber.toLowerCase().includes(query) ||
            (c.reportedBy?.name || '').toLowerCase().includes(query) ||
            (c.wclRecord?.wclReference || '').toLowerCase().includes(query)
        );
    });

    return (
        <DashboardLayout
            title="WCL Records"
            description="Manage and review Workmen's Compensation claims registry."
            breadcrumbs={[{ label: 'HR Benefits', path: '/hr/dashboard' }, { label: 'WCL Records' }]}
        >
            <div className="space-y-6">
                {/* Search Bar & Refresh */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by Incident Ref, Employee, or WCL Reference..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={fetchWclRecords}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all shadow-sm bg-white"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-16 text-center text-sm text-gray-400 font-medium">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                            Loading records...
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center text-sm text-red-500 font-medium">{error}</div>
                    ) : filteredCases.length === 0 ? (
                        <div className="py-16 text-center text-sm text-gray-400 font-semibold">
                            <FileSpreadsheet className="mx-auto text-gray-300 mb-3" size={32} />
                            No Workmen's Compensation records found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Incident Ref #</th>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">WCL Reference</th>
                                        <th className="px-6 py-4">Date Returned</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                    {filteredCases.map((c) => (
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
                                            <td className="px-6 py-4.5 text-xs font-mono font-semibold text-gray-800">
                                                {c.wclRecord?.wclReference || <span className="text-gray-400 italic">Not issued</span>}
                                            </td>
                                            <td className="px-6 py-4.5">
                                                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                    <Calendar size={13} className="text-gray-400" />
                                                    <span>
                                                        {c.wclRecord?.updatedAt && c.hrStatus === 'WCL_PROCESSED'
                                                            ? new Date(c.wclRecord.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                            : '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4.5">
                                                {getHrStatusBadge(c.hrStatus)}
                                            </td>
                                            <td className="px-6 py-4.5 text-right">
                                                <button
                                                    onClick={() => navigate(`/hr/cases/${c.id}`)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold transition-all shadow-sm"
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

export default HRWCLRecords;
