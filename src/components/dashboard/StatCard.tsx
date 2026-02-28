import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    variant?: 'primary' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, variant = 'default' }) => {
    const isPrimary = variant === 'primary';

    return (
        <div className={clsx(
            "p-6 rounded-2xl relative overflow-hidden transition-all duration-300",
            isPrimary ? "bg-light-green border border-light-green" : "bg-white border border-subtle-grey shadow-sm"
        )}>
            {/* Background Pattern for Primary */}
            {isPrimary && (
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full blur-3xl transform translate-x-10 -translate-y-10 pointer-events-none"></div>
            )}

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                    isPrimary ? "bg-green text-white" : "bg-subtle-green text-green"
                )}>
                    {icon}
                </div>
                <span className={clsx("text-sm font-bold", isPrimary ? "text-dark-green" : "text-light-grey")}>
                    {title}
                </span>
            </div>

            <div className="relative z-10">
                <h3 className={clsx("text-4xl font-bold mb-2", isPrimary ? "text-dark-green" : "text-dark-grey")}>{value}</h3>
                <div className="flex items-center gap-2">
                    <span className={clsx(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        trend === 'up' ? "bg-white text-dark-green border border-green/20" : // For primary mostly
                            trend === 'down' ? "bg-subtle-red text-brand-red" :
                                "bg-subtle-grey text-dark-grey"
                    )}>
                        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '-'} {change}
                    </span>
                    <span className={clsx("text-xs", isPrimary ? "text-dark-green/70" : "text-light-grey")}>from last month</span>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
