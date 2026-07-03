import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    FileText,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ChevronRight,
    FileSearch,
    FilePlus,
    Clock
} from 'lucide-react';

const OHSSlaTracking: React.FC = () => {
    const navigate = useNavigate();
    return (
        <DashboardLayout
            title="OHS SLA Tracking"
            description="SLA Tracking"
            breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "SLA Tracking" }]}
            userProfile={{ name: 'OHS Practitioner', role: 'OHS Practitioner' }}
        >
            <div className="flex flex-col gap-6">
                {/* Top Actions - Placed here to match visual flow below header */}
                <div className="flex justify-end gap-3 mb-1">
                    <button
                        onClick={() => navigate('/ohs/cases-review')}
                        className="flex items-center gap-2 px-4 py-2 bg-gold text-white font-bold rounded-lg hover:bg-[#A1743E] transition-colors shadow-sm"
                    >
                        <FileSearch size={18} />
                        Review Incidents
                    </button>
                    <button
                        onClick={() => navigate('/ohs/submit-case')}
                        className="flex items-center gap-2 px-4 py-2 bg-gold text-white font-bold rounded-lg hover:bg-[#A1743E] transition-colors shadow-sm"
                    >
                        <FilePlus size={16} />
                        Report New Incident
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Overall Compliance */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <FileText size={18} className="text-gold" />
                                <span className="text-sm font-medium">Overall Compliance</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <h3 className="text-4xl font-bold text-black">60%</h3>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div className="bg-brown h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs mt-1">
                                <span className="px-2 py-0.5 bg-light-gold text-brown font-bold rounded-md">33.3%</span>
                                <span className="text-gray-400">from last month</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: At Risk */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={18} className="text-gold" />
                                <span className="text-sm font-medium">At Risk</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-4xl font-bold text-black">3</h3>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-light-gold text-brown font-bold rounded-md">4.7%</span>
                                <span className="text-gray-400">from last month</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: On Track */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <CheckCircle2 size={18} className="text-gold" />
                                <span className="text-sm font-medium">On Track</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-4xl font-bold text-black">3</h3>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-light-gold text-brownbg-light-gold font-bold rounded-md">50%</span>
                                <span className="text-gray-400">from last month</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Overdue */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <AlertCircle size={18} className="text-red" />
                                <span className="text-sm font-medium">Overdue</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-4xl font-bold text-red">1</h3>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-light-gold text-brown font-bold rounded-md">50%</span>
                                <span className="text-gray-400">from last month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overdue Incidents Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="text-red" size={18} />
                        <h3 className="text-red font-bold text-md">Overdue Incidents – Immediate Action Required</h3>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-gray-800 font-bold">DIS-2024-002</span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded textxs font-bold text-[10px] uppercase tracking-wide border border-gray-200">Disciplinary</span>
                            </div>
                            <p className="text-gray-500 text-sm">Unauthorized system access.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-red font-bold text-sm">Overdue</p>
                                <p className="text-gray-400 text-xs">Due: 2024-01-25</p>
                            </div>
                            <button className="flex items-center gap-1 bg-[#F1E3D3] text-[#000000] hover:bg-[#d0e5b8] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                View Case <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* At Risk Incidents Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-gray-600" size={18} />
                        <h3 className="text-gray-700 font-bold text-md">At Risk Incidents – Approaching Deadline</h3>
                    </div>
                    <div className="space-y-3">
                        {/* Case 1 */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-gray-800 font-bold">GRV-2024-001</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded textxs font-bold text-[10px] uppercase tracking-wide border border-gray-200">Grievance</span>
                                </div>
                                <p className="text-gray-500 text-sm">Unfair treatment by immediate supervisor</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-gray-600 font-bold text-sm">At Risk</p>
                                    <p className="text-gray-400 text-xs">Due: 2024-02-15</p>
                                </div>
                                <button className="flex items-center gap-1 bg-[#F1E3D3] text-[#000000] hover:bg-[#d0e5b8] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    View Case <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Case 2 */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-gray-800 font-bold">DIS-2024-006</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded textxs font-bold text-[10px] uppercase tracking-wide border border-gray-200">Disciplinary</span>
                                </div>
                                <p className="text-gray-500 text-sm">Falsification of expense reports</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-gray-600 font-bold text-sm">At Risk</p>
                                    <p className="text-gray-400 text-xs">Due: 2024-01-27</p>
                                </div>
                                <button className="flex items-center gap-1 bg-[#F1E3D3] text-[#000000] hover:bg-[#d0e5b8] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    View Case <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* On Track Incidents Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-gray-600" size={18} />
                        <h3 className="text-gray-800 font-bold text-md">On Track Incidents</h3>
                    </div>
                    <div className="space-y-3">
                        {/* Case 1 */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-gray-800 font-bold">GRV-2024-003</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded textxs font-bold text-[10px] uppercase tracking-wide border border-gray-200">Grievance</span>
                                </div>
                                <p className="text-gray-500 text-sm">Promotion denial based on gender</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-gray-600 font-bold text-sm">On Track</p>
                                    <p className="text-gray-400 text-xs">Due: 2024-02-15</p>
                                </div>
                                <button className="flex items-center gap-1 bg-[#F1E3D3] text-[#000000] hover:bg-[#d0e5b8] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    View Case <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Case 2 */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-gray-800 font-bold">DIS-2024-004</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded textxs font-bold text-[10px] uppercase tracking-wide border border-gray-200">Disciplinary</span>
                                </div>
                                <p className="text-gray-500 text-sm">Excessive unauthorized absences</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-gray-600 font-bold text-sm">On Track</p>
                                    <p className="text-gray-400 text-xs">Due: 2024-01-27</p>
                                </div>
                                <button className="flex items-center gap-1 bg-[#F1E3D3] text-[#000000] hover:bg-[#d0e5b8] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    View Case <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Case 3 */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-gray-800 font-bold">GRV-2024-005</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded textxs font-bold text-[10px] uppercase tracking-wide border border-gray-200">Grievance</span>
                                </div>
                                <p className="text-gray-500 text-sm">Unsafe work environment complaint</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-gray-600 font-bold text-sm">On Track</p>
                                    <p className="text-gray-400 text-xs">Due: 2024-02-15</p>
                                </div>
                                <button className="flex items-center gap-1 bg-[#F1E3D3] text-[#000000] hover:bg-[#d0e5b8] px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                    View Case <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default OHSSlaTracking;
