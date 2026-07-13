import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import { formatCategory } from '../../utils/formatters';
import {
    ArrowLeft, Clock, FileText, MapPin, Calendar, Building2,
    User, Tag, AlertCircle, Shield, Users, Upload,
    Send, Loader2, MessageSquare, Paperclip, CheckCircle,
    X, ArrowUpRight, Stethoscope, Hospital
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import EscalationModal from '../../components/incident/EscalationModal';

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
    critical: { bg: 'bg-subtle-red', text: 'text-brand-red', dot: 'bg-brand-red' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    medium: { bg: 'bg-light-yellow', text: 'text-yellow-800', dot: 'bg-brand-yellow' },
    low: { bg: 'bg-light-gold', text: 'text-brown', dot: 'bg-[#21FC95]' },
};

const normalizeRoleName = (role?: string): string => {
    if (!role) return 'Employee';
    const lower = role.toLowerCase().trim();
    if (lower === 'other' || lower === 'employee') return 'Employee';
    if (lower === 'supervisor') return 'Supervisor';
    if (lower.includes('ohs')) return 'OHS Practitioner';
    if (lower.includes('security')) return 'First Aider';
    if (lower === 'admin') return 'Admin';
    return role.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
};

const FirstAiderCaseAction: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Activity timeline
    const [activities, setActivities] = useState<any[]>([]);

    // Comment form
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Evidence upload
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Send back to supervisor
    const [sendingBack, setSendingBack] = useState(false);

    // Success message
    const [successMsg, setSuccessMsg] = useState('');

    // Escalation modal
    const [showEscalation, setShowEscalation] = useState(false);
    
    // Forwarding state
    const [forwarding, setForwarding] = useState(false);

    // Close modal states
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closureNote, setClosureNote] = useState('');
    const [closureType, setClosureType] = useState('Resolved by First Aid');
    const [closureConfirmed, setClosureConfirmed] = useState(false);
    const [lessonsLearned, setLessonsLearned] = useState('');
    const [closing, setClosing] = useState(false);

    // Record Treatment modal states
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);
    const [treatmentGiven, setTreatmentGiven] = useState<string[]>([]);
    const [medication, setMedication] = useState('');
    const [treatmentOutcome, setTreatmentOutcome] = useState<'resolved' | 'referred'>('resolved');
    const [referralFacility, setReferralFacility] = useState('');
    const [referralReason, setReferralReason] = useState('');
    const [savingTreatment, setSavingTreatment] = useState(false);

    const TREATMENT_OPTIONS = [
        'Wound cleaning', 'Bandaging',
        'Ice pack', 'Eye wash',
        'CPR', 'Other'
    ];

    const toggleTreatment = (option: string) => {
        setTreatmentGiven(prev =>
            prev.includes(option) ? prev.filter(t => t !== option) : [...prev, option]
        );
    };

    const handleSaveTreatment = async () => {
        if (treatmentGiven.length === 0) {
            setError('Please select at least one treatment.');
            return;
        }
        if (treatmentOutcome === 'referred' && !referralFacility.trim()) {
            setError('Please enter the referral facility.');
            return;
        }
        setSavingTreatment(true);
        try {
            const note = `[Treatment Record] Treatments: ${treatmentGiven.join(', ')}${medication ? ` | Medication: ${medication}` : ''} | Outcome: ${treatmentOutcome === 'resolved' ? 'Resolved on site' : `Referred to ${referralFacility}`}${referralReason ? ` | Reason: ${referralReason}` : ''}`;
            await casesService.addComment(id!, note);
            showSuccess('Treatment recorded successfully.');
            setShowTreatmentModal(false);
            setTreatmentGiven([]);
            setMedication('');
            setTreatmentOutcome('resolved');
            setReferralFacility('');
            setReferralReason('');
            if (id) { fetchCaseDetails(id); fetchTimeline(id); }
        } catch (err) {
            console.error('Error saving treatment:', err);
            setError('Failed to record treatment.');
        } finally {
            setSavingTreatment(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCaseDetails(id);
            fetchTimeline(id);
        }
    }, [id]);

    const fetchCaseDetails = async (caseId: string) => {
        try {
            setLoading(true);
            const data = await casesService.getCaseById(caseId);
            setCaseData(data);
        } catch (err) {
            console.error('Error fetching case details:', err);
            setError('Failed to load case details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeline = async (caseId: string) => {
        try {
            const timeline = await casesService.getActivityTimeline(caseId);
            setActivities(timeline);
        } catch (err) {
            console.error('Error fetching timeline:', err);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !id) return;
        try {
            setSubmittingComment(true);
            await casesService.addComment(id, comment.trim());
            setComment('');
            showSuccess('Comment added successfully.');
            fetchTimeline(id);
            fetchCaseDetails(id);
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadEvidence = async () => {
        if (selectedFiles.length === 0 || !id) return;
        try {
            setUploadingFiles(true);
            for (const file of selectedFiles) {
                const uploaded = await casesService.uploadFile(file, id);
                await casesService.addEvidence(id, {
                    fileUrl: uploaded.url,
                    fileType: file.type,
                    fileName: file.name,
                    uploaderRole: 'First Aider',
                });
            }
            setSelectedFiles([]);
            showSuccess(`${selectedFiles.length} file(s) uploaded successfully.`);
            fetchCaseDetails(id);
            fetchTimeline(id);
        } catch (err) {
            console.error('Error uploading evidence:', err);
            setError('Failed to upload evidence.');
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleSendBackToSupervisor = async () => {
        if (!id) return;
        try {
            setSendingBack(true);
            await casesService.updateStatus(id, 'UNDER_REVIEW');
            showSuccess('Case sent back to supervisor for review.');
            fetchCaseDetails(id);
            fetchTimeline(id);
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to send case back.');
        } finally {
            setSendingBack(false);
        }
    };

    const handleForwardToOhsAndHr = async () => {
        if (!id) return;
        try {
            setForwarding(true);
            await casesService.forwardToOhs(id);
            showSuccess('Case forwarded to OHS & HR successfully due to hospitalization.');
            fetchCaseDetails(id);
            fetchTimeline(id);
        } catch (err) {
            console.error('Error forwarding case:', err);
            setError('Failed to forward case.');
        } finally {
            setForwarding(false);
        }
    };

    const handleCloseCase = async () => {
        if (!id) return;
        if (!closureNote.trim()) {
            setError('Please enter a closure note.');
            return;
        }
        if (!closureConfirmed) {
            setError('Please confirm that all parties have been informed.');
            return;
        }
        setClosing(true);
        try {
            // 1. Add comment with the closure note prefix
            await casesService.addComment(id, `[Closure Note] [${closureType}] ${closureNote.trim()}${lessonsLearned.trim() ? ` | Lessons Learned: ${lessonsLearned.trim()}` : ''}`);
            // 2. Call the close case API
            await casesService.closeCase(id);
            showSuccess('Incident closed successfully.');
            setShowCloseModal(false);
            setClosureNote('');
            setLessonsLearned('');
            setClosureConfirmed(false);
            setClosureType('Resolved by First Aid');
            // Refresh details and timeline
            fetchCaseDetails(id);
            fetchTimeline(id);
        } catch (err) {
            console.error('Error closing case:', err);
            setError('Failed to close incident.');
        } finally {
            setClosing(false);
        }
    };

    const getSeverityStyle = (severity?: string) => {
        if (!severity) return severityConfig.medium;
        return severityConfig[severity.toLowerCase()] || severityConfig.medium;
    };

    if (loading) {
        return (
            <DashboardLayout title="Case Details" description="Loading..." breadcrumbs={[{ label: "Dashboard", path: "/first-aider/dashboard" }, { label: "Cases Under Review", path: "/first-aider/cases-review" }, { label: "Loading..." }]}>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error && !caseData) {
        return (
            <DashboardLayout title="Case Details" description="Error" breadcrumbs={[{ label: "Dashboard", path: "/first-aider/dashboard" }, { label: "Cases Under Review", path: "/first-aider/cases-review" }, { label: "Error" }]}>
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                    <p className="font-bold">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button onClick={() => navigate(-1)} className="mt-3 bg-red-100 px-4 py-2 rounded-lg text-red-800 font-bold text-sm">Go Back</button>
                </div>
            </DashboardLayout>
        );
    }

    if (!caseData) return null;

    const sevStyle = getSeverityStyle(caseData.severity);
    const isClosed = caseData.status === 'CLOSED' || caseData.status === 'RESOLVED';
    const isForwarded = caseData.status === 'FORWARDED_TO_OHS_AND_HR';
    const isUnderReview = caseData.status === 'UNDER_REVIEW';
    const isCurrentAssignee = user?.id === caseData.assignedTo?.id;

    return (
        <DashboardLayout
            title={`Case ${caseData.incidentNumber}`}
            description="Case Details"
            breadcrumbs={[{ label: "Dashboard", path: "/first-aider/dashboard" }, { label: "Cases Under Review", path: "/first-aider/cases-review" }, { label: caseData?.incidentNumber || "Case Details" }]}
        >
            <div className="max-w-7xl mx-auto">
                {/* Success Banner */}
                {successMsg && (
                    <div className="mb-4 flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <CheckCircle size={16} />
                        {successMsg}
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
                    </div>
                )}

                {/* Top Bar: Back + Status badge */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => navigate('/first-aider/cases-review')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Incidents</span>
                    </button>

                    {isForwarded && (
                        <span className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-semibold text-sm">
                            <ArrowUpRight size={16} />
                            Forwarded to OHS &amp; HR
                        </span>
                    )}
                    {isUnderReview && (
                        <span className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-semibold text-sm">
                            <Clock size={16} />
                            Under Supervisor Review
                        </span>
                    )}
                    {isClosed && (
                        <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm">
                            <CheckCircle size={16} />
                            Case Closed
                        </span>
                    )}
                    {!isClosed && !isUnderReview && !isForwarded && !isCurrentAssignee && !caseData.assignedTo && (
                        <button
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    await casesService.pickupCase(caseData.id);
                                    showSuccess('Case self-assigned successfully.');
                                    fetchCaseDetails(caseData.id);
                                    fetchTimeline(caseData.id);
                                } catch (err) {
                                    setError('Failed to self-assign incident.');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg font-semibold text-sm shadow-md transition"
                        >
                            <CheckCircle size={16} />
                            Self Assign Incident
                        </button>
                    )}
                    {!isClosed && !isUnderReview && !isForwarded && !isCurrentAssignee && caseData.assignedTo && (
                        <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm">
                            <Shield size={16} />
                            Assigned to {caseData.assignedTo?.name || 'another practitioner'}
                        </span>
                    )}
                </div>

                {/* Action Tab Buttons — Record Treatment + Close Case */}
                {!isClosed && isCurrentAssignee && (
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            id="record-treatment-btn"
                            onClick={() => setShowTreatmentModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brown text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-opacity-90 transition-all"
                        >
                            <Stethoscope size={15} />
                            Record Treatment
                        </button>
                        <button
                            id="close-case-tab-btn"
                            onClick={() => setShowCloseModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Close Case
                        </button>
                        {caseData.category === 'health' && (
                            <button
                                onClick={handleForwardToOhsAndHr}
                                disabled={forwarding}
                                className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all font-semibold text-sm disabled:opacity-50"
                            >
                                {forwarding ? <Loader2 size={15} className="animate-spin" /> : <ArrowUpRight size={15} />}
                                Forward to HR &amp; OHS
                            </button>
                        )}
                    </div>
                )}

                {/* ====== MAIN 2-COLUMN LAYOUT ====== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN — Main content (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {isClosed && (() => {
                            const { closedByName, closedAt, commentsText } = (() => {
                                const closedActivity = activities.find(t => t.type === 'CLOSED' || t.type === 'RESOLVED');
                                const closureComment = activities.find(t => t.type === 'COMMENT' && t.description?.startsWith('[Closure Note]'));
                                
                                const closedByName = closedActivity?.user?.name || caseData.assignments?.[0]?.assignedTo?.name || 'First Aider';
                                const closedAt = closedActivity?.timestamp || caseData.updatedAt;
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs border-t border-gray-100 pt-4.5">
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

                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className={`h-1.5 ${sevStyle.dot}`}></div>
                            <div className="p-6">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md font-bold">
                                        {caseData.incidentNumber}
                                    </span>
                                    <Pill
                                        label={getStatusLabel(caseData.status)}
                                        variant={caseData.status.toLowerCase().replace('_', ' ')}
                                    />
                                    {caseData.severity && (
                                        <Pill
                                            label={formatCategory(caseData.severity)}
                                            variant={caseData.severity.toLowerCase()}
                                        />
                                    )}
                                    {caseData.isEscalated && (
                                        <Pill label="Escalated" variant="critical" />
                                    )}
                                </div>

                                <div className="flex items-center justify-between flex-wrap gap-4 mt-2 w-full">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {formatCategory(caseData.category || caseData.type || 'Untitled Case')}
                                    </h1>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {caseData.occurredAt && (
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(caseData.occurredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}

                                        {caseData.building?.province?.name && (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-gray-400" />
                                                {caseData.building.province.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                {caseData.description || 'No description provided.'}
                            </div>                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Immediate Actions Taken</h4>
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
                        </div>

                        {/* Details Grid */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Case Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                                        <Calendar size={12} /> Occurred At
                                    </label>
                                    <p className="text-sm font-medium text-gray-800">
                                        {caseData.occurredAt ? new Date(caseData.occurredAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                                        <Building2 size={12} /> Building
                                    </label>
                                    <p className="text-sm font-medium text-gray-800">{caseData.building?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                                        <MapPin size={12} /> Location
                                    </label>
                                    <p className="text-sm font-medium text-gray-800">{caseData.location || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                                        <User size={12} /> Reported By
                                    </label>
                                    <p className="text-sm font-medium text-gray-800">{caseData.reportedBy?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                                        <Shield size={12} /> Assigned To
                                    </label>
                                    <p className="text-sm font-medium text-gray-800">
                                        {caseData.assignedTo?.name || <span className="text-gray-400 italic">Unassigned</span>}
                                    </p>
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                                        <Users size={12} /> People Impacted
                                    </label>
                                    <p className="text-sm font-medium text-gray-800">{caseData.peopleImpacted ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Practitioner Actions — Comment + Upload */}
                        {!isClosed && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Practitioner Actions</h3>

                                {/* Add Comment */}
                                <div className="mb-6">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                                        <MessageSquare size={13} /> Add Comment / Notes
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Document your findings, actions taken, or notes about this case..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none"
                                        rows={4}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!comment.trim() || submittingComment}
                                            className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                            Add Comment
                                        </button>
                                    </div>
                                </div>


                            </div>
                        )}

                        {/* Evidence Section — Grouped by role like CaseDetails */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Evidence & Attachments</h3>
                            {caseData.evidence && caseData.evidence.length > 0 ? (
                                <div className="space-y-6">
                                    {['Employee', 'Supervisor', 'First Aider', 'Other'].map(role => {
                                        const roleDocs = caseData.evidence?.filter(e => {
                                            const normRole = normalizeRoleName(e.uploaderRole);
                                            return role === 'Other'
                                                ? !e.uploaderRole || !['Employee', 'Supervisor', 'First Aider'].includes(normRole)
                                                : normRole === role;
                                        });
                                        if (!roleDocs || roleDocs.length === 0) return null;

                                        return (
                                            <div key={role}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${role === 'Employee' ? 'bg-blue-50 text-blue-700' :
                                                        role === 'Supervisor' ? 'bg-light-gold text-brown' :
                                                            role === 'First Aider' ? 'bg-purple-50 text-purple-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {role}
                                                    </span>
                                                    <div className="h-px flex-1 bg-gray-100" />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {roleDocs.map((file, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={file.fileUrl?.match(/^\s*(javascript|data|vbscript):/i) ? '#' : file.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gold/30 hover:shadow-sm transition-all group"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-gold shrink-0">
                                                                <FileText size={18} />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-sm font-medium text-gray-700 truncate group-hover:text-gold">
                                                                    {file.fileName || `Attachment ${idx + 1}`}
                                                                </p>
                                                                <p className="text-xs text-gray-400 uppercase">{file.fileType?.split('/')[1] || 'FILE'}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <FileText className="mx-auto text-gray-300 mb-2" size={28} />
                                    <p className="text-gray-400 font-medium text-sm">No evidence uploaded yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Map View */}
                        {(caseData.latitude || caseData.longitude) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Incident Location</h3>
                                <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200">
                                    <iframe
                                        title="Incident Location Map"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(caseData.latitude || '')},${encodeURIComponent(caseData.longitude || '')}&z=15&output=embed`}
                                    />
                                </div>
                                <div className="mt-3 flex gap-4 text-xs text-gray-400 font-mono">
                                    <span>LAT: {caseData.latitude}</span>
                                    <span>LONG: {caseData.longitude}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN — Timeline + Quick Info (1/3 width) */}
                    <div className="space-y-6">

                        {/* Quick Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Info</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs text-gray-400 font-semibold">Status</span>
                                    <Pill
                                        label={getStatusLabel(caseData.status)}
                                        variant={caseData.status.toLowerCase().replace('_', ' ')}
                                    />
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs text-gray-400 font-semibold">Category</span>
                                    <span className="text-sm font-medium text-gray-800">{formatCategory(caseData.category || 'N/A')}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs text-gray-400 font-semibold">Severity</span>
                                    {caseData.severity ? (
                                        <Pill
                                            label={formatCategory(caseData.severity)}
                                            variant={caseData.severity.toLowerCase()}
                                        />
                                    ) : <span className="text-sm text-gray-400">N/A</span>}
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs text-gray-400 font-semibold">Assigned To</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {caseData.assignedTo?.name || <span className="text-gray-400 italic text-xs">Unassigned</span>}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs text-gray-400 font-semibold">Reported By</span>
                                    <span className="text-sm font-medium text-gray-800">{caseData.reportedBy?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs text-gray-400 font-semibold">Created</span>
                                    <span className="text-xs font-medium text-gray-600">
                                        {new Date(caseData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden">
                            <div className="flex items-center gap-2 mb-5">
                                <Clock size={16} className="text-gold" />
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Timeline</h3>
                            </div>

                            <div className="relative ml-2">
                                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                                <div className="space-y-5">
                                    {activities.map((activity, index) => {
                                        const isComment = activity.type === 'COMMENT';
                                        const isEscalation = activity.description?.includes('escalated');
                                        const dotColor = isComment ? 'bg-blue-500' :
                                            isEscalation ? 'bg-amber-500' :
                                                activity.type === 'ASSIGNED' ? 'bg-purple-500' :
                                                    activity.type === 'UNDER_REVIEW' ? 'bg-amber-400' :
                                                        activity.type === 'CLOSED' || activity.type === 'RESOLVED' ? 'bg-gray-400' :
                                                            'bg-gold';

                                        return (
                                            <div key={index} className="relative pl-6">
                                                <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${dotColor}`}></div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800 break-words">
                                                        {isComment ? 'Comment' :
                                                            isEscalation ? 'Escalated' :
                                                                getStatusLabel(activity.type ?? '')}
                                                    </p>
                                                    {(isComment || activity.description) && (
                                                        <p className={`text-xs mt-0.5 break-words whitespace-pre-wrap overflow-hidden ${isComment ? 'text-gray-600 bg-gray-50 px-2 py-1 rounded' : 'text-gray-500'}`}>
                                                            {activity.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {activity.user?.name || 'System'}
                                                    </p>
                                                    <p className="text-xs text-gray-300 mt-0.5">
                                                        {new Date(activity.timestamp).toLocaleString('en-GB', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {activities.length === 0 && (
                                        <p className="text-xs text-gray-400 italic pl-6">No activity recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare size={16} className="text-blue-500" />
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Comments</h3>
                                {caseData.comments && caseData.comments.length > 0 && (
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                        {caseData.comments.length}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {caseData.comments && caseData.comments.length > 0 ? (
                                    caseData.comments.map((c) => (
                                        <div key={c.id} className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-gray-700">{c.user?.name || 'Unknown'}</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(c.createdAt).toLocaleString('en-GB', {
                                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap overflow-hidden">{c.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic text-center py-4">No comments yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {!isClosed && isCurrentAssignee && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                                <div className="flex flex-col gap-2">
                                    <button
                                        id="quick-view-treatment-btn"
                                        onClick={() => setShowTreatmentModal(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brown text-white rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all shadow-sm"
                                    >
                                        <Stethoscope size={13} />
                                        View Treatment Form
                                    </button>
                                    <button
                                        id="quick-refer-hospital-btn"
                                        onClick={() => {
                                            setShowTreatmentModal(true);
                                            setTimeout(() => setTreatmentOutcome('referred'), 100);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brown text-white rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all shadow-sm"
                                    >
                                        <Hospital size={13} />
                                        Refer to Hospital
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== Record Treatment Modal ===== */}
            {showTreatmentModal && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn text-left">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <h3 className="font-bold text-sm text-gray-900">Record treatment</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">Document the first aid treatment provided and outcome.</p>
                            </div>
                            <button
                                onClick={() => setShowTreatmentModal(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Treatment Given */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-3">
                                    Treatment given <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TREATMENT_OPTIONS.map(opt => (
                                        <label
                                            key={opt}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-xs font-medium ${
                                                treatmentGiven.includes(opt)
                                                    ? 'bg-brown/5 border-brown text-brown'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={treatmentGiven.includes(opt)}
                                                onChange={() => toggleTreatment(opt)}
                                                className="accent-brown w-3.5 h-3.5"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Medication / aid provided */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Medication / aid provided</label>
                                <input
                                    type="text"
                                    value={medication}
                                    onChange={e => setMedication(e.target.value)}
                                    placeholder="Non-dispensing only"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                />
                            </div>

                            {/* Treatment Outcome */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-2">
                                    Treatment outcome <span className="text-red-400">*</span>
                                </label>
                                <div className="space-y-2">
                                    <label className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                        treatmentOutcome === 'resolved' ? 'border-brown bg-amber-50/40' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="outcome"
                                            value="resolved"
                                            checked={treatmentOutcome === 'resolved'}
                                            onChange={() => setTreatmentOutcome('resolved')}
                                            className="accent-brown mt-0.5"
                                        />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-800">Resolved on site — no further action</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">Case will be closed automatically.</p>
                                        </div>
                                    </label>
                                    <label className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                        treatmentOutcome === 'referred' ? 'border-brown bg-amber-50/40' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="outcome"
                                            value="referred"
                                            checked={treatmentOutcome === 'referred'}
                                            onChange={() => setTreatmentOutcome('referred')}
                                            className="accent-brown mt-0.5"
                                        />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-800">Referred for further medical attention</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">HR Benefits will be notified for WCL processing.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Referral fields — shown only when referred */}
                            {treatmentOutcome === 'referred' && (
                                <>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                                            Referral facility <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={referralFacility}
                                            onChange={e => setReferralFacility(e.target.value)}
                                            placeholder="e.g. Netcare Milpark Hospital"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Reason for referral</label>
                                        <textarea
                                            value={referralReason}
                                            onChange={e => setReferralReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {/* File upload placeholder */}
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Paperclip size={13} />
                                <span>First Aid Treatment Form upload (demo)</span>
                            </div>

                            {/* Digital signature */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
                                <span className="text-gray-400">Digital signature:</span>
                                <span className="font-semibold text-gray-700">{user?.fullName || user?.email || 'First Aider'}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setTreatmentOutcome('referred');
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition shadow-sm"
                            >
                                <Hospital size={13} />
                                Refer
                            </button>
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    type="button"
                                    onClick={() => setShowTreatmentModal(false)}
                                    className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveTreatment}
                                    disabled={savingTreatment}
                                    className="flex items-center gap-1.5 px-5 py-2 bg-brown hover:bg-opacity-90 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                                >
                                    {savingTreatment ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                                    Upload &amp; Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Incident Modal Popup */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn text-left">
                        {/* Modal Header */}
                        <div className="bg-brown text-white px-5 py-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <CheckCircle size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Close case</h3>
                                    <p className="text-[10px] text-white/80 mt-0.5">Final confirmation — this will lock the incident.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCloseModal(false);
                                    setClosureNote('');
                                    setLessonsLearned('');
                                    setClosureConfirmed(false);
                                    setClosureType('Resolved by First Aid');
                                }}
                                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition shrink-0"
                                title="Close"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {/* Closure Type */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Closure Type
                                </label>
                                <select
                                    value={closureType}
                                    onChange={(e) => setClosureType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown transition-all"
                                >
                                    <option value="Resolved by First Aid">Resolved by First Aid</option>
                                    <option value="Resolved by Investigation">Resolved by Investigation</option>
                                    <option value="Referred and Completed">Referred and Completed</option>
                                    <option value="False Alarm">False Alarm</option>
                                </select>
                            </div>

                            {/* Closure Note */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Closure Note <span className="text-red-400">*</span>
                                    <span className="ml-2 text-gray-400 font-normal normal-case">{closureNote.length}/50</span>
                                </label>
                                <textarea
                                    value={closureNote}
                                    onChange={(e) => setClosureNote(e.target.value)}
                                    placeholder="Enter details of treatment administered, patient condition, and resolution..."
                                    rows={4}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown transition-all resize-none"
                                />
                            </div>

                            {/* Lessons Learned */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Lessons Learned
                                </label>
                                <textarea
                                    value={lessonsLearned}
                                    onChange={(e) => setLessonsLearned(e.target.value)}
                                    placeholder="What can be improved or learned from this incident?"
                                    rows={2}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown transition-all resize-none"
                                />
                            </div>

                            {/* Confirmation checkbox */}
                            <div className="flex items-start gap-2">
                                <input
                                    id="close-confirm"
                                    type="checkbox"
                                    checked={closureConfirmed}
                                    onChange={(e) => setClosureConfirmed(e.target.checked)}
                                    className="mt-0.5 accent-brown"
                                />
                                <label htmlFor="close-confirm" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                                    I confirm this case can be closed and all parties have been informed.
                                </label>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="px-5 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-150">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCloseModal(false);
                                    setClosureNote('');
                                    setLessonsLearned('');
                                    setClosureConfirmed(false);
                                    setClosureType('Resolved by First Aid');
                                }}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseCase}
                                disabled={closing || !closureConfirmed}
                                className="flex items-center gap-1.5 px-5 py-2 bg-brown hover:bg-opacity-90 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                            >
                                {closing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                Close Case
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Escalation Modal */}
            <EscalationModal
                isOpen={showEscalation}
                onClose={() => setShowEscalation(false)}
                caseId={caseData.id}
                currentRole="SECURITY_PRACTITIONER"
                currentUserId={user?.id || ''}
                onSuccess={() => {
                    showSuccess('Case escalated successfully.');
                    if (id) {
                        fetchCaseDetails(id);
                        fetchTimeline(id);
                    }
                }}
            />
        </DashboardLayout>
    );
};

export default FirstAiderCaseAction;
