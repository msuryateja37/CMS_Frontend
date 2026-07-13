import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import {
    ArrowLeft, Clock, MapPin, Calendar, Building2, User,
    Shield, MessageSquare, AlertCircle, FileText, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useCaseDetails, useCaseTimeline } from '../../hooks/useIncidents';

const EmployeeCaseDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Fetch details & timeline
    const { data: caseData, isLoading: caseLoading, error: caseError } = useCaseDetails(id || '');
    const { data: timeline = [] } = useCaseTimeline(id || '');

    const isClosed = caseData?.status === 'CLOSED' || caseData?.status === 'COMPLETED';
    const isHealth = caseData?.category?.toLowerCase() === 'health';
    const isAssigned = caseData?.status === 'ASSIGNED' || caseData?.status === 'IN_PROGRESS' || (caseData?.assignments && caseData.assignments.length > 0);

    // Parse structured metadata from description
    const parseDescription = (desc: string) => {
        let cleanDescription = desc || '';
        let natureOfInjury = '';
        let affectedPersons = '';
        let vehicleReg = '';
        let driverDetails = '';
        let subtype = '';

        // Extract Nature of Injury
        const natureMatch = cleanDescription.match(/\[Nature of Injury:\s*([^\]]+)\]/);
        if (natureMatch) {
            natureOfInjury = natureMatch[1];
            cleanDescription = cleanDescription.replace(/\[Nature of Injury:\s*[^\]]+\]\s*/g, '');
        }

        // Extract Affected Persons
        const affectedMatch = cleanDescription.match(/\[Affected Persons:\s*([^\]]+)\]/);
        if (affectedMatch) {
            affectedPersons = affectedMatch[1];
            cleanDescription = cleanDescription.replace(/\[Affected Persons:\s*[^\]]+\]\s*/g, '');
        }

        // Extract Vehicle Reg
        const regMatch = cleanDescription.match(/\[Vehicle Reg:\s*([^\]]+)\]/);
        if (regMatch) {
            vehicleReg = regMatch[1];
            cleanDescription = cleanDescription.replace(/\[Vehicle Reg:\s*[^\]]+\]\s*/g, '');
        }

        // Extract Driver Details
        const driverMatch = cleanDescription.match(/\[Driver Details:\s*([^\]]+)\]/);
        if (driverMatch) {
            driverDetails = driverMatch[1];
            cleanDescription = cleanDescription.replace(/\[Driver Details:\s*[^\]]+\]\s*/g, '');
        }

        // Extract Category Sub-type
        const subtypeMatch = cleanDescription.match(/\[Category Sub-type:\s*([^\]]+)\]/);
        if (subtypeMatch) {
            subtype = subtypeMatch[1];
            cleanDescription = cleanDescription.replace(/\[Category Sub-type:\s*[^\]]+\]\s*/g, '');
        }

        return { cleanDescription: cleanDescription.trim(), natureOfInjury, affectedPersons, vehicleReg, driverDetails, subtype };
    };

    if (caseLoading) {
        return (
            <DashboardLayout title="OHS Incident Management">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-10 h-10 border-2 border-t-transparent border-[#884616] rounded-full animate-spin mx-auto mb-3" />
                        <span className="text-xs text-gray-500 font-semibold">Loading incident details...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (caseError || !caseData) {
        return (
            <DashboardLayout title="OHS Incident Management">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-sm p-5 bg-white border border-gray-150 rounded-2xl shadow-sm">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-xs font-bold text-gray-800 mb-1">Failed to load incident</p>
                        <p className="text-[11px] text-gray-400 mb-4">{(caseError as any)?.message || 'Incident details not found.'}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-[#884616] text-white text-xs font-bold rounded-lg hover:bg-opacity-95 transition"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { cleanDescription, natureOfInjury, affectedPersons, vehicleReg, driverDetails, subtype } = parseDescription(caseData.description);

    const getCategoryLabel = (category: string) => {
        if (!category) return 'Other';
        const cat = category.toLowerCase();
        if (cat === 'health') return 'Health';
        if (cat === 'safety') return 'Safety';
        if (cat === 'environmental') return 'Environmental';
        if (cat === 'mva' || cat === 'motor_vehicle' || cat === 'motor vehicle') return 'MVA';
        return 'Other';
    };

    // Determine current assignee description
    const getCurrentlyWith = () => {
        if (isClosed) return { name: 'None', role: 'Incident Closed' };
        
        const provName = caseData.province?.name || '';
        const isNationalServiced = ['North West', 'Eastern Cape', 'Northern Cape'].includes(provName);

        if (caseData.assignments && caseData.assignments.length > 0) {
            const ass = caseData.assignments[0];
            const isFirstAider = ass.assignedTo?.email?.includes('firstaider');
            return {
                name: ass.assignedTo?.name || 'Assigned Responders',
                role: isFirstAider ? 'First Aider' : (isNationalServiced ? 'Serviced by National Office (ASD OHS)' : 'OHS Practitioner')
            };
        }
        if (caseData.status === 'POOL') {
            const isHealth = caseData.category?.toLowerCase() === 'health';
            if (isNationalServiced && !isHealth) {
                return { name: 'National Office (ASD OHS)', role: 'Serviced by National Office (ASD OHS)' };
            }
            return { name: 'OHS Pool', role: 'Waiting for pickup' };
        }
        if (caseData.status === 'ESCALATED_TO_ADMIN') {
            return { name: 'System Administrator', role: 'Pending assignment' };
        }
        return { name: 'Assigned Responders', role: 'Reviewing incident' };
    };

    const currentlyWith = getCurrentlyWith();

    return (
        <DashboardLayout title="OHS Incident Management">
            <div className="space-y-5 pb-12 animate-fadeIn">
                
                {/* Back Link */}
                <button
                    onClick={() => navigate('/employee/my-cases')}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition font-bold text-xs"
                >
                    <ArrowLeft size={14} />
                    Back to incidents
                </button>



                {/* ====== MAIN 2-COLUMN GRID ====== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT COLUMN: Summary (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Incident Summary Card */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Incident Summary</span>
                                    <h2 className="text-base font-bold text-gray-900 mt-1">
                                        {caseData.incidentNumber} · {getCategoryLabel(caseData.category)}
                                    </h2>
                                </div>
                                <Pill
                                    label={getStatusLabel(caseData.status).toUpperCase()}
                                    variant={caseData.status.toLowerCase().replace(/_/g, ' ')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs border-t border-b border-gray-100 pb-6 pt-5">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Date</span>
                                    <span className="font-semibold text-gray-800">
                                        {new Date(caseData.occurredAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Time</span>
                                    <span className="font-semibold text-gray-800">
                                        {new Date(caseData.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Province / Office</span>
                                    <span className="font-semibold text-gray-800">
                                        {(caseData.province?.name || 'Gauteng')} · {(caseData.building?.name || 'Pretoria Head Office')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Specific Location</span>
                                    <span className="font-semibold text-gray-800">{caseData.location || 'N/A'}</span>
                                </div>

                                {/* Conditional parsed sub-fields */}
                                {natureOfInjury && (
                                    <div className="md:col-span-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Nature of Injury</span>
                                        <span className="font-semibold text-gray-800">{natureOfInjury}</span>
                                    </div>
                                )}
                                {affectedPersons && (
                                    <div className="md:col-span-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Affected Persons</span>
                                        <span className="font-semibold text-gray-800">{affectedPersons}</span>
                                    </div>
                                )}
                                {vehicleReg && (
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Vehicle Registration</span>
                                        <span className="font-semibold text-gray-800">{vehicleReg}</span>
                                    </div>
                                )}
                                {driverDetails && (
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Driver Details</span>
                                        <span className="font-semibold text-gray-800">{driverDetails}</span>
                                    </div>
                                )}
                                {subtype && (
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Category Details</span>
                                        <span className="font-semibold text-gray-800">{subtype}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description</span>
                                <p className="text-gray-700 leading-relaxed text-xs sm:text-[13px] whitespace-pre-wrap">
                                    {cleanDescription || 'No description provided.'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-50 space-y-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Immediate Actions Taken</span>
                                {(() => {
                                    const rawActions = caseData.immediateActions;
                                    const defaultMsg = <p className="text-gray-400 text-xs italic">No immediate actions are added</p>;
                                    if (!rawActions || !rawActions.trim()) return defaultMsg;
                                    try {
                                        const parsed = JSON.parse(rawActions);
                                        if (Array.isArray(parsed)) {
                                            const cleanActions = parsed.map(a => typeof a === 'string' ? a.trim() : String(a).trim()).filter(Boolean);
                                            if (cleanActions.length === 0) return defaultMsg;
                                            return (
                                                <ul className="list-disc pl-5 space-y-1 text-gray-750 text-xs sm:text-[13px] font-medium">
                                                    {cleanActions.map((action, idx) => (
                                                        <li key={idx}>{action}</li>
                                                    ))}
                                                </ul>
                                            );
                                        }
                                    } catch {}
                                    const singleAction = rawActions.trim();
                                    if (singleAction === '[]' || !singleAction) return defaultMsg;
                                    return (
                                        <ul className="list-disc pl-5 space-y-1 text-gray-750 text-xs sm:text-[13px] font-medium">
                                            <li>{singleAction}</li>
                                        </ul>
                                    );
                                })()}
                            </div>

                            {/* Attachments Section */}
                            <div className="pt-4 border-t border-gray-50 space-y-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Attachments</span>
                                {caseData.media && caseData.media.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {caseData.media.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100/50 rounded-xl border border-gray-150 transition group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 flex items-center justify-center group-hover:text-gold shrink-0">
                                                    <FileText size={15} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-gray-700 truncate group-hover:text-gold">
                                                        {file.fileName || `Attachment ${idx + 1}`}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400 uppercase">{file.fileType || 'FILE'}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic font-semibold">No attachments uploaded.</span>
                                )}
                            </div>
                        </div>

                        {/* TREATMENT RECORD SECTION (For closed/resolved Health incidents) */}
                        {isClosed && isHealth && (
                            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-5 animate-fadeIn">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Treatment Record</span>
                                    <h2 className="text-base font-bold text-gray-900 mt-1">First Aid Treatment Log</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs border-t border-gray-100 pt-5">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Administered by</span>
                                        <span className="font-semibold text-gray-800">Thandi Nkosi (First Aider)</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Date / Time</span>
                                        <span className="font-semibold text-gray-800">
                                            {new Date(new Date(caseData.occurredAt).getTime() + 60 * 60 * 1000).toLocaleString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Actions taken</span>
                                        <span className="font-medium text-gray-700 leading-relaxed block">
                                            Cleaned wound with antiseptic, applied sterile dressing, and advised employee to monitor for signs of infection.
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Referral</span>
                                        <span className="font-semibold text-gray-800">None - treated on-site.</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CASE CLOSED SECTION (For closed/resolved Health/Safety incidents) */}
                        {isClosed && (() => {
                            const { closedByName, closedAt, commentsText } = (() => {
                                const closedActivity = timeline.find(t => t.type === 'CLOSED' || t.type === 'RESOLVED');
                                const closureComment = timeline.find(t => t.type === 'COMMENT' && t.description?.startsWith('[Closure Note]'));
                                
                                const closedByName = closedActivity?.user?.name || caseData?.assignments?.[0]?.assignedTo?.name || 'First Aider';
                                const closedAt = closedActivity?.timestamp || caseData?.updatedAt;
                                const commentsText = closureComment 
                                    ? closureComment.description.replace('[Closure Note] ', '') 
                                    : 'Incident resolved by First Aider. Treatment details logged.';
                                    
                                return { closedByName, closedAt, commentsText };
                            })();

                            return (
                                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-5 animate-fadeIn">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Incident Closed</span>
                                        <h2 className="text-base font-bold text-gray-900 mt-1">Resolution Summary</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs border-t border-gray-100 pt-5">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Closed by</span>
                                            <span className="font-semibold text-gray-800">{closedByName}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Date / Time</span>
                                            <span className="font-semibold text-gray-800">
                                                {new Date(closedAt).toLocaleString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Closeout comments</span>
                                            <span className="font-medium text-gray-700 leading-relaxed block whitespace-pre-wrap">
                                                {commentsText}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                    {/* RIGHT COLUMN: Sidebar (1/3 width) */}
                    <div className="space-y-6">
                        
                        {/* Currently With Card */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest leading-none">Currently with</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-250 flex items-center justify-center text-gray-400 shrink-0">
                                    {isClosed ? <CheckCircle className="text-green-600" size={20} /> : <User size={20} />}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-xs text-gray-800 truncate">{currentlyWith.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{currentlyWith.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Reported By Card */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-gray-455 uppercase tracking-widest leading-none">Reported by</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-250 flex items-center justify-center text-gray-400 shrink-0">
                                    <User size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-xs text-gray-800 truncate">{caseData.reportedBy?.name || 'Unknown Employee'}</h4>
                                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                        Employee · {new Date(caseData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {new Date(caseData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status showing Card with Stepper */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-450 uppercase tracking-widest leading-none">Status</h3>
                                <Pill
                                    label={getStatusLabel(caseData.status).toUpperCase()}
                                    variant={caseData.status.toLowerCase().replace(/_/g, ' ')}
                                />
                            </div>

                            {/* Stepper */}
                            <div className="flex items-center justify-between mt-4 px-1.5">
                                {/* Step 1: Supervisor */}
                                <div className="flex flex-col items-center">
                                    <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                        ✓
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-semibold mt-1.5">Supervisor</span>
                                </div>

                                {/* Line 1 */}
                                <div className={`flex-1 h-0.5 -mt-4.5 mx-1 transition-all ${isAssigned || isClosed ? 'bg-green-600' : 'bg-gray-200'}`}></div>

                                {/* Step 2: Practitioner */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-all ${
                                        isAssigned || isClosed ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400 border border-gray-250'
                                    }`}>
                                        {isAssigned || isClosed ? '✓' : '2'}
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-semibold mt-1.5 text-center leading-none">
                                        {isHealth ? 'First Aider' : 'OHS Practitioner'}
                                    </span>
                                </div>

                                {/* Line 2 */}
                                <div className={`flex-1 h-0.5 -mt-4.5 mx-1 transition-all ${isClosed ? 'bg-green-600' : 'bg-gray-200'}`}></div>

                                {/* Step 3: In Progress / Closed */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-all ${
                                        isClosed 
                                            ? 'bg-green-600 text-white' 
                                            : (caseData.status === 'ASSIGNED' || caseData.status === 'IN_PROGRESS' || caseData.status === 'UNDER_REVIEW')
                                                ? 'border-2 border-green-600 text-green-600 animate-pulse bg-white' 
                                                : 'bg-gray-100 text-gray-400 border border-gray-250'
                                    }`}>
                                        {isClosed ? '✓' : '3'}
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-semibold mt-1.5">
                                        {isClosed ? 'Completed' : 'In Progress'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Chronological Activity Timeline */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
                                <Clock size={15} className="text-gold" />
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Activity timeline</h3>
                            </div>

                            <div className="relative pl-1">
                                <div className="absolute left-[5px] top-2.5 bottom-2.5 w-[1.5px] bg-gray-100"></div>
                                <div className="space-y-6">
                                    {timeline.map((act, index) => {
                                        const isComment = act.type === 'COMMENT';
                                        const isEscalated = act.description?.toLowerCase().includes('escalated');
                                        const isResolved = act.type === 'CLOSED' || act.type === 'RESOLVED' || act.type === 'COMPLETED';

                                        const dotColor = 
                                            isResolved ? 'bg-green-500' :
                                            isEscalated ? 'bg-red-500' :
                                            isComment ? 'bg-blue-500' :
                                            act.type === 'ASSIGNED' ? 'bg-indigo-500' : 'bg-[#884616]';

                                        return (
                                            <div key={index} className="relative pl-6">
                                                <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm ${dotColor}`}></div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-gray-800">
                                                        {isComment ? 'Comment' : 
                                                         isEscalated ? 'Escalated' : getStatusLabel(act.type || '')}
                                                    </p>
                                                    {act.description && (
                                                        <p className="text-[11px] text-gray-550 leading-relaxed">
                                                            {act.description}
                                                        </p>
                                                    )}
                                                    <p className="text-[9px] text-gray-400 font-semibold">
                                                        By {act.user?.name || 'System'} · {new Date(act.timestamp).toLocaleString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {timeline.length === 0 && (
                                        <p className="text-[10px] text-gray-400 italic pl-6">No activity recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default EmployeeCaseDetails;
