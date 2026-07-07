import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { type EmployeeCase } from '../../services/employeeService';
import { useMyCases } from '../../hooks/useEmployee';
import { Search, AlertCircle, ArrowLeft } from 'lucide-react';
import { getStatusLabel } from '../../data/constants';

const MyCases: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Fetch all cases to allow thorough local search/filtering
    const { data: casesData, isLoading, error: queryError } = useMyCases({
        take: 100,
        skip: 0
    });

    const cases = casesData?.data || [];
    const error = queryError ? (queryError as { message?: string }).message : null;

    // Normalize category keys to match DB categories
    const getCategoryLabel = (category: string) => {
        if (!category) return 'Other';
        const cat = category.toLowerCase();
        if (cat === 'health') return 'Health';
        if (cat === 'safety') return 'Safety';
        if (cat === 'environmental') return 'Environmental';
        if (cat === 'mva' || cat === 'motor_vehicle' || cat === 'motor vehicle') return 'MVA';
        return 'Other';
    };

    // Filter logic
    const filteredCases = cases.filter((c: EmployeeCase) => {
        // Status filter
        if (statusFilter !== 'all') {
            const normalizedStatus = c.status.toLowerCase();
            const normalizedFilter = statusFilter.toLowerCase();
            if (normalizedFilter === 'submitted' && normalizedStatus !== 'submitted') return false;
            if (normalizedFilter === 'in progress' && normalizedStatus !== 'in_progress' && normalizedStatus !== 'assigned') return false;
            if (normalizedFilter === 'under investigation' && normalizedStatus !== 'under_investigation') return false;
            if (normalizedFilter === 'referred' && normalizedStatus !== 'referred') return false;
            if (normalizedFilter === 'escalated' && normalizedStatus !== 'escalated' && normalizedStatus !== 'escalated_to_admin') return false;
            if (normalizedFilter === 'closed' && normalizedStatus !== 'closed' && normalizedStatus !== 'completed') return false;
        }

        // Category filter
        if (categoryFilter !== 'all') {
            const catLabel = getCategoryLabel(c.category).toLowerCase();
            if (catLabel !== categoryFilter.toLowerCase()) return false;
        }

        // Search text
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            const refMatches = c.incidentNumber.toLowerCase().includes(term);
            const employeeMatches = (c.reportedBy?.fullName || c.reportedBy?.name || 'John Doe').toLowerCase().includes(term);
            const officeMatches = (c.building?.name || 'Pretoria Head Office').toLowerCase().includes(term);
            const provMatches = (c.building?.province?.name || 'Gauteng').toLowerCase().includes(term);
            const descMatches = (c.description || '').toLowerCase().includes(term);

            if (!refMatches && !employeeMatches && !officeMatches && !provMatches && !descMatches) {
                return false;
            }
        }

        return true;
    });

    if (error && !cases.length) {
        return (
            <DashboardLayout title="OHS Incident Management">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-sm p-5 bg-white border border-gray-150 rounded-2xl shadow-sm">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-xs font-bold text-gray-800 mb-1">Failed to load incidents</p>
                        <p className="text-[11px] text-gray-400 mb-4">{error}</p>
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
            <div className="space-y-6 max-w-[1400px] mx-auto">
                {/* Header section */}
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => navigate('/employee/dashboard')}
                        className="p-2 -ml-2 hover:bg-gray-200 hover:text-gray-950 rounded-xl text-gray-400 active:scale-95 transition-all duration-200 shrink-0 mt-0.5 focus:outline-none"
                        title="Back to Dashboard"
                        aria-label="Back to Dashboard"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Incidents</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isLoading ? 'Loading incidents...' : `${filteredCases.length} of ${cases.length} incidents`}
                        </p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3 border border-gray-100 shadow-sm">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search ref, employee, office..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50/50 border border-gray-200 outline-none focus:border-[#884616] text-xs font-semibold placeholder:text-gray-400 placeholder:font-medium transition"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-44 shrink-0">
                            <select
                                title="Filter incidents by status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 rounded-xl bg-gray-50/50 border border-gray-200 text-xs font-semibold text-gray-700 outline-none focus:border-[#884616] transition appearance-none cursor-pointer"
                            >
                                <option value="all">All statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="in progress">In progress</option>
                                <option value="under investigation">Under investigation</option>
                                <option value="referred">Referred</option>
                                <option value="escalated">Escalated</option>
                                <option value="closed">Closed</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative w-full md:w-44 shrink-0">
                            <select
                                title="Filter incidents by category"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 rounded-xl bg-gray-50/50 border border-gray-200 text-xs font-semibold text-gray-700 outline-none focus:border-[#884616] transition appearance-none cursor-pointer"
                            >
                                <option value="all">All categories</option>
                                <option value="safety">Safety</option>
                                <option value="environmental">Environmental</option>
                                <option value="health">Health</option>
                                <option value="mva">MVA</option>
                                <option value="other">Other</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Ref #</th>
                                    <th className="py-3.5 px-5">Date</th>
                                    <th className="py-3.5 px-5">Employee</th>
                                    <th className="py-3.5 px-5">Category</th>
                                    <th className="py-3.5 px-5">Province / Office</th>
                                    <th className="py-3.5 px-5">Status</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-xs">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="w-6 h-6 border-2 border-t-transparent border-[#884616] rounded-full animate-spin" />
                                                <span className="text-gray-400 text-xs font-semibold">Loading incidents...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCases.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                        <td className="py-3.5 px-5 font-mono font-bold text-gray-700">{item.incidentNumber}</td>
                                        <td className="py-3.5 px-5 text-gray-500 whitespace-nowrap">
                                            {item.occurredAt
                                                ? new Date(item.occurredAt).toLocaleDateString('en-GB', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                      year: 'numeric'
                                                  })
                                                : 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-5 font-semibold text-gray-800">
                                            {item.reportedBy?.fullName || item.reportedBy?.name || 'John Doe'}
                                        </td>
                                        <td className="py-3.5 px-5 font-semibold text-gray-800">{getCategoryLabel(item.category)}</td>
                                        <td className="py-3.5 px-5 text-gray-500">
                                            {(item.building?.province?.name || 'Gauteng')} · {(item.building?.name || 'Pretoria Head Office')}
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                item.status === 'CLOSED' || item.status === 'COMPLETED'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-blue-50 text-blue-700'
                                            }`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-5 text-right">
                                            <button
                                                onClick={() => navigate(`/employee/my-cases/${item.id}`)}
                                                className="text-[#884616] hover:underline font-bold text-xs"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {!isLoading && filteredCases.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-400 text-xs font-semibold">
                                            No incidents found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyCases;
