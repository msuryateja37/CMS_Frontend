import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import { type EmployeeCase } from '../../services/employeeService';
import { useEmployeeStats, useMyCases } from '../../hooks/useEmployee';
import {
    FileText,
    Clock,
    CheckCircle,
    FilePlus,
    Loader2,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const EmployeeDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const firstName = user?.fullName?.split(' ')[0] || 'User';

    // Use custom hooks for data fetching
    const { data: stats, isLoading: statsLoading, error: statsError } = useEmployeeStats();
    const { data: casesData, isLoading: casesLoading, error: casesError } = useMyCases({ take: 20 });

    // Local state for drafts
    const [drafts, setDrafts] = useState<any[]>([]);

    useEffect(() => {
        const storedDrafts = JSON.parse(localStorage.getItem('incident_drafts') || '[]');
        setDrafts(storedDrafts);
    }, []);

    const loading = statsLoading || casesLoading;
    const error = statsError || casesError;
    const cases = casesData?.data || [];

    const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this draft?')) {
            const updatedDrafts = drafts.filter(d => d.id !== id);
            setDrafts(updatedDrafts);
            localStorage.setItem('incident_drafts', JSON.stringify(updatedDrafts));
        }
    };

    // Calculate metrics locally for perfect sync
    const activeCases = cases.filter(c => c.status !== 'CLOSED' && c.status !== 'COMPLETED').length;
    const closedCases = cases.filter(c => c.status === 'CLOSED' || c.status === 'COMPLETED').length;
    const monthlyCases = cases.filter(c => {
        const date = new Date(c.createdAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    const getOpenForTime = (item: EmployeeCase) => {
        if (item.status === 'CLOSED' || item.status === 'COMPLETED') return '—';
        const diffMs = Date.now() - new Date(item.createdAt).getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d`;
    };

    const getCategoryLabel = (category: string) => {
        if (!category) return 'Other';
        const cat = category.toLowerCase();
        if (cat === 'health') return 'Health';
        if (cat === 'safety') return 'Safety';
        if (cat === 'environmental') return 'Environmental';
        if (cat === 'mva' || cat === 'motor_vehicle' || cat === 'motor vehicle') return 'MVA';
        return 'Other';
    };

    if (loading) {
        return (
            <DashboardLayout title="OHS Incident Management">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-3" />
                        <p className="text-xs text-gray-500 font-semibold">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="OHS Incident Management">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-sm p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-xs font-bold text-gray-800 mb-1">Failed to load dashboard</p>
                        <p className="text-[11px] text-gray-400 mb-4">{(error as any)?.message || 'Unknown network error'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[#884616] text-white text-xs font-bold rounded-lg hover:bg-opacity-95 transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="OHS Incident Management">
            {/* Split Page Layout: Left main column, Right stats & drafts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start max-w-[1400px] mx-auto">
                
                {/* Left Column (Main Actions & Incident List) */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Welcome Header */}
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Welcome back, {firstName}</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Report new incidents and track your existing ones.</p>
                    </div>

                    {/* Report a New Incident Action Card (Green) */}
                    <div className="bg-[#E8F5E9]/60 border border-green-200/50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-[#2E7D32] flex items-center justify-center text-white shrink-0 shadow-inner">
                                <FilePlus size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-[#1B5E20]">Report new case</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Log a safety, health, environmental or other case.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/employee/submit-case')}
                            className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-md hover:-translate-y-0.5 transform"
                        >
                            Start report
                        </button>
                    </div>

                    {/* My Incidents Table Section */}
                    <div className="space-y-3">
                        <div>
                            <h2 className="text-sm font-bold text-gray-800">My incidents</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5">All incidents you have reported.</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="py-3 px-4">Ref #</th>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Category</th>
                                            <th className="py-3 px-4">Office</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Open for</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-xs">
                                        {cases.slice(0, 10).map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                                <td className="py-3 px-4 font-mono font-bold text-gray-700">{item.incidentNumber}</td>
                                                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                                                    {new Date(item.occurredAt).toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-gray-800">{getCategoryLabel(item.category)}</td>
                                                <td className="py-3 px-4 text-gray-500 max-w-[150px] truncate">{item.building?.name || 'N/A'}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                        item.status === 'CLOSED' || item.status === 'COMPLETED'
                                                            ? 'bg-green-50 text-green-700'
                                                            : 'bg-blue-50 text-blue-700'
                                                    }`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-medium text-gray-500">{getOpenForTime(item)}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/employee/my-cases/${item.id}`)}
                                                        className="text-[#884616] hover:underline font-bold text-xs"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {cases.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-gray-400 text-xs font-medium">
                                                    No cases found. Start a report above to submit your first case.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Stats Stack & Drafts) */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Stats Panel Stacked Vertically */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Stats</h2>
                        <div className="grid grid-cols-1 gap-3">
                            
                            {/* MY INCIDENTS (MONTH) */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[90px]">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">My Incidents (Month)</div>
                                <div className="text-2xl font-bold text-gray-900 mt-2">{monthlyCases}</div>
                            </div>

                            {/* OPEN */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[90px]">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Open</div>
                                <div className="text-2xl font-bold text-blue-600 mt-2">{activeCases}</div>
                            </div>

                            {/* CLOSED */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[90px]">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Closed</div>
                                <div className="text-2xl font-bold text-green-600 mt-2">{closedCases}</div>
                            </div>

                        </div>
                    </div>



                </div>
            </div>
        </DashboardLayout>
    );
};

export default EmployeeDashboard;
