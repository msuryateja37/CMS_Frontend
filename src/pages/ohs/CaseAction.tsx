import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from 'antd';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case, type CaseApproval } from '../../services/cases.service';
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

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
    critical: { bg: 'bg-subtle-red', text: 'text-brand-red', dot: 'bg-brand-red' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    medium: { bg: 'bg-light-yellow', text: 'text-yellow-800', dot: 'bg-brand-yellow' },
    low: { bg: 'bg-light-gold', text: 'text-brown', dot: 'bg-[#21FC95]' },
};

const provincialNames = [
    "Eastern Cape",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "Western Cape"
];

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

const CaseAction: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Success message
    const [successMsg, setSuccessMsg] = useState('');

    // Escalation modal
    const [showEscalation, setShowEscalation] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState('details');

    // Form toggle states
    const [showActionForm, setShowActionForm] = useState(false);
    const [showEvidenceForm, setShowEvidenceForm] = useState(false);



    const [actionPatchingId, setActionPatchingId] = useState<string | null>(null);

    const TABS = [
        { id: 'details', label: 'Details of the case' },
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

    const fetchCaseDetails = async (caseId: string, showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const data = await casesService.getCaseById(caseId);
            setCaseData(data);
            if (data.incidentPlan) setIncidentPlan(data.incidentPlan);
        } catch (err) {
            console.error('Error fetching case details:', err);
            setError('Failed to load case details.');
        } finally {
            if (showLoader) setLoading(false);
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

    const handleSendBackToSupervisor = async () => {
        if (!id || !caseData) return;

        // Check if evidence exists (Compulsory requirement)
        if (!caseData.evidence || caseData.evidence.length === 0) {
            setError('Evidence submission is compulsory. Please upload evidence before submitting for review.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            setSendingBack(true);
            const updated = await casesService.updateStatus(id, 'UNDER_REVIEW');
            mergeCase({ status: updated.status ?? 'UNDER_REVIEW' });
            showSuccess('Case sent back to supervisor for review.');
            void fetchTimeline(id);
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to send case back.');
        } finally {
            setSendingBack(false);
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
    const isSecurity = userRole === 'security practitioner';
    const isPractitioner = isOHS || isSecurity;
    const isCurrentAssignee = user?.id === caseData.assignedTo?.id;
    const canEdit = !isClosed && (isCurrentAssignee || isSupervisor || isAdmin);

    // Practitioner-only actions
    const canAddAction = !isClosed && isOHS && isCurrentAssignee;
    const canAddEvidence = !isClosed && isOHS && isCurrentAssignee;
    const canAddApproval = !isClosed && isOHS && isCurrentAssignee;



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
                        onClick={() => navigate('/ohs/cases-review')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Cases</span>
                    </button>

                    {!isClosed && !isUnderReview && isCurrentAssignee && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowEscalation(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all font-semibold text-sm"
                            >
                                <ArrowUpRight size={16} />
                                Escalate
                            </button>
                            <button
                                onClick={handleSendBackToSupervisor}
                                disabled={sendingBack}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brown text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
                            >
                                {sendingBack ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Submit for Review
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
                                    } catch (err) {
                                        setError('Failed to self-assign case.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg font-semibold text-sm shadow-md transition"
                            >
                                <CheckCircle size={16} />
                                Self Assign Case
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

                        {activeTab === 'actions' && (
                            <div className="space-y-6 max-w-4xl w-full">
                                {/* Immediate Actions */}
                                {caseData.immediateActions ? (
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Immediate Actions Taken</h4>
                                        <div>
                                            {(() => {
                                                try {
                                                    const actions = JSON.parse(caseData.immediateActions);
                                                    if (Array.isArray(actions)) {
                                                        return (
                                                            <div className="flex flex-wrap gap-2">
                                                                {actions.map((action: string, idx: number) => (
                                                                    <span key={idx} className="px-3 py-1.5 text-black text-xs font-medium flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                                                        {action}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return <p className="text-gray-700 text-sm leading-relaxed">{caseData.immediateActions}</p>;
                                                } catch {
                                                    return <p className="text-gray-700 text-sm leading-relaxed">{caseData.immediateActions}</p>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-400 font-medium text-sm">No immediate actions recorded.</p>
                                    </div>
                                )}

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
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                                                                    role === 'Employee' ? 'bg-blue-50 text-blue-700' :
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
        </DashboardLayout>
    );
};

export default CaseAction;
