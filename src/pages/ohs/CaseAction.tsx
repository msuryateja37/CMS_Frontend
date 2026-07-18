import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Input } from 'antd';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import { formatCategory } from '../../utils/formatters';
import {
    ArrowLeft, Clock, FileText, MapPin, Calendar, Building2,
    User, AlertCircle, Shield, Users, Upload,
    Send, Loader2, MessageSquare, CheckCircle,
    X, ArrowUpRight, Plus
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import EscalationModal from '../../components/incident/EscalationModal';
import { ApprovalsTab } from '../../components/incident/ApprovalsTab';
import { SignatureInput } from '../../components/common/SignatureInput';

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
    critical: { bg: 'bg-subtle-red', text: 'text-brand-red', dot: 'bg-brand-red' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    medium: { bg: 'bg-light-yellow', text: 'text-yellow-800', dot: 'bg-brand-yellow' },
    low: { bg: 'bg-light-gold', text: 'text-brown', dot: 'bg-[#21FC95]' },
};

interface TimelineActivity {
    id?: string;
    category?: string;
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    description?: string;
    user?: { name: string };
    timestamp: string;
}

function timelineEntryTitle(a: TimelineActivity): string {
    const cat = a.category;
    if (cat === 'PLAN') return 'Incident plan';
    if (cat === 'COMMENT' || a.type === 'COMMENT') return 'Comment';
    if (cat === 'CORRECTIVE_ACTION') {
        return a.type === 'CORRECTIVE_UPDATED'
            ? 'Corrective action updated'
            : 'Corrective action added';
    }
    if (cat === 'APPROVAL') {
        return a.type === 'APPROVAL_UPDATED'
            ? 'Approval / recommendation updated'
            : 'Approval / recommendation recorded';
    }
    if (cat === 'APPROVAL_FILE') return 'Approval document added';
    if (cat === 'EVIDENCE') return 'Evidence uploaded';
    if (cat === 'STATUS') return getStatusLabel(a.type ?? '');
    if (a.description?.toLowerCase().includes('escalat')) return 'Escalated';
    return getStatusLabel(a.type ?? '');
}

function timelineDotClass(a: TimelineActivity): string {
    const cat = a.category;
    if (cat === 'PLAN') return 'bg-indigo-500';
    if (cat === 'COMMENT' || a.type === 'COMMENT') return 'bg-blue-500';
    if (cat === 'CORRECTIVE_ACTION') return 'bg-gold-500';
    if (cat === 'APPROVAL' || cat === 'APPROVAL_FILE') return 'bg-violet-500';
    if (cat === 'EVIDENCE') return 'bg-cyan-500';
    if (cat === 'STATUS') {
        const t = (a.type ?? '').toUpperCase();
        if (t === 'ASSIGNED') return 'bg-purple-500';
        if (t === 'UNDER_REVIEW') return 'bg-amber-400';
        if (t === 'CLOSED' || t === 'RESOLVED') return 'bg-gray-400';
        return 'bg-gold';
    }
    if (a.description?.toLowerCase().includes('escalat')) return 'bg-amber-500';
    return 'bg-gold';
}

interface ActionCase extends Case {
    hrStatus?: string;
    hrAssignedTo?: { name: string };
}

const CaseAction: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const state = location.state as Record<string, unknown> | null;
    const fromPath = state?.from as string | undefined;
    const backTarget = fromPath === 'pool' ? '/ohs/pool' : fromPath === 'my-cases' ? '/ohs/my-cases' : '/ohs/dashboard';
    const backLabel = fromPath === 'pool' ? 'Back' : fromPath === 'my-cases' ? 'Back to Assigned Incidents' : 'Back to Dashboard';

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mergeCase = useCallback((patch: Partial<Case>) => {
        setCaseData((prev) => (prev ? { ...prev, ...patch } : prev));
    }, []);



    // Activity timeline
    const [activities, setActivities] = useState<TimelineActivity[]>([]);

    // Corrective Action form
    const [newActionText, setNewActionText] = useState('');
    const [submittingAction, setSubmittingAction] = useState(false);

    // Comment form
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);

    const [incidentPlan, setIncidentPlan] = useState('');
    const [editingPlan, setEditingPlan] = useState(false);
    const [submittingPlan, setSubmittingPlan] = useState(false);

    // Evidence upload
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Send back to supervisor
    const [sendingBack, setSendingBack] = useState(false);
    const [closingCase, setClosingCase] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closureNotes, setClosureNotes] = useState('');

    // Success message
    const [successMsg, setSuccessMsg] = useState('');

    // Escalation modal
    const [showEscalation, setShowEscalation] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState('details');

    // Annexure 1 form states
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [annexData, setAnnexData] = useState<any>(null);
    const [loadingAnnex, setLoadingAnnex] = useState(false);
    const [savingAnnex, setSavingAnnex] = useState(false);

    // Form toggle states
    const [showActionForm, setShowActionForm] = useState(false);
    const [showEvidenceForm, setShowEvidenceForm] = useState(false);



    const [actionPatchingId, setActionPatchingId] = useState<string | null>(null);

    const TABS = [
        { id: 'details', label: 'Details of the case' },
        ...(caseData?.category === 'health' ? [{ id: 'investigation', label: 'Investigation' }] : []),
        { id: 'actions', label: 'Corrective actions' },
        { id: 'evidence', label: 'Attachments / evidence' },
        { id: 'approvals', label: 'Approvals / recommendations' },
        { id: 'comments', label: 'Comments' },
        { id: 'timeline', label: 'Timeline' },
    ];

    useEffect(() => {
        if (id) {
            fetchCaseDetails(id);
            fetchTimeline(id);
        }
    }, [id]);

    useEffect(() => {
        if (id && activeTab === 'investigation') {
            fetchAnnexDetails(id);
        }
    }, [id, activeTab]);

    const fetchAnnexDetails = async (caseId: string) => {
        try {
            setLoadingAnnex(true);
            const data = await casesService.getAnnexureOne(caseId);
            setAnnexData(data);
        } catch (err) {
            console.error('Error loading Annexure 1:', err);
        } finally {
            setLoadingAnnex(false);
        }
    };

    const fetchCaseDetails = async (caseId: string, showLoader = true) => {
        try {
            if (showLoader && !caseData) setLoading(true);
            const data = await casesService.getCaseById(caseId);
            setCaseData(data);
            if (data.incidentPlan) setIncidentPlan(data.incidentPlan);
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

    const handleSaveAnnex = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !annexData) return;
        try {
            setSavingAnnex(true);
            await casesService.updateAnnexureOne(id, annexData);
            showSuccess('Annexure 1 form details updated successfully.');
            void fetchAnnexDetails(id);
        } catch (err) {
            console.error('Error saving Annexure 1:', err);
            setError('Failed to save Annexure 1 details.');
        } finally {
            setSavingAnnex(false);
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !id) return;
        try {
            setSubmittingComment(true);
            const created = await casesService.addComment(id, comment.trim());
            setComment('');
            setShowCommentForm(false);
            setCaseData((prev) => {
                if (!prev) return prev;
                const existing = prev.comments ?? [];
                return {
                    ...prev,
                    comments: [...existing, created],
                };
            });
            showSuccess('Comment added successfully.');
            void fetchTimeline(id);
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSavePlan = async () => {
        if (!id) return;
        setSubmittingPlan(true);
        try {
            const updated = await casesService.update(id, { incidentPlan });
            mergeCase({ incidentPlan: updated.incidentPlan ?? incidentPlan });
            showSuccess('Incident plan updated successfully.');
            setEditingPlan(false);
            void fetchTimeline(id);
        } catch (err) {
            console.error('Error saving plan:', err);
            setError('Failed to save incident plan.');
        } finally {
            setSubmittingPlan(false);
        }
    };

    const handleAddCorrectiveAction = async () => {
        if (!newActionText.trim() || !id || !caseData) return;
        try {
            setSubmittingAction(true);
            const created = await casesService.addCorrectiveAction(id, newActionText.trim());
            setCaseData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    correctiveActions: [...(prev.correctiveActions ?? []), created],
                };
            });
            showSuccess('Corrective action added successfully.');
            setNewActionText('');
            setShowActionForm(false);
        } catch (err) {
            console.error('Error adding corrective action:', err);
            setError('Failed to add corrective action.');
        } finally {
            setSubmittingAction(false);
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
        const count = selectedFiles.length;
        try {
            setUploadingFiles(true);
            const appended: NonNullable<Case['evidence']> = [];
            for (const file of selectedFiles) {
                const uploaded = await casesService.uploadFile(file, id);
                const userRole = user?.role?.name?.toLowerCase()?.replace(/_/g, ' ')?.replace(/\s+/g, ' ')?.trim();
                const isOHS = userRole === 'ohs practitioner';
                const isSecurity = userRole === 'security practitioner';
                const isAdmin = userRole === 'admin' || userRole === 'system administrator';

                const roleName = isSupervisor ? 'Supervisor' :
                    isOHS ? 'OHS Practitioner' :
                        isSecurity ? 'Security Practitioner' :
                            isAdmin ? 'Admin' : 'Employee';

                const row = await casesService.addEvidence(id, {
                    fileUrl: uploaded.url,
                    fileType: file.type,
                    fileName: file.name,
                    uploaderRole: roleName,
                });
                appended.push({
                    id: row.id,
                    fileUrl: row.fileUrl,
                    fileType: row.fileType,
                    fileName: file.name,
                    uploaderRole: roleName,
                    createdAt: row.uploadedAt,
                });
            }
            setSelectedFiles([]);
            setCaseData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    evidence: [...(prev.evidence ?? []), ...appended],
                };
            });
            showSuccess(`${count} file(s) uploaded successfully.`);
            void fetchTimeline(id);
        } catch (err) {
            console.error('Error uploading evidence:', err);
            setError('Failed to upload evidence.');
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleOpenCloseModal = () => {
        if (!caseData) return;
        const inApprovalStage = 
            caseData.status === 'UNDER_PSSC_RECOMMENDATION' || 
            caseData.status === 'UNDER_DEP_DIRECTOR_RECOMMENDATION' || 
            caseData.status === 'UNDER_DIRECTOR_RECOMMENDATION' || 
            caseData.status === 'DIRECTOR_APPROVAL';

        if (inApprovalStage) {
            alert('The case is currently in the recommendation/approval stage.');
            return;
        }
        setClosureNotes('');
        setShowCloseModal(true);
    };

    const handleConfirmCloseCase = async () => {
        if (!id) return;
        try {
            setClosingCase(true);
            setShowCloseModal(false);
            
            // Add closure comment if provided
            if (closureNotes.trim()) {
                await casesService.addComment(id, `Closure Notes: ${closureNotes.trim()}`);
            }

            const updated = await casesService.closeCase(id);
            mergeCase({ status: updated.status ?? 'CLOSED' });
            showSuccess('Incident closed successfully.');
            void fetchTimeline(id);
        } catch (err) {
            console.error('Error closing incident:', err);
            setError('Failed to close incident.');
        } finally {
            setClosingCase(false);
        }
    };

    const patchCorrectiveActionRow = async (
        actionId: string,
        patch: { status?: string; dueDate?: string | null; notes?: string | null; actionText?: string },
    ) => {
        if (!id) return;
        try {
            setActionPatchingId(actionId);
            const updated = await casesService.updateCorrectiveAction(id, actionId, patch);
            setCaseData((prev) => {
                if (!prev?.correctiveActions) return prev;
                return {
                    ...prev,
                    correctiveActions: prev.correctiveActions.map((a) =>
                        a.id === actionId ? { ...a, ...updated } : a,
                    ),
                };
            });
        } catch (err) {
            console.error('Error updating corrective action:', err);
            setError('Failed to update corrective action.');
        } finally {
            setActionPatchingId(null);
        }
    };



    const getSeverityStyle = (severity?: string) => {
        if (!severity) return severityConfig.medium;
        return severityConfig[severity.toLowerCase()] || severityConfig.medium;
    };

    if (loading) {
        return (
            <DashboardLayout title="Case Details" description="Loading..." breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Cases Under Review", path: "/ohs/cases-review" }, { label: "Loading..." }]}>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error && !caseData) {
        return (
            <DashboardLayout title="Case Details" description="Error" breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Cases Under Review", path: "/ohs/cases-review" }, { label: "Error" }]}>
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
    const isUnderReview = caseData.status === 'UNDER_REVIEW';
    const userRole = user?.role?.name?.toLowerCase()?.replace(/_/g, ' ')?.replace(/\s+/g, ' ')?.trim();
    const isSupervisor = userRole === 'supervisor';
    const isAdmin = userRole === 'admin' || userRole === 'system administrator';
    const isOHS = userRole === 'ohs practitioner';
    const isOHSNational = user?.role?.name?.toLowerCase().replace(/\s+/g, '_') === 'ohs_national_office';
    const isCurrentAssignee = user?.id === caseData.assignedTo?.id;
    const isDirectorApproved = caseData?.approvals?.some((a: any) => 
        a.roleName === 'Director' || 
        a.roleName === 'Provincial Security Coordinator' || 
        a.roleName === 'PSSC Coordinator'
    ) || false;
    const hasOhsGivenRecommendation = 
        caseData.status === 'UNDER_PSSC_RECOMMENDATION' || 
        caseData.status === 'UNDER_DEP_DIRECTOR_RECOMMENDATION' || 
        caseData.status === 'UNDER_DIRECTOR_RECOMMENDATION' || 
        caseData.status === 'DIRECTOR_APPROVAL';

    const canEdit = !isClosed && (isCurrentAssignee || isSupervisor || isAdmin) && !hasOhsGivenRecommendation;

    // Practitioner-only actions
    const canAddAction = !isClosed && isOHS && isCurrentAssignee && !hasOhsGivenRecommendation;
    const canAddEvidence = !isClosed && isOHS && isCurrentAssignee && !hasOhsGivenRecommendation;
    const canAddApproval = !isClosed && isOHS && isCurrentAssignee && !hasOhsGivenRecommendation;



    return (
        <DashboardLayout
            title={`Case ${caseData.incidentNumber}`}
            description="Case Details"
            breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Cases Under Review", path: "/ohs/cases-review" }, { label: caseData?.incidentNumber || "Case Details" }]}
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

                {/* Top Bar: Back + Action */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(backTarget)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={18} />
                        <span>{backLabel}</span>
                    </button>

                    {!isClosed && !isUnderReview && isCurrentAssignee && (
                        <div className="flex items-center gap-3">
                            {(!isOHS || isOHSNational) && (
                                <button
                                    onClick={() => setShowEscalation(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all font-semibold text-sm"
                                >
                                    <ArrowUpRight size={16} />
                                    Escalate
                                </button>
                            )}
                            <button
                                onClick={handleOpenCloseModal}
                                disabled={closingCase || (isOHS && !isDirectorApproved)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isOHS && !isDirectorApproved ? "Close button will be activated after the Director has approved" : ""}
                            >
                                {closingCase ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                Close Incident
                            </button>
                        </div>
                    )}

                    {!isClosed && !isUnderReview && !isCurrentAssignee && (
                        caseData.assignedTo ? (
                            <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm">
                                <Shield size={16} />
                                Assigned to {caseData.assignedTo?.name || 'another practitioner'}
                            </span>
                        ) : (
                            <button
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        await casesService.pickupCase(caseData.id);
                                        showSuccess('Case self-assigned successfully.');
                                        fetchCaseDetails(caseData.id);
                                        fetchTimeline(caseData.id);
                                    } catch {
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
                        )
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
                </div>

                {/* Header Card (Always visible) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
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

                {/* Parallel Flow Banner — visible for forwarded health incidents */}
                {caseData.status === 'FORWARDED_TO_OHS_AND_HR' && (
                    <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl p-5">
                        <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Users size={14} /> Parallel Processing — OHS &amp; HR Tracks
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* OHS Track */}
                            <div className="bg-white rounded-xl border border-purple-100 p-4">
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-2">OHS Investigation Track</p>
                                <div className="flex items-center gap-3">
                                    <Pill label={getStatusLabel(caseData.status)} variant={caseData.status.toLowerCase().replace(/_/g, ' ')} />
                                    <span className="text-sm text-gray-700">
                                        {caseData.assignedTo
                                            ? <><span className="text-gray-400">Assigned to:</span> <strong>{caseData.assignedTo.name}</strong></>
                                            : <span className="text-orange-600 font-semibold">Awaiting OHS pickup</span>
                                        }
                                    </span>
                                </div>
                            </div>
                            {/* HR Track */}
                            <div className="bg-white rounded-xl border border-purple-100 p-4">
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mb-2">HR Documentation Track</p>
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const extCase = caseData as ActionCase | null;
                                        const hrStatus = extCase?.hrStatus;
                                        const hrAssignedTo = extCase?.hrAssignedTo;
                                        const colorMap: Record<string, string> = {
                                            HR_UNASSIGNED: 'bg-gray-100 text-gray-600',
                                            HR_ASSIGNED: 'bg-blue-100 text-blue-700',
                                            HR_UNDER_REVIEW: 'bg-amber-100 text-amber-700',
                                            HR_APPROVED: 'bg-green-100 text-green-700',
                                        };
                                        const labelMap: Record<string, string> = {
                                            HR_UNASSIGNED: 'Unassigned',
                                            HR_ASSIGNED: 'Assigned',
                                            HR_UNDER_REVIEW: 'Under Review',
                                            HR_APPROVED: 'Approved',
                                        };
                                        return <>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorMap[hrStatus ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {labelMap[hrStatus ?? ''] ?? (hrStatus ?? 'Unknown')}
                                            </span>
                                            <span className="text-sm text-gray-700">
                                                {hrAssignedTo
                                                    ? <><span className="text-gray-400">Assigned to:</span> <strong>{hrAssignedTo.name}</strong></>
                                                    : <span className="text-orange-600 font-semibold">Awaiting HR pickup</span>
                                                }
                                            </span>
                                        </>;
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-b border-gray-200 px-6">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-gold text-gold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tabs Content */}
                    <div className="p-6">
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {isClosed && (() => {
                                        const { closedByName, closedAt, commentsText } = (() => {
                                            const closedActivity = activities.find(t => t.type === 'CLOSED' || t.type === 'RESOLVED');
                                            const closureComment = activities.find(t => t.type === 'COMMENT' && t.description?.startsWith('[Closure Note]'));
                                            
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
                                    {/* Description Card */}
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                                        <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                            {caseData.description || 'No description provided.'}
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
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
                                            {caseData.natureOfInjury && (
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                                                        <Activity size={12} /> Nature of Injury
                                                    </label>
                                                    <p className="text-sm font-medium text-gray-850">{caseData.natureOfInjury}</p>
                                                </div>
                                            )}
                                            {caseData.bodyPartAffected && (
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
                                                        <Activity size={12} /> Body Part Affected
                                                    </label>
                                                    <p className="text-sm font-medium text-gray-850">{caseData.bodyPartAffected}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Map View */}
                                    {(caseData.latitude || caseData.longitude) && (
                                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
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

                                <div className="space-y-6">
                                    {/* Quick Info Card */}
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Info</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-xs text-gray-500 font-semibold">Status</span>
                                                <Pill
                                                    label={getStatusLabel(caseData.status)}
                                                    variant={caseData.status.toLowerCase().replace('_', ' ')}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-xs text-gray-500 font-semibold">Category</span>
                                                <span className="text-sm font-medium text-gray-800">{formatCategory(caseData.category || 'N/A')}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-xs text-gray-500 font-semibold">Severity</span>
                                                {caseData.severity ? (
                                                    <Pill
                                                        label={formatCategory(caseData.severity)}
                                                        variant={caseData.severity.toLowerCase()}
                                                    />
                                                ) : <span className="text-sm text-gray-400">N/A</span>}
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-xs text-gray-500 font-semibold">Assigned To</span>
                                                <span className="text-sm font-medium text-gray-800">
                                                    {caseData.assignedTo?.name || <span className="text-gray-400 italic text-xs">Unassigned</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-xs text-gray-500 font-semibold">Reported By</span>
                                                <span className="text-sm font-medium text-gray-800">{caseData.reportedBy?.name || 'Unknown'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-xs text-gray-500 font-semibold">Created</span>
                                                <span className="text-xs font-medium text-gray-600">
                                                    {new Date(caseData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'investigation' && (
                            <div className="space-y-6 max-w-4xl w-full">
                                {loadingAnnex ? (
                                    <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                        Loading Annexure 1...
                                    </div>
                                ) : !annexData ? (
                                    <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl">
                                        Failed to load Annexure 1 data.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSaveAnnex} className="space-y-6">
                                        {/* Part A Card */}
                                        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4 animate-fadeIn">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">PART A: RECORDING OF INCIDENT</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Name of Employer</label>
                                                    <input
                                                        type="text"
                                                        value={annexData.employerName || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, employerName: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Name of Affected Person</label>
                                                    <input
                                                        type="text"
                                                        value={annexData.affectedName || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, affectedName: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Identity Number of Affected Person</label>
                                                    <input
                                                        type="text"
                                                        value={annexData.affectedIdNumber || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, affectedIdNumber: e.target.value })}
                                                        placeholder="e.g. 8501015024083"
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Date of Incident</label>
                                                        <input
                                                            type="date"
                                                            value={annexData.dateOfIncident || ''}
                                                            onChange={(e) => setAnnexData({ ...annexData, dateOfIncident: e.target.value })}
                                                            className="w-full px-2 py-1.5 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Time of Incident</label>
                                                        <input
                                                            type="time"
                                                            value={annexData.timeOfIncident || ''}
                                                            onChange={(e) => setAnnexData({ ...annexData, timeOfIncident: e.target.value })}
                                                            className="w-full px-2 py-1.5 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Parts of Body Affected</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Neck, Eye, Finger, Hand, Foot, Leg"
                                                        value={annexData.bodyPartsAffected || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, bodyPartsAffected: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Effect on Person</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Sprains, Contusion, Fracture, Unconsciousness"
                                                        value={annexData.effectOnPerson || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, effectOnPerson: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Expected Period of Disablement</label>
                                                <div className="flex flex-wrap gap-4 mt-1">
                                                    {['0-13 days', '2-4 weeks', '4-16 weeks', '16-52 weeks', 'Killed'].map(p => (
                                                        <label key={p} className="flex items-center gap-2 text-xs font-medium text-gray-650 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="disablementPeriod"
                                                                value={p}
                                                                checked={annexData.disablementPeriod === p}
                                                                onChange={() => setAnnexData({ ...annexData, disablementPeriod: p })}
                                                                className="h-3.5 w-3.5 text-[#884616] focus:ring-[#884616]"
                                                            />
                                                            <span>{p}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Description of Occupational Disease</label>
                                                    <textarea
                                                        rows={2}
                                                        value={annexData.occupationalDiseaseDesc || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, occupationalDiseaseDesc: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Machine / Process Involved</label>
                                                    <textarea
                                                        rows={2}
                                                        value={annexData.machineProcess || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, machineProcess: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Reported to Commissioner?</label>
                                                    <select
                                                        value={annexData.reportedToCommissioner === null ? '' : String(annexData.reportedToCommissioner)}
                                                        onChange={(e) => setAnnexData({ ...annexData, reportedToCommissioner: e.target.value === 'true' })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none"
                                                    >
                                                        <option value="">Select Option</option>
                                                        <option value="true">Yes</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Reported to Police (SAPS)?</label>
                                                    <select
                                                        value={annexData.reportedToPolice === null ? '' : String(annexData.reportedToPolice)}
                                                        onChange={(e) => setAnnexData({ ...annexData, reportedToPolice: e.target.value === 'true' })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none"
                                                    >
                                                        <option value="">Select Option</option>
                                                        <option value="true">Yes</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">SAPS Office & Reference</label>
                                                    <input
                                                        type="text"
                                                        value={annexData.sapsOfficeRef || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, sapsOfficeRef: e.target.value })}
                                                        placeholder="e.g. Pretoria CAS 123/05"
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Part B Card */}
                                        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4 animate-fadeIn">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">PART B: INVESTIGATION OF INCIDENT</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Name of Investigator</label>
                                                    <input
                                                        type="text"
                                                        value={annexData.investigatorName || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, investigatorName: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Designation</label>
                                                    <input
                                                        type="text"
                                                        value={annexData.investigatorDesignation || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, investigatorDesignation: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Date of Investigation</label>
                                                    <input
                                                        type="date"
                                                        value={annexData.investigationDate || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, investigationDate: e.target.value })}
                                                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs font-semibold outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Short Description of Incident</label>
                                                <textarea
                                                    rows={2}
                                                    value={annexData.incidentShortDesc || ''}
                                                    onChange={(e) => setAnnexData({ ...annexData, incidentShortDesc: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Suspected Cause of Incident</label>
                                                <textarea
                                                    rows={2}
                                                    value={annexData.suspectedCause || ''}
                                                    onChange={(e) => setAnnexData({ ...annexData, suspectedCause: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Recommended Steps to Prevent Recurrence</label>
                                                <textarea
                                                    rows={2}
                                                    value={annexData.recommendedSteps || ''}
                                                    onChange={(e) => setAnnexData({ ...annexData, recommendedSteps: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <SignatureInput
                                                        label="Investigator Signature"
                                                        value={annexData.investigatorSignature || ''}
                                                        onChange={(val) => setAnnexData({ ...annexData, investigatorSignature: val })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Signature Date</label>
                                                    <input
                                                        type="date"
                                                        value={annexData.investigatorSigDate || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, investigatorSigDate: e.target.value })}
                                                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs font-semibold outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Part C Card */}
                                        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4 animate-fadeIn">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">PART C: ACTION TAKEN BY EMPLOYER</h3>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Remarks & Actions Taken</label>
                                                <textarea
                                                    rows={2}
                                                    value={annexData.employerRemarks || ''}
                                                    onChange={(e) => setAnnexData({ ...annexData, employerRemarks: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <SignatureInput
                                                        label="Employer Signature"
                                                        value={annexData.employerSignature || ''}
                                                        onChange={(val) => setAnnexData({ ...annexData, employerSignature: val })}
                                                        placeholder="Type name to sign"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={annexData.employerSigDate || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, employerSigDate: e.target.value })}
                                                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs font-semibold outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Part D Card */}
                                        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4 animate-fadeIn">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">PART D: SHE COMMITTEE REMARKS</h3>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Committee Remarks</label>
                                                <textarea
                                                    rows={2}
                                                    value={annexData.committeeRemarks || ''}
                                                    onChange={(e) => setAnnexData({ ...annexData, committeeRemarks: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-250 rounded-lg text-xs font-semibold outline-none focus:border-[#884616]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <SignatureInput
                                                        label="Chairperson Signature"
                                                        value={annexData.committeeChairpersonSignature || ''}
                                                        onChange={(val) => setAnnexData({ ...annexData, committeeChairpersonSignature: val })}
                                                        placeholder="Type name to sign"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={annexData.committeeChairpersonSigDate || ''}
                                                        onChange={(e) => setAnnexData({ ...annexData, committeeChairpersonSigDate: e.target.value })}
                                                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs font-semibold outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={savingAnnex}
                                                className="px-6 py-2.5 bg-brown text-white font-bold rounded-xl hover:bg-opacity-95 shadow-sm text-xs transition disabled:opacity-50 active:scale-[0.98]"
                                            >
                                                {savingAnnex ? 'Saving Details...' : 'Save Annexure 1 Details'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {activeTab === 'actions' && (
                            <div className="space-y-6 max-w-4xl w-full">
                                {/* Immediate Actions */}
                                {(() => {
                                    const rawActions = caseData.immediateActions;
                                    const defaultMsg = (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-400 font-medium text-sm">No immediate actions are added</p>
                                        </div>
                                    );
                                    if (!rawActions || !rawActions.trim()) return defaultMsg;
                                    try {
                                        const parsed = JSON.parse(rawActions);
                                        if (Array.isArray(parsed)) {
                                            const cleanActions = parsed.map(a => typeof a === 'string' ? a.trim() : String(a).trim()).filter(Boolean);
                                            if (cleanActions.length === 0) return defaultMsg;
                                            return (
                                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Immediate Actions Taken</h4>
                                                    <ul className="list-disc pl-5 space-y-1.5 text-gray-750 text-sm font-medium">
                                                        {cleanActions.map((action, idx) => (
                                                            <li key={idx}>{action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        }
                                    } catch {}
                                    const singleAction = rawActions.trim();
                                    if (singleAction === '[]' || !singleAction) return defaultMsg;
                                    return (
                                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Immediate Actions Taken</h4>
                                            <ul className="list-disc pl-5 space-y-1.5 text-gray-750 text-sm font-medium">
                                                <li>{singleAction}</li>
                                            </ul>
                                        </div>
                                    );
                                })()}

                                {/* Corrective actions (tracked) + original report */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tracked corrective actions</h3>
                                        {canAddAction && (
                                            <button
                                                onClick={() => setShowActionForm(!showActionForm)}
                                                className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                            >
                                                <Plus size={16} />
                                                {showActionForm ? 'Cancel' : 'New Action'}
                                            </button>
                                        )}
                                    </div>

                                    {showActionForm && canAddAction && (
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-700 mb-4">Create new corrective action</h4>
                                            <textarea
                                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent min-h-[100px] mb-4"
                                                placeholder="Describe the corrective action, verification, or follow-up required..."
                                                value={newActionText}
                                                onChange={(e) => setNewActionText(e.target.value)}
                                            ></textarea>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setShowActionForm(false)}
                                                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleAddCorrectiveAction}
                                                    disabled={submittingAction || !newActionText.trim()}
                                                    className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                                                >
                                                    {submittingAction ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                                    Add action
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {caseData.correctiveActions && caseData.correctiveActions.length > 0 ? (
                                        <div className="flex flex-col gap-4">
                                            {caseData.correctiveActions.map((act) => (
                                                <div key={act.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{act.actionText}</p>
                                                    <div className="flex flex-wrap gap-3 items-end">
                                                        <div className="min-w-[140px]">
                                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Status</label>
                                                            <select
                                                                disabled={!canAddAction || actionPatchingId === act.id}
                                                                value={act.status ?? 'pending'}
                                                                onChange={(e) =>
                                                                    void patchCorrectiveActionRow(act.id, { status: e.target.value })
                                                                }
                                                                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="in_progress">In progress</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </div>
                                                        <div className="min-w-[160px]">
                                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Due date</label>
                                                            <input
                                                                type="date"
                                                                disabled={!canAddAction || actionPatchingId === act.id}
                                                                value={act.dueDate ? act.dueDate.slice(0, 10) : ''}
                                                                onChange={(e) =>
                                                                    void patchCorrectiveActionRow(act.id, {
                                                                        dueDate: e.target.value || null,
                                                                    })
                                                                }
                                                                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                                                            />
                                                        </div>
                                                        {actionPatchingId === act.id && (
                                                            <Loader2 size={16} className="animate-spin text-gold shrink-0" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Notes / verification</label>
                                                        <textarea
                                                            key={`${act.id}-notes-${act.updatedAt ?? ''}`}
                                                            disabled={!canAddAction || actionPatchingId === act.id}
                                                            defaultValue={act.notes ?? ''}
                                                            onBlur={(e) => {
                                                                const v = e.target.value.trim();
                                                                if (v !== (act.notes ?? '').trim()) {
                                                                    void patchCorrectiveActionRow(act.id, { notes: v || null });
                                                                }
                                                            }}
                                                            rows={2}
                                                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                                                            placeholder="Evidence reference, verification, owner..."
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200 mb-4">
                                            <p className="text-gray-400 font-medium text-sm">No tracked corrective actions yet. Add actions above as the investigation progresses.</p>
                                        </div>
                                    )}

                                    {caseData.otherActions ? (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Original report — additional actions</h4>
                                            {(() => {
                                                try {
                                                    const actions = JSON.parse(caseData.otherActions!);
                                                    if (Array.isArray(actions)) {
                                                        return (
                                                            <div className="flex flex-col gap-2">
                                                                {actions.map((action: string, idx: number) => (
                                                                    <div key={idx} className="bg-white/80 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed">
                                                                        {action}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return <p className="text-gray-600 text-sm leading-relaxed">{caseData.otherActions}</p>;
                                                } catch {
                                                    return <p className="text-gray-600 text-sm leading-relaxed">{caseData.otherActions}</p>;
                                                }
                                            })()}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {activeTab === 'evidence' && (
                            <div className="space-y-6 max-w-4xl w-full">
                                {/* Incident Plan Section */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Incident Plan</h3>
                                        {canEdit && (
                                            <button
                                                onClick={() => setEditingPlan(!editingPlan)}
                                                className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                            >
                                                {editingPlan ? 'Cancel' : (caseData.incidentPlan ? 'Edit Plan' : 'Add Plan')}
                                            </button>
                                        )}
                                    </div>

                                    {editingPlan && canEdit ? (
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <p className="text-xs text-gray-500 mb-3">Use this editor for the full incident response plan, containment, communication, and follow-up steps.</p>
                                            <Input.TextArea
                                                className="!min-h-[280px] !text-sm"
                                                placeholder="Write the complete plan for this incident (response, roles, timelines, verification)..."
                                                value={incidentPlan}
                                                onChange={(e) => setIncidentPlan(e.target.value)}
                                                rows={16}
                                                showCount
                                                maxLength={20000}
                                            />
                                            <div className="flex justify-end gap-3 mt-4">
                                                <button
                                                    onClick={() => setEditingPlan(false)}
                                                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSavePlan}
                                                    disabled={submittingPlan || !incidentPlan.trim()}
                                                    className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                                                >
                                                    {submittingPlan ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                    Save Plan
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            {caseData.incidentPlan ? (
                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{caseData.incidentPlan}</p>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-gray-400 font-medium text-sm">No incident plan recorded yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Evidence Section */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Uploaded Attachments</h3>
                                        {canAddEvidence && (
                                            <button
                                                onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                                                className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                            >
                                                <Plus size={16} />
                                                {showEvidenceForm ? 'Cancel' : 'Add Evidence'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Practitioner Actions — Upload */}
                                    {showEvidenceForm && canAddEvidence && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-700 mb-4">Upload New Evidence</h4>
                                            <div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                                />

                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 text-center cursor-pointer hover:border-gold/40 hover:bg-gold/5 transition-all"
                                                >
                                                    <Upload className="mx-auto text-gray-300 mb-2" size={28} />
                                                    <p className="text-sm text-gray-500 font-medium">Click to select files</p>
                                                    <p className="text-xs text-gray-400 mt-1 mb-4">Images, PDF, Word, Excel supported</p>
                                                    <button type="button" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                                        Browse Files
                                                    </button>
                                                </div>

                                                {/* Selected Files List */}
                                                {selectedFiles.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {selectedFiles.map((file, idx) => (
                                                            <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <FileText size={14} className="text-gray-400 shrink-0" />
                                                                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                                                    <span className="text-xs text-gray-400 shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                                                </div>
                                                                <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 shrink-0 ml-2">
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <div className="flex justify-end mt-3">
                                                            <button
                                                                onClick={handleUploadEvidence}
                                                                disabled={uploadingFiles}
                                                                className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                                                            >
                                                                {uploadingFiles ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {caseData.evidence && caseData.evidence.length > 0 ? (
                                        <div className="space-y-6">
                                            {(() => {
                                                const normalizeRoleName = (role?: string): string => {
                                                    if (!role) return 'Employee';
                                                    const lower = role.toLowerCase().trim();
                                                    if (lower === 'other' || lower === 'employee') return 'Employee';
                                                    if (lower === 'supervisor') return 'Supervisor';
                                                    if (lower.includes('ohs')) return 'OHS Practitioner';
                                                    if (lower.includes('security')) return 'Security Practitioner';
                                                    if (lower === 'admin') return 'Admin';
                                                    return role.split(' ')
                                                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                                        .join(' ');
                                                };

                                                const roles = Array.from(new Set(caseData.evidence?.map(e =>
                                                    normalizeRoleName(e.uploaderRole)
                                                ) || []));
                                                // Sort roles to have a consistent order
                                                const sortedRoles = roles.sort((a, b) => {
                                                    const order: Record<string, number> = { 'Employee': 1, 'Supervisor': 2, 'OHS Practitioner': 3, 'Security Practitioner': 4, 'Admin': 5 };
                                                    return (order[a] || 99) - (order[b] || 99);
                                                });

                                                return sortedRoles.map(role => {
                                                    const roleDocs = caseData.evidence?.filter(e => {
                                                        return normalizeRoleName(e.uploaderRole) === role;
                                                    });
                                                    if (!roleDocs || roleDocs.length === 0) return null;

                                                    return (
                                                        <div key={role} className="mb-6 last:mb-0">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${role === 'Employee' ? 'bg-blue-50 text-blue-700' :
                                                                        role === 'Supervisor' ? 'bg-gray-200 text-gray-700' :
                                                                            role === 'OHS Practitioner' ? 'bg-amber-50 text-amber-700' :
                                                                                role === 'Security Practitioner' ? 'bg-indigo-50 text-indigo-700' :
                                                                                    role === 'Admin' ? 'bg-purple-50 text-purple-700' :
                                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {role}
                                                                </span>
                                                                <div className="h-px flex-1 bg-gray-200" />
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {roleDocs.map((file, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={file.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-gold/50 hover:shadow-sm transition-all group"
                                                                    >
                                                                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-gold shrink-0">
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
                                                });
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                            <FileText className="mx-auto text-gray-300 mb-2" size={28} />
                                            <p className="text-gray-400 font-medium text-sm">No evidence uploaded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'approvals' && (
                            <div className="max-w-4xl w-full">
                                <ApprovalsTab
                                    caseId={id || ''}
                                    caseData={caseData}
                                    canEdit={canAddApproval}
                                    user={user}
                                    onSuccess={() => {
                                        fetchCaseDetails(id || '', false);
                                        fetchTimeline(id || '');
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="space-y-6 max-w-4xl w-full">
                                {/* Comments Section */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare size={16} className="text-blue-500" />
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Discussion History</h3>
                                            {caseData.comments && caseData.comments.length > 0 && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                    {caseData.comments.length}
                                                </span>
                                            )}
                                        </div>
                                        {canEdit && (
                                            <button

                                                onClick={() => setShowCommentForm(!showCommentForm)}
                                                className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                            >
                                                <Plus size={16} />
                                                {showCommentForm ? 'Cancel' : 'Add Comment'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Practitioner Actions — Comment */}
                                    {showCommentForm && canEdit && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-700 mb-4">Add Comment / Notes</h4>
                                            <div>
                                                <textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder="Document your findings, actions taken, or notes about this case..."
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none bg-gray-50"
                                                    rows={4}
                                                />
                                                <div className="flex justify-end mt-3">
                                                    <button
                                                        onClick={() => void handleAddComment()}
                                                        disabled={!comment.trim() || submittingComment}
                                                        className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                        Post Comment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {caseData.comments && caseData.comments.length > 0 ? (
                                            caseData.comments.map((c) => (
                                                <div key={c.id} className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-gray-700">{c.user?.name || 'Unknown'}</span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(c.createdAt).toLocaleString('en-GB', {
                                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed">{c.comment}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                                <MessageSquare className="mx-auto text-gray-300 mb-2" size={24} />
                                                <p className="text-xs text-gray-400 font-medium">No comments yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="space-y-6 max-w-2xl">
                                {/* Timeline Card */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Clock size={16} className="text-gold" />
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Activity Timeline</h3>
                                    </div>

                                    <div className="relative ml-2">
                                        <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                                        <div className="space-y-6">
                                            {activities.map((activity, index) => {
                                                const isComment = activity.category === 'COMMENT' || activity.type === 'COMMENT';
                                                const showBody = isComment || (activity.description && activity.description.trim().length > 0);
                                                const dotColor = timelineDotClass(activity);

                                                return (
                                                    <div key={activity.id ?? `act-${index}`} className="relative pl-6">
                                                        <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${dotColor}`}></div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {timelineEntryTitle(activity)}
                                                            </p>
                                                            {showBody && (
                                                                <p className={`text-xs mt-1 ${isComment ? 'text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg' : 'text-gray-500'}`}>
                                                                    {activity.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[11px] font-medium text-gray-400">
                                                                    {activity.user?.name || 'System'}
                                                                </span>
                                                                <span className="text-[10px] text-gray-300 px-1">•</span>
                                                                <span className="text-[11px] text-gray-400">
                                                                    {new Date(activity.timestamp).toLocaleString('en-GB', {
                                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Escalation Modal */}
            <EscalationModal
                isOpen={showEscalation}
                onClose={() => setShowEscalation(false)}
                caseId={caseData.id}
                currentRole="OHS_PRACTITIONER"
                currentUserId={user?.id || ''}
                onSuccess={() => {
                    showSuccess('Case escalated successfully.');
                    if (id) {
                        fetchCaseDetails(id, false);
                        fetchTimeline(id);
                    }
                }}
            />

            {/* Close Incident Modal */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center animate-fadeIn p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp relative">
                        <button
                            type="button"
                            onClick={() => setShowCloseModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center pb-2 border-b border-gray-100">
                            <h3 className="text-base font-black text-gray-800 uppercase tracking-wider text-red">Close Incident</h3>
                            <p className="text-xs text-gray-500 mt-2 font-bold">Are you sure you want to close this incident?</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block">Closure Notes (optional)</label>
                            <textarea
                                value={closureNotes}
                                onChange={(e) => setClosureNotes(e.target.value)}
                                placeholder="Enter details about the resolution or closure notes..."
                                className="w-full text-xs border border-gray-250 rounded-xl p-3 outline-none focus:border-[#884616] min-h-[100px] bg-white font-medium"
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowCloseModal(false)}
                                className="px-4 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={closingCase}
                                onClick={handleConfirmCloseCase}
                                className="px-5 py-2.5 bg-red text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5"
                            >
                                {closingCase ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                Close Incident
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CaseAction;
