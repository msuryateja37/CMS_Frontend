import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { Pen, Upload, Image as ImageIcon, X } from 'lucide-react';

interface SignatureInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export const SignatureInput: React.FC<SignatureInputProps> = ({ 
    label, 
    value, 
    onChange,
    placeholder = "Type name to sign electronically"
}) => {
    const { user } = useAuthStore();
    const [showOptions, setShowOptions] = useState(false);
    const [profileSig, setProfileSig] = useState<string | null>(null);
    const [customSig, setCustomSig] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);

    useEffect(() => {
        if (user?.id) {
            const saved = localStorage.getItem(`user_sig_${user.id}`);
            if (saved) {
                setProfileSig(saved);
            }
        }
        
        // Retrieve temporary signatures if they exist for this specific field
        const tempSig = localStorage.getItem(`temp_sig_${label.replace(/\s+/g, '_')}`);
        if (tempSig) {
            setCustomSig(tempSig);
        }
    }, [user?.id, label]);

    const handleProfileSelect = () => {
        if (profileSig) {
            setCustomSig(profileSig);
            localStorage.setItem(`temp_sig_${label.replace(/\s+/g, '_')}`, profileSig);
            onChange(`[Signed: ${user?.fullName || 'Authorized Authority'}]`);
            setShowOptions(false);
        }
    };

    const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setCustomSig(result);
                localStorage.setItem(`temp_sig_${label.replace(/\s+/g, '_')}`, result);
                onChange(`[Signed: ${user?.fullName || 'Authorized Authority'}]`);
                setShowOptions(false);
            };
            reader.readAsDataURL(file);
        }
    };

    // Canvas drawing
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        drawing.current = true;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!drawing.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        drawing.current = false;
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const result = canvas.toDataURL();
        setCustomSig(result);
        localStorage.setItem(`temp_sig_${label.replace(/\s+/g, '_')}`, result);
        onChange(`[Signed: ${user?.fullName || 'Authorized Authority'}]`);
        setIsDrawing(false);
        setShowOptions(false);
    };

    const removeSignature = () => {
        setCustomSig(null);
        setUploadedFileName(null);
        localStorage.removeItem(`temp_sig_${label.replace(/\s+/g, '_')}`);
        onChange('');
    };

    return (
        <div className="space-y-2 relative">
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">{label}</label>
            
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold font-serif italic outline-none focus:border-[#884616]"
                    />
                    {customSig && (
                        <div className="absolute right-2 top-1.5 flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">
                            <span>✓ E-Signed</span>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setShowOptions(!showOptions)}
                    className="px-3 py-2 bg-[#884616] hover:bg-[#723b12] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                    <Pen size={12} />
                    Sign
                </button>
            </div>

            {/* Signature Preview */}
            {customSig && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-lg inline-flex items-center gap-3 relative">
                    <img 
                        src={customSig} 
                        alt="Signature Preview" 
                        className="max-h-12 bg-white border border-gray-150 p-1 rounded" 
                    />
                    <button
                        type="button"
                        onClick={removeSignature}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Sign Options Modal/Dropdown */}
            {showOptions && (
                <div className="absolute right-0 bottom-full mb-2 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl p-3.5 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-xs font-bold text-gray-700">Choose Signature Method</span>
                        <button type="button" onClick={() => { setShowOptions(false); setIsDrawing(false); }} className="text-gray-400 hover:text-gray-650">
                            <X size={14} />
                        </button>
                    </div>

                    {!isDrawing ? (
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={handleProfileSelect}
                                disabled={!profileSig}
                                className={`w-full py-2 px-3 border rounded-lg text-left text-xs font-bold transition flex items-center justify-between ${
                                    profileSig 
                                        ? 'bg-orange-50 border-orange-200 hover:bg-orange-100/50 text-[#884616]' 
                                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <span className="flex items-center gap-1.5">
                                    <ImageIcon size={13} />
                                    Use from Profile
                                </span>
                                {!profileSig && <span className="text-[9px] font-normal text-gray-400">(no signature in profile)</span>}
                            </button>

                            <label className="w-full py-2 px-3 border border-gray-200 rounded-lg text-left text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 text-gray-700">
                                <Upload size={13} />
                                Upload from Device
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleDeviceUpload}
                                    className="hidden"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() => setIsDrawing(true)}
                                className="w-full py-2 px-3 border border-gray-200 rounded-lg text-left text-xs font-bold transition flex items-center gap-1.5 hover:bg-gray-50 text-gray-700"
                            >
                                <Pen size={13} />
                                Draw Signature
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    width={230}
                                    height={100}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full cursor-crosshair bg-white"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsDrawing(false)}
                                    className="px-2 py-1 border border-gray-250 text-gray-600 rounded text-[10px] font-bold"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={saveDrawing}
                                    className="px-2.5 py-1 bg-[#884616] text-white rounded text-[10px] font-bold"
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
