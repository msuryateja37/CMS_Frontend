import React from 'react';
import clsx from 'clsx';
import { CircleCheck } from 'lucide-react';
export type PillVariant =
    | 'critical'
    | 'high'
    | 'medium'
    | 'low'
    | 'resolved'
    | 'investigating'
    // | 'open'
    | 'closed'
    | 'assigned'
    | 'raised'
    | 'escalated'
    | 'in progress'
    | 'not started'
    | 'maintenance due'
    | 'low stock'
    | 'operational'
    | 'pending approval'
    | 'collective action'
    | 'under review'
    | 'granted'
    | 'denied'
    | 'alert'
    | 'paid'
    | 'overdue'
    | 'approved'
    | 'rejected'
    | 'in review'
    | 'supervisor review'
    | 'financial verification'
    | 'director approval'
    | 'compliance check'
    | 'budget allocation'
    | 'scheduled'
    | 'planning'
    | 'planning'
    | 'investigation'
    | 'submitted'
    | 'pending final decision'
    | 'default';

interface PillProps {
    label: string;
    variant?: PillVariant | string; // Allow string for dynamic values that might need normalizing
    className?: string;
}

export const Pill: React.FC<PillProps> = ({ label, variant = 'default', className }) => {

    const getStyles = (type: string) => {
        switch (type.toLowerCase()) {
            // Severity Levels
            case 'critical':
                return 'bg-[#F1594863]/50   text-[#034C3D] border-[#FC9898]';
            case 'high':
                return 'bg-[#F19A48]/50   text-[#034C3D] border-[#FC9898]';
            // Custom "Medium" style based on user request (Yellow BG, Dark Text, Orange Border)
            case 'medium':
                return 'bg-[#FFF07E] text-[#034C3D] border-[#FCB74D]'; // Updated to match image: Light yellow bg, Dark Green text, Orange border
            case 'low':
                return 'bg-[#CDFBE6] text-[#034C3D] border-[#21FC95]';

            // Status Levels (Solid backgrounds from previous implementation)
            case 'resolved':
                return 'bg-[#034C3D] text-[#FFFFFF] border-[#21FC95] ';
            case 'investigating':
                return 'bg-[#002140] text-white border-transparent';
            /*case 'open':
                return 'bg-[#BB8F53] text-white border-transparent';*/
            case 'closed':
                return 'bg-brown/85 text-white border-transparent';
            case 'active':
                return 'bg-[#BB8F53] text-white border-transparent';
            case 'assigned':
                return 'bg-semi-subtle-grey text-black border-[#A4ACAB]';
            case 'escalated':
                return 'bg-red text-white border-[#FECACA]';
            case 'raised':
                return 'bg-gold text-white border-[#B7EB8F]';

            // New Statuses
            case 'in progress':
                return 'bg-[#F19A4863] text-[#034C3D] border-[#FC9898]';
            case 'not started':
                return 'bg-[#F5F5F5] text-[#595959] border-[#D9D9D9]';
            case 'maintenance due':
                return 'bg-[#FFFBE6] text-[#FAAD14] border-[#FFE58F]';
            case 'low stock':
                return 'bg-[#FFF2F0] text-[#FF4D4F] border-[#FFCCC7]';
            case 'operational':
                return 'bg-[#F6FFED] text-[#52C41A] border-[#B7EB8F]';
            case 'pending approval':
                return 'bg-[#FFF07E] text-[#034C3D] border-[#FCB74D]';
            case 'collective action':
                return 'bg-[#E6FFFB] text-[#13C2C2] border-[#87E8DE]';
            case 'under review':
                return 'bg-[#F0F5FF] text-[#2F54EB] border-[#ADC6FF]';
            case 'paid':
                return 'bg-[#BB8F53] text-white border-transparent';
            case 'overdue':
                return 'bg-[#F1594863] text-[#034C3D] border-[#FC9898]';
            case 'approved':
                return 'bg-[#2AA88D] text-white border-transparent';
            case 'rejected':
                return 'bg-[#F15948] text-white border-transparent';
            case 'in review':
                return 'bg-[#F19A4863] text-[#034C3D] border-[#FC9898]';
            //Access Statuses
            case 'granted':
                return 'bg-[#CDFBE6] text-[#333333] border-[#21FC95]';
            case 'denied':
                return 'bg-[#F1E3D3] text-[#333333] border-[#F1E3D3]';
            case 'alert':
                return 'bg-[#F19A4863] text-[#333333] border-[#FF9F0A]';
            case 'completed':
                return 'bg-[#CDFBE6] text-[#333333] border-[#21FC95]';

            //Invoices Stages
            case 'supervisor review':
                return 'bg-[#034C3D] text-[#FFFFFF] border-[#034C3D]';
            case 'financial verification':
                return 'bg-[#034C3D] text-[#FFFFFF] border-[#034C3D]';
            case 'director approval':
                return 'bg-[#034C3D] text-[#FFFFFF] border-[#034C3D]';
            case 'compliance check':
                return 'bg-[#034C3D] text-[#FFFFFF] border-[#034C3D]';
            case 'budget allocation':
                return 'bg-[#034C3D] text-[#FFFFFF] border-[#034C3D]';
            case 'scheduled':
                return 'bg-[#F0F5FF] text-[#2F54EB] border-[#ADC6FF]';
            case 'planning':
                return 'bg-[#FFF07E] text-[#034C3D] border-[#FCB74D]';

            // EA/DA Specific Statuses
            case 'investigation':
                return 'bg-[#E6FFFB] text-[#13C2C2] border-[#87E8DE]';
            case 'submitted':
                return 'bg-[#F6FFED] text-[#52C41A] border-[#B7EB8F]';
            case 'pending final decision':
                return 'bg-[#FFF07E] text-[#034C3D] border-[#FCB74D]';

            // Unified Workflow Statuses
            case 'referred to ohs & hr':
            case 'referred_to_ohs_and_hr':
                return 'bg-purple-100 text-purple-800 border-purple-200 font-bold';
            case 'assigned to ohs':
            case 'assigned_to_ohs':
                return 'bg-teal-100 text-teal-800 border-teal-200 font-bold';
            case 'under facilities coordinator':
            case 'under_facilities_coordinator':
                return 'bg-cyan-100 text-cyan-800 border-cyan-200 font-bold';
            case 'under investigation':
            case 'under_investigation':
                return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
            case 'under pssc recommendation':
            case 'under_pssc_recommendation':
                return 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
            case 'under dep director recommendation':
            case 'under_dep_director_recommendation':
                return 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
            case 'under chief director review':
            case 'chief director approval':
            case 'director_approval':
            case 'director approval':
                return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
            case 'chief director approved':
            case 'approved':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
            case 'case closed':
            case 'closed':
                return 'bg-gray-100 text-gray-700 border-gray-300 font-bold';

            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    return (
        <span className={clsx(
            "px-3 py-1 rounded-full text-[10px] font-bold border flex items-center justify-center gap-1 w-fit whitespace-nowrap",
            getStyles(variant),
            className
        )}>
            {variant.toLowerCase() === 'paid' && <CircleCheck size={10} strokeWidth={3} />}
            {label}
        </span>
    );
};
