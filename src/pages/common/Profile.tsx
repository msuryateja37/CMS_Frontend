import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/auth.store';
import authService from '../../services/auth.service';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Select } from '../../components/common/Select';
import { useProvinces, useDepartments } from '../../hooks/useOrganization';
import {
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    Shield,
    Hash,
    X,
    CheckCircle2,
    Upload,
    Save,
    Trash2
} from 'lucide-react';

const Profile: React.FC = () => {
    const { user, refreshUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [provinceId, setProvinceId] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    // E-Signature States
    const [signatureType, setSignatureType] = useState<'draw' | 'upload'>('draw');
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [canvasEmpty, setCanvasEmpty] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Delegation States
    const [actingPerson, setActingPerson] = useState('');
    const [actingLocation, setActingLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [delegationSuccess, setDelegationSuccess] = useState(false);

    const [delegationStatus, setDelegationStatus] = useState<'none' | 'submitted' | 'approved'>('none');
    const [delegatedName, setDelegatedName] = useState('');
    const [delegatedLocation, setDelegatedLocation] = useState('');
    const [delegatedStart, setDelegatedStart] = useState('');
    const [delegatedEnd, setDelegatedEnd] = useState('');

    // Use hooks for dropdown data
    const { data: provinces = [] } = useProvinces();
    const { data: departments = [] } = useDepartments();

    // Initialize form from user data
    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setPhone(user.phone || '');
            setProvinceId(user.province?.id || '');
            setDepartmentId(user.department?.id || '');
        }
    }, [user]);

    // Initial load of signature and delegation
    useEffect(() => {
        if (user?.id) {
            const savedSig = localStorage.getItem(`user_sig_${user.id}`);
            if (savedSig) {
                setSignatureDataUrl(savedSig);
                if (savedSig.startsWith('data:image/')) {
                    setUploadedFileName('saved_signature.png');
                }
            }

            const savedDel = localStorage.getItem(`user_delegation_${user.id}`);
            if (savedDel) {
                const parsed = JSON.parse(savedDel);
                setDelegatedName(parsed.name || '');
                setDelegatedLocation(parsed.location || '');
                setDelegatedStart(parsed.start || '');
                setDelegatedEnd(parsed.end || '');
                setDelegationStatus(parsed.status || 'none');
            }
        }
    }, [user?.id]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        isDrawing.current = true;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        setCanvasEmpty(false);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawing.current = false;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasEmpty(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setSignatureDataUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveSignature = () => {
        if (signatureType === 'draw') {
            const canvas = canvasRef.current;
            if (!canvas || canvasEmpty) return;
            const dataUrl = canvas.toDataURL();
            localStorage.setItem(`user_sig_${user?.id}`, dataUrl);
            setSignatureDataUrl(dataUrl);
        } else {
            if (signatureDataUrl) {
                localStorage.setItem(`user_sig_${user?.id}`, signatureDataUrl);
            }
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleDelegationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDelegationStatus('submitted');
        
        const delData = {
            name: actingPerson,
            location: actingLocation,
            start: startDate,
            end: endDate,
            status: 'submitted'
        };
        localStorage.setItem(`user_delegation_${user?.id}`, JSON.stringify(delData));

        setTimeout(() => {
            setDelegationStatus('approved');
            setDelegatedName(actingPerson);
            setDelegatedLocation(actingLocation);
            setDelegatedStart(startDate);
            setDelegatedEnd(endDate);
            
            const approvedData = { ...delData, status: 'approved' };
            localStorage.setItem(`user_delegation_${user?.id}`, JSON.stringify(approvedData));
        }, 2500);
    };

    const renderSignatureCard = () => {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-100 flex flex-col items-center text-center gap-4 animate-scaleUp">
                            <div className="w-12 h-12 rounded-full bg-subtle-red flex items-center justify-center text-red shrink-0">
                                <Trash2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Delete Signature</h3>
                                <p className="text-xs text-gray-400 mt-1 font-medium">Are you sure you want to delete your signature?</p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSignatureDataUrl(null);
                                        setUploadedFileName(null);
                                        clearCanvas();
                                        localStorage.removeItem(`user_sig_${user?.id}`);
                                        setShowDeleteModal(false);
                                    }}
                                    className="flex-1 py-2.5 bg-red hover:opacity-90 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">E-Signature</h3>
                </div>

                {saveSuccess && (
                    <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl animate-fadeIn">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-bold">Signature saved successfully</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => { setSignatureType('draw'); clearCanvas(); }}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition text-center ${
                            signatureType === 'draw'
                                ? 'bg-[#884616] text-white border-[#884616] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-50'
                        }`}
                    >
                        Draw Signature
                    </button>
                    <button
                        type="button"
                        onClick={() => setSignatureType('upload')}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition text-center ${
                            signatureType === 'upload'
                                ? 'bg-[#884616] text-white border-[#884616] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-50'
                        }`}
                    >
                        Upload Signature
                    </button>
                </div>

                {signatureType === 'draw' ? (
                    <div className="border border-gray-200 border-dashed rounded-2xl p-4 bg-gray-50/50 flex flex-col items-center gap-2">
                        <canvas
                            ref={canvasRef}
                            width={500}
                            height={150}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full bg-white border border-gray-250 rounded-xl cursor-crosshair max-w-[500px]"
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={clearCanvas}
                                className="px-4 py-1.5 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold transition"
                            >
                                Clear Canvas
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="border border-gray-200 border-dashed rounded-2xl p-6 bg-gray-50/50 flex flex-col items-center justify-center text-center gap-3">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <label className="px-4 py-2 bg-[#884616] hover:bg-[#723b12] text-white font-bold text-xs rounded-lg transition cursor-pointer">
                            Choose Signature File
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                        {uploadedFileName ? (
                            <span className="text-xs text-green-700 font-bold">✓ {uploadedFileName} uploaded</span>
                        ) : (
                            <span className="text-[10px] text-gray-400">PNG, JPG — transparent backgrounds recommended</span>
                        )}
                    </div>
                )}

                {signatureDataUrl && (
                    <div className="flex flex-col items-center p-3 bg-gray-50 border border-gray-150 rounded-xl relative">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Signature Preview</span>
                        <div className="relative">
                            <img src={signatureDataUrl} alt="Signature Preview" className="max-h-20 bg-white p-2 border border-gray-200 rounded-lg" />
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-red text-red hover:bg-subtle-red hover:border-red rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer"
                                title="Delete signature"
                            >
                                <X size={12} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={saveSignature}
                    className="px-5 py-2.5 bg-[#884616] hover:bg-[#723b12] text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                >
                    <Save className="w-4 h-4" />
                    Save Signature
                </button>
            </div>
        );
    };

    const renderDelegationCard = () => {
        const userRole = user?.role?.name?.toLowerCase().replace(/\s+/g, '_');
        if (userRole !== 'pssc_coordinator' && userRole !== 'deputy_director') {
            return null;
        }

        const title = userRole === 'pssc_coordinator' ? 'Acting PSSC Coordinator' : 'Acting Deputy Director';

        if (delegationStatus === 'approved') {
            return (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">{title}</h3>
                        <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            Approved & Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border-b border-gray-50 pb-2 sm:border-0 sm:pb-0">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Full Name</span>
                            <span className="text-sm font-semibold text-gray-700 mt-1 block">{delegatedName}</span>
                        </div>
                        <div className="border-b border-gray-55 pb-2 sm:border-0 sm:pb-0">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Location</span>
                            <span className="text-sm font-semibold text-gray-700 mt-1 block">{delegatedLocation}</span>
                        </div>
                        <div className="border-b border-gray-55 pb-2 sm:border-0 sm:pb-0">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Start Date</span>
                            <span className="text-sm font-semibold text-gray-700 mt-1 block">{delegatedStart}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">End Date</span>
                            <span className="text-sm font-semibold text-gray-700 mt-1 block">{delegatedEnd}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setDelegationStatus('none');
                            localStorage.removeItem(`user_delegation_${user?.id}`);
                        }}
                        className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-750 font-bold text-xs rounded-lg transition"
                    >
                        Revoke Delegation
                    </button>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider border-b border-gray-150 pb-2 mb-4">{title}</h3>
                
                {delegationStatus === 'submitted' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-xs font-bold mb-4 animate-fadeIn">
                        ✓ Delegation request submitted. Awaiting Director approval...
                    </div>
                )}

                <form onSubmit={handleDelegationSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Name of Acting Person</label>
                            <select 
                                value={actingPerson}
                                onChange={(e) => setActingPerson(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] cursor-pointer"
                            >
                                <option value="">Select</option>
                                <option value="John Nkosi">John Nkosi</option>
                                <option value="Sarah Mokae">Sarah Mokae</option>
                                <option value="T. Dlamini">T. Dlamini</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Location</label>
                            <select 
                                value={actingLocation}
                                onChange={(e) => setActingLocation(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] cursor-pointer"
                            >
                                <option value="">Select</option>
                                <option value="Gauteng Office">Gauteng Office</option>
                                <option value="Western Cape Office">Western Cape Office</option>
                                <option value="KwaZulu-Natal Office">KwaZulu-Natal Office</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Start Date of Leave</label>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">End Date of Leave</label>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={delegationStatus === 'submitted'}
                        className="px-4 py-2.5 bg-[#884616] hover:bg-[#723b12] text-white text-xs font-bold rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Submit for Approval to Director
                    </button>
                </form>
            </div>
        );
    };

    const getUserInitials = () => {
        if (!user?.fullName) return 'U';
        const names = user.fullName.split(' ');
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        }
        return names[0].charAt(0).toUpperCase();
    };

    const formatRole = (roleName?: string) => {
        if (!roleName) return 'User';
        return roleName
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (!user) return null;

    const isOHSNational = user.role?.name?.toLowerCase().replace(/\s+/g, '_') === 'ohs_national_office';

    // Simplified read-only profile for OHS National Office
    if (isOHSNational) {
        return (
            <DashboardLayout
                title="Profile"
                description="DLRRD Facilities Management Services"
            >
                <div className="max-w-3xl mx-auto flex flex-col gap-5">
                    {/* Profile Header */}
                    <div className="bg-white rounded-xl border border-gray-100 px-6 py-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-light-gold flex items-center justify-center text-brown font-bold text-xl shrink-0 border-2 border-gold/20">
                            {getUserInitials()}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-800">{user.fullName}</h2>
                            <p className="text-xs text-gray-400 font-medium">{formatRole(user.role?.name)}</p>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-800 mb-5">Account information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            {/* Full name */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Full name</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.fullName || '—'}</div>
                            </div>

                            {/* Employee ID */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Employee ID</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.employeeNumber || '—'}</div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Email</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.email || '—'}</div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Phone</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.phone || '—'}</div>
                            </div>

                            {/* Directorate */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Directorate</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.department?.name || 'Rural Development and Land Reform'}</div>
                            </div>

                            {/* Office */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Office</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.department?.building?.name || user.province?.name || '—'}</div>
                            </div>
                        </div>
                    </div>

                    {renderSignatureCard()}
                    {renderDelegationCard()}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="My Profile"
            description="My Profile"
            breadcrumbs={[{ label: "Dashboard" }, { label: "Profile" }]}
        >
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {/* Success Banner */}
                {success && (
                    <div className="flex items-center gap-3 bg-light-gold border border-gold/20 text-brown px-4 py-3 rounded-xl animate-fadeIn">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-semibold">Profile updated successfully!</span>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center gap-3 bg-subtle-red border border-red/20 text-red px-4 py-3 rounded-xl">
                        <X size={18} />
                        <span className="text-sm font-semibold">{error}</span>
                    </div>
                )}

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Green banner */}
                    <div className="h-28 bg-gradient-to-r from-brown to-gold"></div>

                    <div className="px-8 pb-8">
                        {/* Avatar overlapping banner */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                            <div className="w-24 h-24 rounded-full bg-gold flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white">
                                {getUserInitials()}
                            </div>
                            <div className="flex-1 text-center sm:text-left pb-1">
                                <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                                <p className="text-sm text-gray-500">{formatRole(user.role?.name)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <User size={14} /> Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="px-4 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 py-2.5">{user.fullName || '-'}</p>
                            )}
                        </div>

                        {/* Email (always read-only) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Mail size={14} /> Email
                            </label>
                            <p className="text-sm font-medium text-gray-800 py-2.5">{user.email}</p>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Phone size={14} /> Phone
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+27-XX-XXX-XXXX"
                                    className="px-4 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 py-2.5">{user.phone || '-'}</p>
                            )}
                        </div>

                        {/* Employee Number (read-only) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Hash size={14} /> Employee Number
                            </label>
                            <p className="text-sm font-medium text-gray-800 py-2.5">{user.employeeNumber || '-'}</p>
                        </div>

                        {/* Role (read-only) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Shield size={14} /> Role
                            </label>
                            <div className="py-2.5">
                                <span className="inline-flex items-center px-3 py-1 bg-light-gold text-brown text-xs font-bold rounded-full">
                                    {formatRole(user.role?.name)}
                                </span>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Building2 size={14} /> Department
                            </label>
                            {isEditing ? (
                                <Select
                                    value={departmentId}
                                    onChange={setDepartmentId}
                                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                                    placeholder="Select Department"
                                    bgColor="bg-subtle-grey"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 py-2.5">{user.department?.name || '-'}</p>
                            )}
                        </div>

                        {/* Province */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <MapPin size={14} /> Province
                            </label>
                            {isEditing ? (
                                <Select
                                    value={provinceId}
                                    onChange={setProvinceId}
                                    options={provinces.map(p => ({ value: p.id, label: p.name }))}
                                    placeholder="Select Province"
                                    bgColor="bg-subtle-grey"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 py-2.5">{user.province?.name || '-'}</p>
                            )}
                        </div>

                        {/* Building (read-only, derived from department) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Building2 size={14} /> Building
                            </label>
                            <p className="text-sm font-medium text-gray-800 py-2.5">{user.department?.building?.name || '-'}</p>
                        </div>
                    </div>
                </div>

                {renderSignatureCard()}
                {renderDelegationCard()}


            </div>
        </DashboardLayout>
    );
};

export default Profile;
