import React from 'react';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

interface CaseItem {
    id: string;
    caseNumber: string;
    type: string;
    priority: string;
    status: string;
    sla: string;
    lastUpdated: string;
}

interface AssignedCasesTableProps {
    cases: CaseItem[];
}

export const AssignedCasesTable: React.FC<AssignedCasesTableProps> = ({ cases }) => {

    const getPriorityStyles = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'bg-[#fee2e2] text-[#991b1b]'; // Pinkish Red
            case 'medium':
                return 'bg-[#dbeafe] text-[#1e40af]'; // Light Blue
            case 'critical':
                return 'bg-[#ffedd5] text-[#9a3412]'; // Orange
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusStyles = (status: string) => {
        if (status === 'Investigation') {
            return 'bg-white border border-gray-200 text-gray-700';
        }
        return 'bg-white border border-gray-200 text-gray-700';
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-[#f9fafb] text-xs uppercase text-gray-400 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-medium"><input type="checkbox" className="rounded border-gray-300" /></th>
                        <th className="px-6 py-4 font-medium cursor-pointer">
                            <div className="flex items-center gap-1">Case ID <ArrowUpDown size={14} /></div>
                        </th>
                        <th className="px-6 py-4 font-medium cursor-pointer">
                            <div className="flex items-center gap-1">Type <ArrowUpDown size={14} /></div>
                        </th>
                        <th className="px-6 py-4 font-medium cursor-pointer">
                            <div className="flex items-center gap-1">Priority <ArrowUpDown size={14} /></div>
                        </th>
                        <th className="px-6 py-4 font-medium cursor-pointer">
                            <div className="flex items-center gap-1">Status <ArrowUpDown size={14} /></div>
                        </th>
                        <th className="px-6 py-4 font-medium cursor-pointer">
                            <div className="flex items-center gap-1">SLA <ArrowUpDown size={14} /></div>
                        </th>
                        <th className="px-6 py-4 font-medium cursor-pointer">
                            <div className="flex items-center gap-1">Last Updated <ArrowUpDown size={14} /></div>
                        </th>
                        <th className="px-6 py-4 font-medium"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {cases.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#A1743E] flex-shrink-0"></div>
                                    <span className="font-medium text-gray-500">{item.caseNumber}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{item.type}</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityStyles(item.priority)}`}>
                                    {item.priority}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(item.status)}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={item.sla === 'At Risk' ? 'text-red-500 font-medium' : 'text-gray-600'}>{item.sla}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{item.lastUpdated}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
