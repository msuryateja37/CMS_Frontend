import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Plus,
    Target,
    ListTodo,
    CheckCircle2,
    Clock,
    Search,
    ChevronDown,
    TriangleAlert
} from 'lucide-react';
import clsx from 'clsx';
// import { DataTable, type Column } from '../../components/common/DataTable';
import { Pill } from '../../components/common/Pill';

// --- MOCK DATA ---
const ACTIONS = [
    {
        id: 'ACT-2024-045',
        title: 'Install additional fire extinguishers - Floor 5',
        description: 'Procure and install 6 ABC fire extinguishers on Floor 5 to meet compliance requirements',
        category: 'Audit finding',
        priority: 'High',
        status: 'In progress',
        owner: 'David Botha',
        department: 'Facilities',
        dueDate: '2024-02-15',
        progress: 60,
        refId: 'AUD-2024-003'
    },
    {
        id: 'ACT-2024-046',
        title: 'Chemical storage cabinet replacement',
        description: 'Install additional fire extinguishers - Floor 5',
        category: 'Risk Assessment',
        priority: 'High',
        status: 'In progress',
        owner: 'David Botha',
        department: 'Facilities',
        dueDate: '2024-02-15',
        progress: 60,
        refId: 'AUD-2024-003'
    },
    {
        id: 'ACT-2024-047',
        title: 'Install additional fire extinguishers - Floor 5',
        description: 'Procure and install 6 ABC fire extinguishers on Floor 5 to meet compliance requirements',
        category: 'Inspection',
        priority: 'High',
        status: 'In progress',
        owner: 'David Botha',
        department: 'Facilities',
        dueDate: '2024-02-15',
        progress: 60,
        refId: 'AUD-2024-003'
    },
    {
        id: 'ACT-2024-048',
        title: 'Install additional fire extinguishers - Floor 5',
        description: 'Procure and install 6 ABC fire extinguishers on Floor 5 to meet compliance requirements',
        category: 'Audit finding',
        priority: 'High',
        status: 'Completed',
        owner: 'David Botha',
        department: 'Facilities',
        dueDate: '2024-02-15',
        progress: 100,
        refId: 'AUD-2024-003'
    },
    {
        id: 'ACT-2024-049',
        title: 'Install additional fire extinguishers - Floor 5',
        description: 'Procure and install 6 ABC fire extinguishers on Floor 5 to meet compliance requirements',
        category: 'Audit finding',
        priority: 'High',
        status: 'In progress',
        owner: 'David Botha',
        department: 'Facilities',
        dueDate: '2024-02-15',
        progress: 60,
        refId: 'AUD-2024-003'
    },
    {
        id: 'ACT-2024-050',
        title: 'Install additional fire extinguishers - Floor 5',
        description: 'Procure and install 6 ABC fire extinguishers on Floor 5 to meet compliance requirements',
        category: 'PDCA',
        priority: 'Medium',
        status: 'Not Started',
        owner: 'David Botha',
        department: 'Facilities',
        dueDate: '2024-02-15',
        progress: 60,
        refId: 'AUD-2024-003'
    }
];

const ActionPlans: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const filteredActions = ACTIONS.filter(action =>
        (action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'All Status' || action.status === statusFilter)
    );

    const actionButton = {
        label: 'Quick Report',
        onClick: () => console.log('Quick Report'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="Action Plans"
            description="Track corrective and preventive actions"
            actionButton={actionButton}
        >
            <div className="space-y-6 animate-fadeIn pb-10">
                {/* Header Action Row */}
                <div className="flex justify-end -mt-8 relative z-10">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1B312E] text-white rounded-[8px] text-sm font-bold hover:bg-[#2a4a46] transition-all">
                        <Plus size={18} /> New Action
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[
                        { label: 'Total Actions', value: '12', icon: ListTodo, color: 'bg-[#E4F2D3]' },
                        { label: 'Completed', value: '18', icon: CheckCircle2, color: 'bg-white' },
                        { label: 'In Progress', value: '8', icon: Target, color: 'bg-white' },
                        { label: 'Not Started', value: '6', icon: TriangleAlert, color: 'bg-white' },
                        { label: 'Overdue', value: '10', icon: Clock, color: 'bg-white' },
                    ].map((stat, idx) => (
                        <div key={idx} className={clsx("p-6 rounded-[24px] shadow-sm border border-gray-100 group transition-all relative overflow-hidden h-[125px] flex flex-col justify-between", stat.color)}>
                            <div className="flex justify-between items-start">
                                <div className="text-[14px] font-bold text-gray-500/80 flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-white/60">
                                        <stat.icon size={16} className="text-[#1D312E]" />
                                    </div>
                                    {stat.label}
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="text-[44px] font-bold text-[#1D312E] leading-none tracking-tight">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Overall Completion Section */}
                <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[17px] font-bold text-[#1D312E]">Overall Completion</h3>
                        <span className="text-[17px] font-bold text-[#1D312E]">60%</span>
                    </div>
                    <div className="w-full h-3 bg-[#F0F4F8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1B312E] rounded-full shadow-sm" style={{ width: '60%' }}></div>
                    </div>
                </div>

                {/* Card-based List Implementation */}
                <div className="space-y-6">
                    {/* Search & Filter Bar */}
                    <div className="bg-white/50 p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search invoices by ID, vendor, or description ..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-[16px] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1B312E]/10 transition-all shadow-sm placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full md:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3.5 bg-[#E4F2D3] border border-[#E4F2D3]/50 rounded-[12px] text-[13px] font-bold text-[#1D312E] focus:outline-none appearance-none cursor-pointer"
                            >
                                <option>All Status</option>
                                <option>In progress</option>
                                <option>Completed</option>
                                <option>Not Started</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1D312E] pointer-events-none" />
                        </div>
                    </div>

                    {/* Action Cards List */}
                    <div className="space-y-4">
                        {filteredActions.map((action) => (
                            <div key={action.id} className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-col xl:flex-row gap-12">
                                    {/* Left Content */}
                                    <div className="flex-1 space-y-5">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[17px] font-bold text-[#1D312E]">{action.id}</span>
                                            <Pill label={action.priority} variant={action.priority.toLowerCase()} />
                                            <Pill label={action.status} variant={action.status.toLowerCase()} />
                                            <div className="px-3 py-1 bg-[#F5D0FE] text-[#9333EA] border border-[#F5D0FE] rounded-full text-[10px] font-bold flex items-center justify-center w-fit whitespace-nowrap">
                                                {action.category}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-[16px] font-bold text-[#1D312E] leading-snug">{action.title}</h4>
                                            <p className="text-[14px] text-[#64748B] font-medium leading-relaxed max-w-2xl">
                                                {action.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-[13px] font-bold">
                                            <span className="text-gray-400">Due: <span className="text-[#64748B] ml-1">{action.dueDate}</span></span>
                                            <span className="text-gray-400">{action.owner}{action.department} Due: {action.dueDate}{action.id.replace('ACT', 'AUD')}</span>
                                        </div>
                                    </div>

                                    {/* Right Progress Section */}
                                    <div className="xl:w-1/2 flex flex-col justify-center space-y-5 pt-2 xl:pt-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[17px] font-bold text-[#1D312E]">Progress</span>
                                            <span className="text-[17px] font-bold text-[#1D312E]">{action.progress}%</span>
                                        </div>
                                        <div className="w-full h-3.5 bg-[#F0F4F8] rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className="h-full bg-[#1B312E] rounded-full transition-all duration-700 shadow-sm"
                                                style={{ width: `${action.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ActionPlans;
