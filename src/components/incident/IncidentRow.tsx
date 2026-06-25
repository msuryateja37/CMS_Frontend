import React from 'react';
import clsx from 'clsx';

interface IncidentRowProps {
    refId: string;
    title: string;
    type: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
    date: string;
    assigned: string;
    loc: string;
}

const IncidentRow: React.FC<IncidentRowProps> = ({ refId, title, type, severity, status, date, assigned, loc }) => {
    const statusColors: Record<string, string> = {
        'Open': 'bg-brown text-white',
        'Investigating': 'bg-dark-grey text-white',
        'Resolved': 'bg-gold text-white',
        'Closed': 'bg-black text-white',
    };
    
    const severityColors: Record<string, string> = {
        'Critical': 'bg-subtle-red text-brand-red border border-brand-red/20',
        'High': 'bg-[#FFF4E5] text-[#FF9800] border border-[#FF9800]/20',
        'Medium': 'bg-light-yellow text-brand-yellow border border-brand-yellow/20',
        'Low': 'bg-subtle-gold text-gold border border-gold/20',
    };

    return (
        <tr className="hover:bg-subtle-grey transition-all group cursor-pointer border-b border-semi-subtle-grey">
            <td className="px-6 py-5">
                <input type="checkbox" className="w-4 h-4 rounded border-semi-subtle-grey text-gold focus:ring-gold cursor-pointer" />
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-gold"></div>
                    </div>
                    <span className="font-bold text-brown text-sm">{refId}</span>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-brown line-clamp-1">{title}</span>
                    <span className="text-xs text-light-grey mt-0.5">Unknown individual gain access.</span>
                </div>
            </td>
            <td className="px-6 py-5">
                <span className="text-sm text-dark-grey font-medium">{type}</span>
            </td>
            <td className="px-6 py-5">
                <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block", severityColors[severity])}>
                    {severity}
                </span>
            </td>
            <td className="px-6 py-5">
                <span className={clsx("px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm inline-block", statusColors[status])}>
                    {status === 'Investigating' ? 'Investigating' : status}
                </span>
            </td>
            <td className="px-6 py-5">
                <span className="text-sm text-dark-grey font-medium">{date}</span>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-semi-subtle-grey flex items-center justify-center text-xs font-bold text-brown shadow-sm">
                        {assigned[0]}
                    </div>
                    <span className="text-sm text-dark-grey font-bold">{assigned}</span>
                </div>
            </td>
            <td className="px-6 py-5">
                <span className="text-sm text-light-grey font-medium">{loc}</span>
            </td>
        </tr>
    );
};

export default IncidentRow;
