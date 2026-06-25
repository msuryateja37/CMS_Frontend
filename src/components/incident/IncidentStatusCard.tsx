import React from 'react';
import clsx from 'clsx';

interface IncidentStatusCardProps {
    label: string;
    count: string | number;
    sub?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    iconBg: string;
    iconColor: string;
    showBottomBar?: boolean;
    barColor?: string;
    percentage?: string;
}

const IncidentStatusCard: React.FC<IncidentStatusCardProps> = ({ 
    label, 
    count, 
    sub, 
    icon: Icon, 
    iconBg, 
    iconColor,
    showBottomBar = false,
    barColor,
    percentage
}) => (
    <div className={clsx(
        "p-6 rounded-2xl shadow-sm border border-semi-subtle-grey bg-white relative overflow-hidden group hover:shadow-md transition-all duration-300",
        showBottomBar && "pb-8"
    )}>
        <div className="flex items-center gap-3 mb-4">
            <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shadow-sm", iconBg)}>
                <Icon size={20} className={iconColor} />
            </div>
            <span className="text-sm font-medium text-light-grey">{label}</span>
        </div>
        
        <div className="flex flex-col">
            <div className="text-4xl font-bold text-brown mb-1">{count}</div>
            
            {percentage && (
                <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gold">{percentage}</span>
                    <span className="text-xs text-light-grey">from last month</span>
                </div>
            )}
            
            {sub && !percentage && (
                <p className="text-xs text-light-grey font-medium">{sub}</p>
            )}
        </div>

        {showBottomBar && barColor && (
            <div className={clsx("absolute bottom-0 left-0 right-0 h-4", barColor)}></div>
        )}
    </div>
);

export default IncidentStatusCard;
