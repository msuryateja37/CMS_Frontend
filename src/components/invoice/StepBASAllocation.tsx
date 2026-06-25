import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Select } from '../common/Select';
import { BAS_OPTIONS, type InvoiceRecord } from '../../data/invoiceMockData';

interface StepBASAllocationProps {
    invoice: InvoiceRecord;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Electricity': '⚡',
    'Water': '💧',
    'Sewerage': '🔧',
    'Refuse': '🗑️',
};

const StepBASAllocation: React.FC<StepBASAllocationProps> = ({ invoice }) => {
    const allocations = invoice.basAllocations.length > 0
        ? invoice.basAllocations
        : [
            { category: 'Electricity', code: '0101', amount: invoice.utilities[0]?.lineTotal || 0, icon: '⚡', objective: '', responsibility: '', fund: '', asset: '', item: '', infrastructure: '' },
            { category: 'Water', code: '0204', amount: invoice.utilities[1]?.lineTotal || 0, icon: '💧', objective: '', responsibility: '', fund: '', asset: '', item: '', infrastructure: '' },
            { category: 'Sewerage', code: '0311', amount: invoice.utilities[2]?.lineTotal || 0, icon: '🔧', objective: '', responsibility: '', fund: '', asset: '', item: '', infrastructure: '' },
            { category: 'Refuse', code: '0409', amount: invoice.refuse.cappedAmount, icon: '🗑️', objective: '', responsibility: '', fund: '', asset: '', item: '', infrastructure: '' },
        ];

    const allocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    const balance = invoice.totalAmount - allocated;
    const isBalanced = Math.abs(balance) < 0.01;

    const [expandedIndex, setExpandedIndex] = useState<number>(0);

    const toggleExpand = (idx: number) => {
        setExpandedIndex(prev => prev === idx ? -1 : idx);
    };

    return (
        <div className="space-y-6">
            {/* Target / Allocated banner */}
            <div className="bg-brown rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-[10px] font-semibold text-gold/70 uppercase tracking-wider">Target Total</p>
                        <p className="text-xl font-bold text-white">
                            R{invoice.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-gold/70 uppercase tracking-wider">Allocated</p>
                        <p className="text-xl font-bold text-white">
                            R{allocated.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                    isBalanced
                        ? 'bg-gold/20 text-gold'
                        : 'bg-yellow/20 text-yellow'
                }`}>
                    {isBalanced && <CheckCircle size={16} />}
                    Balance: R{Math.abs(balance).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900">BAS Code Allocation Segments</h2>

            {/* Allocation accordions */}
            <div className="space-y-4">
                {allocations.map((alloc, idx) => {
                    const isExpanded = expandedIndex === idx;
                    return (
                        <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            {/* Accordion header */}
                            <button
                                onClick={() => toggleExpand(idx)}
                                className="w-full flex items-center justify-between px-6 py-5 hover:bg-subtle-grey/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{CATEGORY_ICONS[alloc.category] || '📄'}</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {alloc.category} (Code: {alloc.code})
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-brown">
                                        R{alloc.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </span>
                                    {isExpanded
                                        ? <ChevronUp size={18} className="text-gray-500" />
                                        : <ChevronDown size={18} className="text-gray-500" />
                                    }
                                </div>
                            </button>

                            {/* Accordion body */}
                            <div className={`overflow-hidden transition-all duration-300 ${
                                isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Select
                                            label="Objective"
                                            value={alloc.objective}
                                            onChange={() => {}}
                                            options={BAS_OPTIONS.objectives}
                                            placeholder="Select Objective"
                                            disabled={true}
                                        />
                                        <Select
                                            label="Responsibility"
                                            value={alloc.responsibility}
                                            onChange={() => {}}
                                            options={BAS_OPTIONS.responsibilities}
                                            placeholder="Select Responsibility"
                                            disabled={true}
                                        />
                                        <Select
                                            label="Fund"
                                            value={alloc.fund}
                                            onChange={() => {}}
                                            options={BAS_OPTIONS.funds}
                                            placeholder="Select Fund"
                                            disabled={true}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <Select
                                            label="Asset"
                                            value={alloc.asset}
                                            onChange={() => {}}
                                            options={BAS_OPTIONS.assets}
                                            placeholder="Select Asset"
                                            disabled={true}
                                        />
                                        <Select
                                            label="Item"
                                            value={alloc.item}
                                            onChange={() => {}}
                                            options={BAS_OPTIONS.items}
                                            placeholder="Select Item"
                                            disabled={true}
                                        />
                                        <Select
                                            label="Infrastructure"
                                            value={alloc.infrastructure}
                                            onChange={() => {}}
                                            options={BAS_OPTIONS.infrastructures}
                                            placeholder="Select Infrastructure"
                                            disabled={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* System Note */}
            <div className="bg-subtle-grey rounded-xl p-5 flex items-start gap-3">
                <div className="w-5 h-5 bg-brown/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-brown font-bold">i</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">System Note</p>
                    <p className="text-xs text-gray-600 mt-1">
                        These allocations have been pre-populated based on the Property ID associated with this dossier.
                        Please verify all BAS segments before proceeding to sign-off.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StepBASAllocation;
