import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/auth.store';
import { useCreateCase } from '../../hooks/useIncidents';
import { useUsers } from '../../hooks/useUsers';
import locationService, { type Province, type Building } from '../../services/location.service';
import casesService from '../../services/cases.service';
import { Trash2, Loader2, CheckCircle, AlertCircle, FileUp, Sparkles, HelpCircle, X } from 'lucide-react';

interface Person {
    id: string;
    name: string;
    phone: string;
    email: string;
}

interface FormData {
    id: string;
    type: string;
    categoryId?: string;
    description?: string;
    occurredAt?: string;
    location?: string;
    buildingId?: string;
    provinceId?: string;
    departmentId?: string;
    immediateActions?: string;
    otherActions?: string;
    media?: Array<{ url: string; type: string; name: string; uploadedById?: string; uploaderRole?: string }>;
    attachments?: File[];
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const ReportIncident: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const locationState = useLocation();
    const createCaseMutation = useCreateCase();

    // On-Behalf-Of States
    const [isBehalfOf, setIsBehalfOf] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Core States
    const [formData, setFormData] = useState<FormData>({
        id: generateId(),
        type: 'INCIDENT',
        media: []
    });

    // Date/Time States
    const [occurredAtDate, setOccurredAtDate] = useState('');
    const [occurredAtTime, setOccurredAtTime] = useState('');

    // Category Specific Sub-Fields
    const [natureOfInjury, setNatureOfInjury] = useState('');
    const [vehicleReg, setVehicleReg] = useState('');
    const [driverDetails, setDriverDetails] = useState('');
    const [otherSubtype, setOtherSubtype] = useState('');

    const [showOtherModal, setShowOtherModal] = useState(false);

    const userRole = user?.role?.name?.toLowerCase()?.replace(/_/g, ' ')?.replace(/\s+/g, ' ')?.trim();
    const isSupervisor = userRole === 'supervisor';

    // Query employees in current province
    const { data: allEmployees } = useUsers(isSupervisor ? { role: 'EMPLOYEE', provinceId: user?.province?.id } : undefined);
    const filteredEmployees = (allEmployees || []).filter(emp =>
        emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.email?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (emp.employeeNumber || '').toLowerCase().includes(employeeSearch.toLowerCase())
    );

