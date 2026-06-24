import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { InvoiceRecord } from '../../data/invoiceMockData';

interface StepUtilitiesProps {
    invoice: InvoiceRecord;
}

const StepUtilities: React.FC<StepUtilitiesProps> = ({ invoice }) => {
    const refuse = invoice.refuse;
    const isRefuseApproved = refuse.landlordClaimed <= refuse.calculatedShare;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Utility Readings & Calculations</h2>

            {/* Utility Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-subtle-grey border-b border-semi-subtle-grey">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Meter No.</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Consumption</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Excl VAT</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">VAT (15%)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-semi-subtle-grey">
                            {invoice.utilities.map((util, idx) => (
                                <tr key={idx} className="hover:bg-subtle-grey/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{util.category}</td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={util.meterNo}
                                            readOnly
                                            className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono cursor-not-allowed w-36"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{util.period}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{util.consumption}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 text-right font-medium">
                                        R {util.exclVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                                        R {util.vat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                        R {util.lineTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Refuse Pro-Rata and Dossier Total row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Refuse Pro-Rata Calculation */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-800 mb-5">Refuse Pro-Rata Calculation</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Total Council Refuse (Invoice)</span>
                            <span className="text-sm font-bold text-gray-900">
                                R {refuse.councilTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-600">
                                Calculated Share (Lease % / Area)
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                R {refuse.calculatedShare.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-gray-600">Landlord Claimed Amount</span>
                            <span className="text-sm font-bold text-gray-900">
                                R {refuse.landlordClaimed.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Lesser-of-two verdict */}
                    <div className={`mt-5 p-4 rounded-xl flex items-start gap-3 ${
                        isRefuseApproved
                            ? 'bg-gold/5 border border-gold/20'
                            : 'bg-red/5 border border-red/20'
                    }`}>
                        {isRefuseApproved ? (
                            <CheckCircle size={20} className="text-gold flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle size={20} className="text-red flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className={`text-sm font-bold ${isRefuseApproved ? 'text-brown' : 'text-red'}`}>
                                {isRefuseApproved ? 'Lesser-of-Two Verified:' : 'Excess Detected — Amount Capped:'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                {isRefuseApproved ? (
                                    <>
                                        Landlord Claimed Amount (<span className="font-bold">R {refuse.landlordClaimed.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>)
                                        is less than the Council Pro Rata Share limit (<span className="font-bold">R {refuse.calculatedShare.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>).
                                        Claim is <span className="font-bold text-brown">APPROVED</span> to process.
                                    </>
                                ) : (
                                    <>
                                        Landlord Claimed Amount (<span className="font-bold">R {refuse.landlordClaimed.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>)
                                        exceeds the Council Pro Rata Share limit (<span className="font-bold">R {refuse.calculatedShare.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>).
                                        Payment has been <span className="font-bold text-red">CAPPED</span> at R {refuse.cappedAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Consolidated Dossier Total */}
                <div className="bg-brown rounded-2xl p-6 text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-semibold text-gold/80 uppercase tracking-wider mb-4">
                            Consolidated Dossier Total
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-white/70">Excl. VAT</span>
                                <span className="text-sm font-semibold">
                                    R {invoice.totalExclVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-white/70">VAT 15%</span>
                                <span className="text-sm font-semibold">
                                    R {invoice.totalVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/20">
                        <p className="text-xs text-white/60 uppercase">Total Amount</p>
                        <p className="text-3xl font-bold mt-1">
                            <span className="text-lg">R</span> {invoice.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepUtilities;
