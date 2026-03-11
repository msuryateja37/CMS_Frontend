import React, { useState } from 'react';
import usePagination from '../../hooks/usePagination';
import Pagination from '../../components/common/Pagination';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
    Search,
    Plus,
    ArrowRight,
    User,
    ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { Pill } from '../../components/common/Pill';
import { Select } from '../../components/common/Select';

// --- MOCK DATA ---
const PDCA_PHASES = [
    {
        phase: 'P',
        title: 'Plan',
        description: 'Define objectives & targets',
        bg: 'bg-[#E4F2D3]',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-white/60',
        active: true
    },
    {
        phase: 'D',
        title: 'Do',
        description: 'Implement actions',
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]',
        active: false
    },
    {
        phase: 'C',
        title: 'Check',
        description: 'Monitor & measure',
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]',
        active: false
    },
    {
        phase: 'A',
        title: 'Act',
        description: 'Review & standardize',
        bg: 'bg-white',
        text: 'text-[#0E4D41]',
        iconBg: 'bg-[#F2FDF0]',
        active: false
    }
];

const CYCLES = [
    {
        id: 'PDCA-2024-1240',
        phase: 'Do',
        title: 'Reduce Electrical Incidents by 25%',
        department: 'OHS Team',
        dueDate: '2024-02-15',
        status: 'On Track',
        progress: 60
    },
    {
        id: 'PDCA-2024-1237',
        phase: 'Check',
        title: 'Improve PPE Compliance to 98%',
        department: 'Facilities',
        dueDate: '2024-02-13',
        status: 'On Track',
        progress: 80
    },
    {
        id: 'PDCA-2024-1231',
        phase: 'Act',
        title: 'Reduce Fire Incidents by 70%',
        department: 'OHS Team',
        dueDate: '2024-02-10',
        status: 'Overdue',
        progress: 90
    },
    {
        id: 'PDCA-2024-1229',
        phase: 'Completed',
        title: 'Improve Safety Compliance to 97%',
        department: 'Facilities',
        dueDate: '2024-02-13',
        status: 'Completed',
        progress: 100
    }
];

const PDCAWorkflow: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'PDCA Cycles' | 'Actions Plans'>('PDCA Cycles');

    const STATUS_OPTIONS = [
        { value: '', label: 'All Statuses' },
        { value: 'On Track', label: 'On Track' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Overdue', label: 'Overdue' },
    ];

    const filteredCycles = CYCLES.filter(cycle => {
        const matchesSearch = !searchTerm || (
            cycle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cycle.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = !statusFilter || cycle.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const {
        paginatedData: paginatedCycles,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        setItemsPerPage,
    } = usePagination({
        data: filteredCycles,
        defaultItemsPerPage: 6,
        resetOnChange: [searchTerm, statusFilter, activeTab],
    });

    const actionButton = {
        label: 'Quick Report',
        onClick: () => console.log('Quick Report'),
        icon: Plus
    };

    return (
        <DashboardLayout
            title="PDCA & Action Plans"
            description="Continuous improvement workflow management"
            actionButton={actionButton}
        >
            <div className="space-y-8 animate-fadeIn pb-10">
                {/* PDCA Phases Flow */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {PDCA_PHASES.map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div className={clsx("flex-1 w-full p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all h-32", step.bg)}>
                                <div className="flex flex-col justify-between h-full relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg", step.active ? "bg-white text-[#0E4D41]" : "bg-[#F2FDF0] text-[#0E4D41]")}>
                                            {step.phase}
                                        </div>
                                        <span className="text-xs font-medium text-gray-500">{step.description}</span>
                                    </div>
                                    <h3 className={clsx("text-2xl font-bold", step.text)}>{step.title}</h3>
                                </div>
                                {/* Decorative Background Icon/Shape could go here */}
                            </div>
                            {idx < PDCA_PHASES.length - 1 && (
                                <ArrowRight className="text-gray-300 hidden md:block shrink-0" size={24} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Tabs */}
                <div className="inline-flex p-1 bg-[#E5E6E6] rounded-[20px] border border-gray-150 shadow-sm gap-2">
                    {['PDCA Cycles', 'Actions Plans'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                                activeTab === tab ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search PDCA cycles ..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004D40] focus:border-transparent transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="w-44">
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={STATUS_OPTIONS}
                                placeholder="All Statuses"
                                bgColor="bg-light-green"
                            />
                        </div>
                    </div>
                </div>

                {/* Active PDCA Cycles List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800">Active PDCA Cycles</h3>
                    <div className="space-y-4">
                        {paginatedCycles.map((cycle, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        {/* Header Badges */}
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-800">{cycle.id}</span>
                                            <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-700 rounded text-[10px] font-bold uppercase tracking-wide">
                                                {cycle.phase}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h4 className="text-[#45bfa3] font-bold text-sm">{cycle.title}</h4>

                                        {/* Meta Data */}
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} className="text-gray-400" /> {cycle.department}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-400">Due:</span> {cycle.dueDate}
                                            </div>
                                            <Pill
                                                label={cycle.status}
                                                variant={
                                                    cycle.status === 'On Track' ? 'in progress' :
                                                        cycle.status === 'Overdue' ? 'critical' :
                                                            'resolved'
                                                }
                                            />
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="flex items-center gap-3 max-w-md">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#004D40] rounded-full"
                                                    style={{ width: `${cycle.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{cycle.progress}%</span>
                                        </div>
                                    </div>

                                    {/* Action Chevron */}
                                    <div className="flex items-center justify-end">
                                        <ChevronRight size={20} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                    pageSizeOptions={[
                        { value: '6', label: '6' },
                        { value: '10', label: '10' },
                        { value: '25', label: '25' },
                    ]}
                    className="pt-4"
                />
            </div>
        </DashboardLayout>
    );
};

export default PDCAWorkflow;