    const handleBehalfOfToggle = (checked: boolean) => {
        setIsBehalfOf(checked);
        if (!checked) {
            setSelectedEmployee(null);
            setEmployeeSearch('');
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    provinceId: user.province?.id || undefined,
                    buildingId: user.department?.building?.id || undefined,
                    departmentId: user.department?.id || undefined
                }));
            }
        }
    };

    // Province & Office Lists
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    // Confirm & Modal States
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // File uploads states
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState<Record<string, boolean>>({});

    // Dynamic Supervisor Query
    const userProvinceId = formData.provinceId || user?.province?.id;
    const { data: supervisors } = useUsers(
        userProvinceId ? { provinceId: userProvinceId, role: 'SUPERVISOR' } : undefined
    );
    // If on-behalf-of, their supervisor is the logged-in supervisor
    const supervisorName = isBehalfOf ? (user?.fullName || user?.name || 'Sarah Mokae') : (supervisors && supervisors.length > 0 ? supervisors[0].name : 'Sarah Mokae');

    // Fetch Provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingLocations(true);
            try {
                const list = await locationService.getProvinces();
                setProvinces(list);
            } catch (e) {
                console.error('Failed to load provinces', e);
            } finally {
                setLoadingLocations(false);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch Buildings when province changes
    useEffect(() => {
        const fetchBuildings = async () => {
            if (!formData.provinceId) {
                setBuildings([]);
                return;
            }
            try {
                const list = await locationService.getBuildingsByProvince(formData.provinceId);
                setBuildings(list);
            } catch (e) {
                console.error('Failed to load buildings', e);
            }
        };
        fetchBuildings();
    }, [formData.provinceId]);

    // Load from draft or set defaults
    useEffect(() => {
        if (locationState.state?.draft) {
            const draft = locationState.state.draft;
            setFormData(draft);
            setOccurredAtDate(draft.occurredAtDate || '');
            setOccurredAtTime(draft.occurredAtTime || '');
            setNatureOfInjury(draft.natureOfInjury || '');
            setVehicleReg(draft.vehicleReg || '');
            setDriverDetails(draft.driverDetails || '');
            setOtherSubtype(draft.otherSubtype || '');
            setFiles(draft.attachments || []);
        } else if (user) {
            setFormData(prev => ({
                ...prev,
                provinceId: user.province?.id || undefined,
                buildingId: user.department?.building?.id || undefined,
                departmentId: user.department?.id || undefined
            }));
            
            // Set current date/time by default
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            setOccurredAtDate(`${year}-${month}-${day}`);
            setOccurredAtTime(`${hours}:${minutes}`);
        }
    }, [locationState.state, user]);

    // Auto-save draft logic
    useEffect(() => {
        if (formData.id) {
            const drafts = JSON.parse(localStorage.getItem('incident_drafts') || '[]');
            const existingIndex = drafts.findIndex((d: any) => d.id === formData.id);
            const currentDraft = {
                ...formData,
                occurredAtDate,
                occurredAtTime,
                natureOfInjury,
                vehicleReg,
                driverDetails,
                otherSubtype,
                lastSaved: new Date().toISOString()
            };
            if (existingIndex >= 0) {
                drafts[existingIndex] = currentDraft;
            } else {
                drafts.push(currentDraft);
            }
            localStorage.setItem('incident_drafts', JSON.stringify(drafts));
        }
    }, [formData, occurredAtDate, occurredAtTime, natureOfInjury, vehicleReg, driverDetails, otherSubtype]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const updatedFiles = [...files, ...newFiles];
            setFiles(updatedFiles);

            for (const file of newFiles) {
                const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                setUploading(prev => ({ ...prev, [fileId]: true }));

                try {
                    const result = await casesService.uploadFile(file, formData.id);
                    const newMedia = {
                        url: result.url,
                        type: result.type,
                        name: file.name,
                        uploadedById: user?.id,
                        uploaderRole: user?.role?.name || 'Employee'
                    };
                    setFormData(prev => ({
                        ...prev,
                        media: [...(prev.media || []), newMedia]
                    }));
                } catch (error) {
                    console.error('File upload failed', error);
                    alert(`Failed to upload ${file.name}. Please try again.`);
                } finally {
                    setUploading(prev => ({ ...prev, [fileId]: false }));
                }
            }
        }
    };

    const handleRemoveFile = (index: number) => {
        const fileToRemove = files[index];
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);

        const updatedMedia = (formData.media || []).filter(m => m.name !== fileToRemove.name);
        setFormData(prev => ({
            ...prev,
            media: updatedMedia
        }));
    };

    const handleDiscard = () => {
        if (window.confirm('Are you sure you want to discard this report? All changes will be lost.')) {
            // Remove draft from local storage
            const drafts = JSON.parse(localStorage.getItem('incident_drafts') || '[]');
            const updatedDrafts = drafts.filter((d: any) => d.id !== formData.id);
            localStorage.setItem('incident_drafts', JSON.stringify(updatedDrafts));
            navigate('/employee/dashboard');
        }
    };

    const handleOpenConfirmModal = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setShowConfirmModal(false);
        try {
            // Combine Date and Time
            const combinedDateTime = new Date(`${occurredAtDate}T${occurredAtTime}`);

            // Embed category sub-fields cleanly into description for schema preservation
            let description = formData.description || '';
            const cat = formData.categoryId || 'others';
            if (cat === 'others' && otherSubtype) {
                description = `[Category Sub-type: ${otherSubtype}]\n\n${description}`;
            } else if ((cat === 'health' || cat === 'safety') && natureOfInjury) {
                description = `[Nature of Injury: ${natureOfInjury}]\n\n${description}`;
            } else if (cat === 'mva') {
                description = `[Vehicle Reg: ${vehicleReg}]\n[Driver Details: ${driverDetails}]\n\n${description}`;
            }

            const caseData = {
                id: formData.id,
                type: 'INCIDENT',
                categoryId: formData.categoryId,
                severity: 'medium', // Default severity
                description,
                occurredAt: combinedDateTime.toISOString(),
                location: formData.location,
                buildingId: formData.buildingId,
                provinceId: formData.provinceId,
                departmentId: formData.departmentId,
                peopleImpacted: 0,
                media: formData.media || [],
                immediateActions: formData.immediateActions ? [formData.immediateActions] : [],
                otherActions: formData.otherActions,
                reportedById: isBehalfOf && selectedEmployee ? selectedEmployee.id : undefined
            };

            const response = await createCaseMutation.mutateAsync(caseData);

            // Clear draft
            const drafts = JSON.parse(localStorage.getItem('incident_drafts') || '[]');
            const updatedDrafts = drafts.filter((d: any) => d.id !== formData.id);
            localStorage.setItem('incident_drafts', JSON.stringify(updatedDrafts));

            const roleSlug = userRole === 'supervisor' ? 'supervisor' : userRole === 'ohs practitioner' ? 'ohs' : 'employee';
            navigate(`/${roleSlug}/submit-case/success`, {
                state: {
                    caseId: response.id,
                    caseNumber: response.incidentNumber
                }
            });
        } catch (e: any) {
            console.error('Failed to submit incident', e);
            alert(e.response?.data?.message || 'Failed to submit incident. Please check all fields.');
        }
    };

    // Form validation
    const isUploadingAny = Object.values(uploading).some(v => v);
    const category = formData.categoryId || '';
    const isCategoryValid = category !== '';
    const isSubFieldsValid = 
        category === 'others' ? otherSubtype !== '' :
        (category === 'health' || category === 'safety') ? natureOfInjury.trim() !== '' : true;

    const isBehalfOfValid = !isBehalfOf || !!selectedEmployee;

    const isFormValid = 
        occurredAtDate !== '' &&
        occurredAtTime !== '' &&
        formData.provinceId &&
        formData.buildingId &&
        (formData.location || '').trim() !== '' &&
        isCategoryValid &&
        isSubFieldsValid &&
        (formData.description || '').trim() !== '' &&
        isConfirmed &&
        !isUploadingAny &&
        isBehalfOfValid;

    const categoryTiles = [
        { id: 'safety', label: 'Safety', icon: '🛡️', color: 'border-amber-200 hover:bg-amber-50/20 text-amber-800' },
        { id: 'environmental', label: 'Environmental', icon: '🍃', color: 'border-emerald-200 hover:bg-emerald-50/20 text-emerald-800' },
        { id: 'health', label: 'Health', icon: '❤️', color: 'border-rose-200 hover:bg-rose-50/20 text-rose-800' },
        { id: 'others', label: 'Other', icon: '💬', color: 'border-gray-200 hover:bg-gray-50/20 text-gray-800' }
    ];

    const dashboardPath = userRole === 'supervisor' ? '/supervisor/dashboard' : userRole === 'ohs practitioner' ? '/ohs/dashboard' : '/employee/dashboard';

    return (
        <DashboardLayout
            title="OHS Incident Management"
            breadcrumbs={[{ label: "Dashboard", path: dashboardPath }, { label: "Report New Incident" }]}
        >
            <div className="max-w-[850px] mx-auto space-y-6 pb-12 animate-fadeIn">
                {/* Form Header */}
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Report New Incident</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Complete every field accurately — this information starts the routing and notification process.
                    </p>
                </div>

                <form onSubmit={handleOpenConfirmModal} className="space-y-6">
                    {/* Reporter Panel (Bordered Card) */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Reporter Details</h2>
                            {isSupervisor && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="behalf-of-checkbox"
                                        checked={isBehalfOf}
                                        onChange={(e) => handleBehalfOfToggle(e.target.checked)}
                                        className="form-checkbox h-3.5 w-3.5 text-[#884616] rounded border-gray-300 focus:ring-[#884616] cursor-pointer"
                                    />
                                    <label htmlFor="behalf-of-checkbox" className="text-[11px] font-bold text-gray-600 cursor-pointer select-none">
                                        Report on behalf of an employee
                                    </label>
                                </div>
                            )}
                        </div>

                        {isSupervisor && isBehalfOf && (
                            <div className="pt-1 pb-2 border-b border-gray-100 animate-fadeIn">
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Search Employee *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={employeeSearch}
                                        onChange={(e) => {
                                            setEmployeeSearch(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Type employee name, email, or employee number..."
                                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] transition"
                                    />
                                    {showSuggestions && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                            {filteredEmployees.length > 0 ? (
                                                filteredEmployees.map(emp => (
                                                    <div
                                                        key={emp.id}
                                                        onClick={() => {
                                                            setSelectedEmployee(emp);
                                                            setEmployeeSearch(emp.name);
                                                            setShowSuggestions(false);
                                                            // Auto fill location details from employee
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                provinceId: emp.provinceId || undefined,
                                                                buildingId: emp.department?.building?.id || emp.buildingId || undefined,
                                                                departmentId: emp.departmentId || undefined
                                                            }));
                                                        }}
                                                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-xs font-medium text-gray-700 flex justify-between"
                                                    >
                                                        <span>{emp.name} ({emp.email})</span>
                                                        <span className="text-gray-400 font-mono text-[10px]">{emp.employeeNumber || 'No EMP #'}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium">No employees found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Name</label>
                                <input
                                    type="text"
                                    value={isBehalfOf && selectedEmployee ? selectedEmployee.name : (user?.fullName || user?.name || 'N/A')}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Employee #</label>
                                <input
                                    type="text"
                                    value={isBehalfOf && selectedEmployee ? (selectedEmployee.employeeNumber || 'N/A') : (user?.employeeNumber || 'N/A')}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Supervisor</label>
                                <input
                                    type="text"
                                    value={supervisorName}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Incident Details Panel (Bordered Card) */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Incident Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={occurredAtDate}
                                    onChange={(e) => setOccurredAtDate(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] focus:ring-1 focus:ring-[#884616] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Time *</label>
                                <input
                                    type="time"
                                    value={occurredAtTime}
                                    onChange={(e) => setOccurredAtTime(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] focus:ring-1 focus:ring-[#884616] transition"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Province</label>
                                <input
                                    type="text"
                                    value={provinces.find(p => p.id === formData.provinceId)?.name || provinces.find(p => p.id === user?.province?.id)?.name || 'Gauteng'}
                                    disabled
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Office / Building *</label>
                                <select
                                    value={formData.buildingId || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, buildingId: e.target.value }))}
                                    required
                                    disabled={!formData.provinceId}
                                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] transition cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                                >
                                    <option value="" disabled>Select Office</option>
                                    {buildings.filter((b, idx, self) => self.findIndex(x => x.name === b.name) === idx).map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Specific Location *</label>
                            <input
                                type="text"
                                placeholder="e.g. Stairwell, Block B, 2nd floor"
                                value={formData.location || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                required
                                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] focus:ring-1 focus:ring-[#884616] transition"
                            />
                        </div>

                        {/* Category Tiles Grid */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">Category *</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {categoryTiles.map(tile => (
                                    <button
                                        key={tile.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, categoryId: tile.id }));
                                            if (tile.id === 'others') {
                                                setShowOtherModal(true);
                                            }
                                        }}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                                            formData.categoryId === tile.id
                                                ? 'border-[#884616] bg-amber-50/30 text-[#884616] font-bold shadow-sm'
                                                : tile.color
                                        }`}
                                    >
                                        <span className="text-xl mb-1">{tile.icon}</span>
                                        <span className="text-[10px] leading-tight">{tile.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Sub-Fields based on selected Category */}
                        {category === 'others' && (
                            <div className="pt-2 animate-fadeIn flex flex-col gap-1.5">
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Sub-type Details *</label>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1.5 bg-amber-50 text-[#884616] border border-amber-200 rounded-lg text-xs font-semibold">
                                        {otherSubtype || 'Not specified'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowOtherModal(true)}
                                        className="text-xs text-[#884616] hover:underline font-bold"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        )}

                        {(category === 'health' || category === 'safety') && (
                            <div className="pt-2 animate-fadeIn">
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Nature of Injury / Medical Complaint *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Chest pain, deep cut on left index finger"
                                    value={natureOfInjury}
                                    onChange={(e) => setNatureOfInjury(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] focus:ring-1 focus:ring-[#884616] transition"
                                />
                            </div>
                          )}

                    </div>

                    {/* Description Panel (Bordered Card) */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-3">
                        <div>
                            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description *</h2>
                            <p className="text-[10px] text-gray-400 mt-0.5">Include what, where, when, and how.</p>
                        </div>
                        <textarea
                            placeholder="Describe what happened..."
                            rows={4}
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            required
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] focus:ring-1 focus:ring-[#884616] transition resize-none leading-relaxed"
                        />
                    </div>

                    {/* Immediate Action Taken (Bordered Card) */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-3">
                        <div>
                            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Immediate action taken</h2>
                            <p className="text-[10px] text-gray-400 mt-0.5">Optional — what was done immediately after?</p>
                        </div>
                        <textarea
                            placeholder="Optional — what was done immediately after?"
                            rows={3}
                            value={formData.immediateActions || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, immediateActions: e.target.value }))}
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] focus:ring-1 focus:ring-[#884616] transition resize-none leading-relaxed"
                        />
                    </div>

                    {/* Attachments Card */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Attachments</h2>
                            <p className="text-[10px] text-gray-400 mt-0.5">Photos, statements, or supporting documents.</p>
                        </div>

                        <div className="w-full">
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                    <FileUp className="w-6 h-6 mb-1.5 text-gray-400" />
                                    <p className="mb-0.5 text-xs text-gray-600"><span className="font-bold">Click to upload</span> or drag and drop</p>
                                    <p className="text-[10px] text-gray-400">PDF, PNG, JPG — up to 10MB</p>
                                </div>
                                <input type="file" className="hidden" multiple onChange={handleFileChange} disabled={isUploadingAny} />
                            </label>

                            {/* Uploaded Files list */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map((file, index) => {
                                        const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                                        const isFileUploading = uploading[fileId];
                                        const isUploaded = (formData.media || []).some(m => m.name === file.name);

                                        return (
                                            <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-150 group transition">
                                                <div className="flex items-center gap-2">
                                                    {isFileUploading ? (
                                                        <Loader2 size={13} className="animate-spin text-blue-500" />
                                                    ) : isUploaded ? (
                                                        <CheckCircle size={13} className="text-green-600" />
                                                    ) : (
                                                        <AlertCircle size={13} className="text-amber-500" />
                                                    )}
                                                    <span className="text-xs text-gray-700 font-semibold truncate max-w-[250px]">{file.name}</span>
                                                    <span className="text-[10px] text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 transition"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Declaration Checkbox */}
                    <div className="flex items-start gap-2.5 pt-2">
                        <input
                            type="checkbox"
                            id="confirm-checkbox"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-[#884616] rounded border-gray-300 focus:ring-[#884616] mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="confirm-checkbox" className="text-xs text-gray-600 font-semibold cursor-pointer select-none">
                            I confirm that this information is accurate and complete to the best of my knowledge.
                        </label>
                    </div>

                    {/* Form Actions Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                        <button
                            type="button"
                            onClick={handleDiscard}
                            className="px-5 py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || createCaseMutation.isPending}
                            className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-lg transition shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-1.5"
                        >
                            {createCaseMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                            Report New Incident
                        </button>
                    </div>

                </form>
            </div>

            {/* Confirmation Dialog Modal matching Screen 10 */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                        <div className="p-5 text-center">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3.5">
                                <HelpCircle size={22} />
                            </div>
                            <h3 className="font-bold text-sm text-gray-800">Report New Incident?</h3>
                            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                                Are you sure you want to report this new incident? This will route the incident to the appropriate provincial responders.
                            </p>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 flex items-center justify-end gap-2 border-t border-gray-150">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 border border-gray-250 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg text-xs font-bold transition shadow-md"
                            >
                                Confirm Submission
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Other Subtype Custom Popup Modal */}
            {showOtherModal && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-150 overflow-hidden animate-fadeIn">
                        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
                            <h3 className="font-bold text-sm text-gray-800">Specify Category Details</h3>
                            <button 
                                type="button" 
                                onClick={() => setShowOtherModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                Select one of the common other incident subtypes or enter your own custom detail below:
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {['Power Outage', 'Water Outage', 'Infrastructure'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setOtherSubtype(type)}
                                        className={`py-2 px-3 border rounded-xl text-center text-xs font-semibold transition-all ${
                                            otherSubtype === type
                                                ? 'border-[#884616] bg-amber-50/30 text-[#884616]'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2">
                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Custom Subtype Detail *</label>
                                <input
                                    type="text"
                                    placeholder="Type details (e.g. Broken Elevator)"
                                    value={otherSubtype}
                                    onChange={(e) => setOtherSubtype(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-[#884616] transition"
                                />
                            </div>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 flex items-center justify-end gap-2 border-t border-gray-150">
                            <button
                                type="button"
                                onClick={() => {
                                    setOtherSubtype('');
                                    setShowOtherModal(false);
                                }}
                                className="px-4 py-2 border border-gray-250 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!otherSubtype.trim()) {
                                        alert('Please select or enter details');
                                        return;
                                    }
                                    setShowOtherModal(false);
                                }}
                                className="px-5 py-2 bg-[#BB8F53] hover:bg-[#A1743E] text-white rounded-lg text-xs font-bold transition shadow-md"
                            >
                                Confirm Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ReportIncident;
