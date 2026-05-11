import React, { useState, useRef } from 'react';
import { CheckSquare, Square, Pen, Lock, Clock } from 'lucide-react';
import type { InvoiceRecord } from '../../data/invoiceMockData';

interface StepSignOffProps {
    invoice: InvoiceRecord;
    onSubmit?: () => void;
    onBack?: () => void;
}

const StepSignOff: React.FC<StepSignOffProps> = ({ invoice, onSubmit, onBack }) => {
    const [checklist, setChecklist] = useState(invoice.checklist.map(c => ({ ...c })));
    const [hasSignature, setHasSignature] = useState(!!invoice.signedBy);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const toggleCheck = (index: number) => {
        setChecklist(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
    };

    const allChecked = checklist.every(c => c.checked);

    // Simple signature pad
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0E4D41';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setHasSignature(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Final Checklist & Sign-off</h2>
            <p className="text-sm text-gray-500">
                Ensure all records are validated before submitting the dossier for departmental audit.
            </p>

            {/* Validation Checklist */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <CheckSquare size={18} className="text-dark-green" />
                    <h3 className="text-sm font-bold text-gray-900">Validation Checklist</h3>
                </div>

                <div className="space-y-3">
                    {checklist.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => toggleCheck(idx)}
                            className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-subtle-grey/50 transition-colors text-left"
                        >
                            {item.checked ? (
                                <div className="w-6 h-6 bg-dark-green rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <Square size={24} className="text-gray-300 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {item.checked ? 'Verified ✓' : 'Pending verification'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Compiled By */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500">Compiled By</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 bg-green rounded-full flex items-center justify-center">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-bold text-green">Completed</span>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{invoice.submittedBy}</p>
                    {invoice.signedBy && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm italic text-dark-green font-medium">{invoice.signedBy}</p>
                            <p className="text-xs text-gray-400 mt-1">Date: {invoice.signedDate}</p>
                        </div>
                    )}
                </div>

                {/* Verified By (Click to Sign) */}
                <div className="bg-white rounded-2xl border-2 border-dashed border-dark-green/30 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500">Verified By</span>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-yellow" />
                            <span className="text-[10px] font-bold text-yellow">Awaiting Verification</span>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">Ms HPD Rigaard</p>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 cursor-crosshair bg-gray-50">
                            <canvas
                                ref={canvasRef}
                                width={200}
                                height={60}
                                className="w-full"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <Pen size={14} className="text-dark-green" />
                                <span className="text-xs font-bold text-dark-green">[ CLICK TO SIGN ]</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approved By (Locked) */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 opacity-60">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500">Approved By</span>
                        <div className="flex items-center gap-1.5">
                            <Lock size={14} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400">Locked</span>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">Mr PM Chuene</p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 italic">Pending Verification</p>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                >
                    ← Back
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!allChecked || !hasSignature}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                        allChecked && hasSignature
                            ? 'bg-dark-green text-white hover:bg-dark-green/90 shadow-lg shadow-dark-green/20'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    Submit to Supervisor
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default StepSignOff;
