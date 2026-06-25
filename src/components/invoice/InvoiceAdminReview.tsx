import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill } from '../common/Pill';
import Modal from '../common/Modal';
import {
    ArrowLeft, FileText, CheckCircle, XCircle,
    Building2, Landmark, ShieldCheck, Zap, Droplets, Wrench, Trash2
} from 'lucide-react';
import type { InvoiceRecord } from '../../data/invoiceMockData';

interface InvoiceAdminReviewProps {
    invoice: InvoiceRecord;
}

const InvoiceAdminReview: React.FC<InvoiceAdminReviewProps> = ({ invoice }) => {
    const navigate = useNavigate();
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const utilityIcons: Record<string, React.ElementType> = {
        'Electricity': Zap,
        'Water': Droplets,
        'Sewerage': Wrench,
        'Refuse': Trash2,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/invoice-management')}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brown transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Invoices
                </button>
                <Pill label={invoice.status} variant={invoice.status.toLowerCase()} />
            </div>

            {/* Invoice Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-light-gold rounded-xl flex items-center justify-center">
                            <FileText size={22} className="text-brown" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
                            <p className="text-sm text-gray-500">{invoice.landlordName} • {invoice.billingMonth}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-brown">
                            R {invoice.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left — Invoice Details */}
                <div className="space-y-5">
                    {/* Property & Payee */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Property & Payee Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Property</span>
                                <span className="font-medium text-gray-800 text-right">{invoice.propertyName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Landlord</span>
                                <span className="font-medium text-gray-800">{invoice.landlordName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">VAT Number</span>
                                <span className="font-mono text-gray-800">{invoice.vatNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Bank</span>
                                <span className="font-medium text-gray-800">{invoice.bankName} — {invoice.bankAccount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Payment Method</span>
                                <span className="font-medium text-gray-800">{invoice.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Submitted By</span>
                                <span className="font-medium text-gray-800">{invoice.submittedBy}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Submitted Date</span>
                                <span className="font-medium text-gray-800">
                                    {new Date(invoice.submittedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-gold" />
                            <span className="text-xs font-bold text-gold">Verified Entity</span>
                        </div>
                    </div>

                    {/* Checklist Status */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Verification Checklist</h3>
                        <div className="space-y-3">
                            {invoice.checklist.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    {item.checked ? (
                                        <div className="w-5 h-5 bg-brown rounded flex items-center justify-center flex-shrink-0">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded flex-shrink-0" />
                                    )}
                                    <span className="text-sm text-gray-700">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — Utility Breakdown + Totals */}
                <div className="space-y-5">
                    {/* Utility Breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Utility Breakdown</h3>
                        <div className="space-y-3">
                            {invoice.utilities.map((util, idx) => {
                                const Icon = utilityIcons[util.category] || FileText;
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-subtle-grey rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-light-gold rounded-lg flex items-center justify-center">
                                                <Icon size={14} className="text-brown" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-800">{util.category}</span>
                                                <p className="text-xs text-gray-400 font-mono">{util.meterNo}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">
                                            R {util.lineTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                );
                            })}
                            {/* Refuse line */}
                            <div className="flex items-center justify-between p-3 bg-subtle-grey rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-light-gold rounded-lg flex items-center justify-center">
                                        <Trash2 size={14} className="text-brown" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-800">Refuse</span>
                                        <p className="text-xs text-gray-400">
                                            {invoice.refuse.approved ? 'Approved' : 'Capped'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-800">
                                    R {invoice.refuse.cappedAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-brown rounded-2xl p-6 text-white">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-white/70">Excl. VAT</span>
                                <span className="text-sm font-semibold">
                                    R {invoice.totalExclVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-white/70">VAT (15%)</span>
                                <span className="text-sm font-semibold">
                                    R {invoice.totalVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-white/20 flex justify-between items-end">
                                <span className="text-sm text-white/70">Total Amount</span>
                                <span className="text-2xl font-bold">
                                    R {invoice.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red/10 text-red text-sm font-bold rounded-xl hover:bg-red/20 transition-colors border border-red/20"
                        >
                            <XCircle size={18} />
                            Reject
                        </button>
                        <button
                            onClick={() => setShowApproveModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-brown text-white text-sm font-bold rounded-xl hover:bg-brown/90 transition-all shadow-sm"
                        >
                            <CheckCircle size={18} />
                            Approve
                        </button>
                    </div>
                </div>
            </div>

            {/* Approve Modal */}
            <Modal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                title="Approve Invoice"
                footer={
                    <>
                        <button
                            onClick={() => setShowApproveModal(false)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { setShowApproveModal(false); navigate('/admin/invoice-management'); }}
                            className="px-5 py-2.5 bg-brown text-white text-sm font-bold rounded-xl hover:bg-brown/90 transition-all"
                        >
                            Confirm Approval
                        </button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-gold" />
                    </div>
                    <p className="text-sm text-gray-700">
                        You are about to approve invoice <span className="font-bold">#{invoice.invoiceNumber}</span> for
                        <span className="font-bold"> R {invoice.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">This action will forward the invoice for payment processing.</p>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Reject Invoice"
                footer={
                    <>
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { setShowRejectModal(false); navigate('/admin/invoice-management'); }}
                            className="px-5 py-2.5 bg-red text-white text-sm font-bold rounded-xl hover:bg-red/90 transition-all"
                        >
                            Confirm Rejection
                        </button>
                    </>
                }
            >
                <div className="py-2">
                    <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle size={32} className="text-red" />
                    </div>
                    <p className="text-sm text-gray-700 text-center mb-4">
                        Please provide a reason for rejecting invoice <span className="font-bold">#{invoice.invoiceNumber}</span>.
                    </p>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        rows={3}
                        className="w-full px-4 py-3 bg-subtle-grey border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red resize-none"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default InvoiceAdminReview;
