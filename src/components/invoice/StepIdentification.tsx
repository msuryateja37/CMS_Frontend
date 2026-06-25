import React from 'react';
import { MapPin, Info, Building2, Landmark, ShieldCheck } from 'lucide-react';
import type { InvoiceRecord } from '../../data/invoiceMockData';

interface StepIdentificationProps {
    invoice: InvoiceRecord;
}

const StepIdentification: React.FC<StepIdentificationProps> = ({ invoice }) => {
    return (
        <div className="space-y-6">
            {/* Property Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Search and Select Property
                </label>
                <div className="flex items-center gap-3 p-4 bg-subtle-grey rounded-xl border border-semi-subtle-grey">
                    <MapPin size={20} className="text-brown flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">{invoice.propertyName}</span>
                    <div className="ml-auto">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                </div>
                {/* Property info bar */}
                <div className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-light-gold/50 rounded-lg">
                    <Info size={14} className="text-brown flex-shrink-0" />
                    <span className="text-xs text-brown">
                        Building Size: {invoice.buildingSize.toLocaleString()} M² | Leased Area: {invoice.leasedArea} M² | Department Pro-Rata Share: {invoice.proRataShare}%
                    </span>
                    <span className="ml-auto text-xs font-semibold text-brown underline cursor-pointer">
                        View Lease
                    </span>
                </div>
            </div>

            {/* Invoice Details — Read-only */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Invoice Number */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Invoice Number <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            value={invoice.invoiceNumber}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium cursor-not-allowed"
                        />
                    </div>

                    {/* Invoice Date */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Invoice Date <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            value={new Date(invoice.invoiceDate).toLocaleDateString('en-ZA')}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium cursor-not-allowed"
                        />
                    </div>

                    {/* Billing Month */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Billing Month <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            value={invoice.billingMonth}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium cursor-not-allowed"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Payment Method
                        </label>
                        <div className="flex gap-2">
                            <button
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                                    invoice.paymentMethod === 'EBT'
                                        ? 'bg-brown text-white'
                                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}
                            >
                                EBT
                            </button>
                            <button
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                                    invoice.paymentMethod === 'Manual'
                                        ? 'bg-brown text-white'
                                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}
                            >
                                Manual
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payee & Banking Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-gray-800">Payee & Banking Details</h3>
                    <span className="px-3 py-1 bg-brown text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={12} />
                        Verified Entity
                    </span>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-5 bg-subtle-gold rounded-xl border border-light-gold">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-light-gold rounded-xl flex items-center justify-center">
                            <Building2 size={22} className="text-brown" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{invoice.landlordName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">VAT: {invoice.vatNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                            <Landmark size={20} className="text-gray-600" />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{invoice.bankName}</p>
                            <p className="text-xs text-gray-500">ACCOUNT</p>
                            <p className="text-sm font-bold text-gray-800">{invoice.bankAccount}</p>
                        </div>
                        <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center ml-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepIdentification;
