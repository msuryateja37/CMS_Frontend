import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { REGIONAL_DISTRIBUTION } from '../../data/mockData';
import { ChevronDown } from 'lucide-react';

const RegionalDistributionChart: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E9ECEF]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1F2937] text-lg">Regional Distribution</h3>
                    <span className="text-xs text-gray-400 font-normal">(Incidents by Province)</span>
                </div>
                <button className="flex items-center gap-2 px-3 py-1 bg-[#F3F4F6] text-gray-600 rounded-lg text-xs font-bold">
                    Last 6 Months <ChevronDown size={14} />
                </button>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200}>
                    <BarChart
                        data={REGIONAL_DISTRIBUTION}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barSize={12}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="label"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                            width={40}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[0, 10, 10, 0]}
                            background={{ fill: '#F3F4F6' }}
                        >
                            {REGIONAL_DISTRIBUTION.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RegionalDistributionChart;
