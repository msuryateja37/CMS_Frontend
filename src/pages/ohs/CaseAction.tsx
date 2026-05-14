import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
    critical: { bg: 'bg-subtle-red', text: 'text-brand-red', dot: 'bg-brand-red' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    medium: { bg: 'bg-light-yellow', text: 'text-yellow-800', dot: 'bg-brand-yellow' },
    low: { bg: 'bg-light-green', text: 'text-dark-green', dot: 'bg-green' },
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
    type?: string;
    description?: string;
    user?: { name: string };
    timestamp: string;
}

const CaseAction: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Activity timeline
    const [activities, setActivities] = useState<TimelineActivity[]>([]);

    // Corrective Action form
    const [newActionText, setNewActionText] = useState('');
    const [submittingAction, setSubmittingAction] = useState(false);

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

    // Tab state
    const [activeTab, setActiveTab] = useState('details');

    // Form toggle states
    const [showActionForm, setShowActionForm] = useState(false);
    const [showEvidenceForm, setShowEvidenceForm] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);

    // Approvals upload state
    const approvalFileInputRef = useRef<HTMLInputElement>(null);
    const [selectedApprovalRole, setSelectedApprovalRole] = useState<string | null>(null);

    const handleApprovalUploadClick = (role: string) => {
        setSelectedApprovalRole(role);
        approvalFileInputRef.current?.click();
    };

    const handleApprovalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !selectedApprovalRole) return;
        
        // Mock success for now until backend is connected
        showSuccess(`Uploaded document for ${selectedApprovalRole} successfully.`);
        if (approvalFileInputRef.current) approvalFileInputRef.current.value = '';
    };

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

    const handleAddCorrectiveAction = async () => {
        if (!newActionText.trim() || !id || !caseData) return;
        try {
            setSubmittingAction(true);
            let currentActions: string[] = [];
            if (caseData.otherActions) {
                try {
                    currentActions = JSON.parse(caseData.otherActions);
                } catch {
                    currentActions = [caseData.otherActions];
                }
            }
            const updatedActions = [...currentActions, newActionText.trim()];
            const actionsString = JSON.stringify(updatedActions);
            
            await casesService.update(id, { otherActions: actionsString });
            showSuccess('Corrective action added successfully.');
            setNewActionText('');
            setShowActionForm(false);
            fetchCaseDetails(id);
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
        try {
            setUploadingFiles(true);
            for (const file of selectedFiles) {
                const uploaded = await casesService.uploadFile(file, id);
                await casesService.addEvidence(id, {
                    fileUrl: uploaded.url,
                    fileType: file.type,
                    fileName: file.name,
                    uploaderRole: 'OHS Practitioner',
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
        if (!id || !caseData) return;

        // Check if evidence exists (Compulsory requirement)
        if (!caseData.evidence || caseData.evidence.length === 0) {
            setError('Evidence submission is compulsory. Please upload evidence before submitting for review.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

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

    const getSeverityStyle = (severity?: string) => {
        if (!severity) return severityConfig.medium;
        return severityConfig[severity.toLowerCase()] || severityConfig.medium;
    };

    if (loading) {
        return (
            <DashboardLayout title="Case Details" description="Loading..." breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Cases Under Review", path: "/ohs/cases-review" }, { label: "Loading..." }]}>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
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
    const isSupervisor = user?.role?.name?.toLowerCase() === 'supervisor';
    const isAdmin = user?.role?.name?.toLowerCase() === 'admin';
    const isCurrentAssignee = user?.id === caseData.assignedTo?.id;
    const canEdit = !isClosed && (isCurrentAssignee || isSupervisor || isAdmin);

    const provinceName = caseData.building?.province?.name || '';
    const isProvincial = provincialNames.includes(provinceName);

    return (
        <DashboardLayout
            title={`Case ${caseData.incidentNumber}`}
            description="Case Details"
            breadcrumbs={[{ label: "Dashboard", path: "/ohs/dashboard" }, { label: "Cases Under Review", path: "/ohs/cases-review" }, { label: caseData?.incidentNumber || "Case Details" }]}
        >
            <div className="max-w-7xl mx-auto">
                {/* Success Banner */}
                {successMsg && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
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
                                className="flex items-center gap-2 px-5 py-2.5 bg-dark-green text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
                            >
                                {sendingBack ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Submit for Review
                            </button>
                        </div>
                    )}

                    {!isClosed && !isUnderReview && !isCurrentAssignee && (
                        <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm">
                            <Shield size={16} />
                            Assigned to {caseData.assignedTo?.name || 'another practitioner'}
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
                                            ? 'border-green text-green'
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
                            <div className="space-y-6 max-w-4xl">
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

                                {/* Corrective Actions Placeholder */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Long-term Corrective Actions</h3>
                                        {canEdit && (
                                            <button 
                                                onClick={() => setShowActionForm(!showActionForm)}
                                                className="flex items-center gap-2 px-4 py-2 bg-dark-green text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                            >
                                                <Plus size={16} />
                                                {showActionForm ? 'Cancel' : 'New Action'}
                                            </button>
                                        )}
                                    </div>

                                    {showActionForm && canEdit && (
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-700 mb-4">Create New Action</h4>
                                            <textarea
                                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent min-h-[100px] mb-4"
                                                placeholder="Describe the long-term corrective action..."
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
                                                    className="flex items-center gap-2 px-4 py-2 bg-dark-green text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                                                >
                                                    {submittingAction ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                                    Add Action
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {caseData.otherActions ? (
                                        <div>
                                            {(() => {
                                                try {
                                                    const actions = JSON.parse(caseData.otherActions);
                                                    if (Array.isArray(actions)) {
                                                        return (
                                                            <div className="flex flex-col gap-3">
                                                                {actions.map((action: string, idx: number) => (
                                                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                                                                        <div className="w-6 h-6 rounded-full bg-green/10 text-dark-green flex items-center justify-center shrink-0 mt-0.5">
                                                                            <span className="text-xs font-bold">{idx + 1}</span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-700 leading-relaxed">{action}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return <p className="text-gray-700 text-sm leading-relaxed">{caseData.otherActions}</p>;
                                                } catch {
                                                    return <p className="text-gray-700 text-sm leading-relaxed">{caseData.otherActions}</p>;
                                                }
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                            <p className="text-gray-400 font-medium text-sm">No long-term corrective actions recorded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'evidence' && (
                            <div className="space-y-6 max-w-4xl">
                                {/* Evidence Section */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Uploaded Attachments</h3>
                                        {canEdit && (
                                            <button 
                                                onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                                                className="flex items-center gap-2 px-4 py-2 bg-dark-green text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                            >
                                                <Plus size={16} />
                                                {showEvidenceForm ? 'Cancel' : 'Add Evidence'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Practitioner Actions — Upload */}
                                    {showEvidenceForm && canEdit && (
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
                                                    className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 text-center cursor-pointer hover:border-green/40 hover:bg-green/5 transition-all"
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
                                                                className="flex items-center gap-2 px-4 py-2 bg-dark-green text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
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
                                            {['Employee', 'Supervisor', 'OHS Practitioner', 'Other'].map(role => {
                                                const roleDocs = caseData.evidence?.filter(e =>
                                                    role === 'Other'
                                                        ? !e.uploaderRole || !['Employee', 'Supervisor', 'OHS Practitioner'].includes(e.uploaderRole)
                                                        : e.uploaderRole === role
                                                );
                                                if (!roleDocs || roleDocs.length === 0) return null;

                                                return (
                                                    <div key={role}>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${role === 'Employee' ? 'bg-blue-50 text-blue-700' :
                                                                role === 'Supervisor' ? 'bg-light-green text-dark-green' :
                                                                    role === 'OHS Practitioner' ? 'bg-amber-50 text-amber-700' :
                                                                        'bg-gray-200 text-gray-600'
                                                                }`}>
                                                                {role}
                                                            </span>
                                                            <div className="h-px flex-1 bg-gray-200" />
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {roleDocs.map((file, idx) => (
                                                                <a
                                                                    key={idx}
                                                                    href={file.fileUrl?.match(/^\s*(javascript|data|vbscript):/i) ? '#' : file.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-green/50 hover:shadow-sm transition-all group"
                                                                >
                                                                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-green shrink-0">
                                                                        <FileText size={18} />
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <p className="text-sm font-medium text-gray-700 truncate group-hover:text-green">
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
                                        <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                            <FileText className="mx-auto text-gray-300 mb-2" size={28} />
                                            <p className="text-gray-400 font-medium text-sm">No evidence uploaded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'approvals' && (
                            <div className="space-y-6 max-w-4xl">
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 text-center">
                                    <Shield className="mx-auto text-gray-300 mb-3" size={32} />
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Director Approvals & Recommendations</h4>
                                    <p className="text-gray-500 text-sm mb-6">Upload manual approvals and recommendations provided by directors.</p>
                                    
                                    <input 
                                        type="file" 
                                        ref={approvalFileInputRef} 
                                        className="hidden" 
                                        onChange={handleApprovalFileSelect} 
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    />

                                    {isProvincial && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start">
                                                <h5 className="font-bold text-sm text-gray-800 mb-1">Provincial Security Coordinator</h5>
                                                <p className="text-xs text-gray-500 mb-4">Upload recommendations report</p>
                                                {canEdit && (
                                                    <button 
                                                        onClick={() => handleApprovalUploadClick('Provincial Security Coordinator')}
                                                        className="mt-auto flex items-center gap-2 px-3 py-1.5 bg-dark-green text-white text-xs font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                                    >
                                                        <Upload size={14} /> Upload Document
                                                    </button>
                                                )}
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start">
                                                <h5 className="font-bold text-sm text-gray-800 mb-1">Chief Director</h5>
                                                <p className="text-xs text-gray-500 mb-4">Upload final approved report</p>
                                                {canEdit && (
                                                    <button 
                                                        onClick={() => handleApprovalUploadClick('Chief Director (Provincial)')}
                                                        className="mt-auto flex items-center gap-2 px-3 py-1.5 bg-dark-green text-white text-xs font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                                    >
                                                        <Upload size={14} /> Upload Document
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!isProvincial && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start">
                                                <h5 className="font-bold text-sm text-gray-800 mb-1">Assistant Director</h5>
                                                <p className="text-xs text-gray-500 mb-4">Upload recommendations report</p>
                                                {canEdit && (
                                                    <button 
                                                        onClick={() => handleApprovalUploadClick('Assistant Director')}
                                                        className="mt-auto flex items-center gap-2 px-3 py-1.5 bg-dark-green text-white text-xs font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                                    >
                                                        <Upload size={14} /> Upload Document
                                                    </button>
                                                )}
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start">
                                                <h5 className="font-bold text-sm text-gray-800 mb-1">Director</h5>
                                                <p className="text-xs text-gray-500 mb-4">Upload recommendations report</p>
                                                {canEdit && (
                                                    <button 
                                                        onClick={() => handleApprovalUploadClick('Director')}
                                                        className="mt-auto flex items-center gap-2 px-3 py-1.5 bg-dark-green text-white text-xs font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                                    >
                                                        <Upload size={14} /> Upload Document
                                                    </button>
                                                )}
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start">
                                                <h5 className="font-bold text-sm text-gray-800 mb-1">Chief Director</h5>
                                                <p className="text-xs text-gray-500 mb-4">Upload final approved report</p>
                                                {canEdit && (
                                                    <button 
                                                        onClick={() => handleApprovalUploadClick('Chief Director (National)')}
                                                        className="mt-auto flex items-center gap-2 px-3 py-1.5 bg-dark-green text-white text-xs font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                                                    >
                                                        <Upload size={14} /> Upload Document
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="space-y-6 max-w-4xl">
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
                                                className="flex items-center gap-2 px-4 py-2 bg-dark-green text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
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
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green resize-none bg-gray-50"
                                                    rows={4}
                                                />
                                                <div className="flex justify-end mt-3">
                                                    <button
                                                        onClick={() => {
                                                            handleAddComment();
                                                            setShowCommentForm(false);
                                                        }}
                                                        disabled={!comment.trim() || submittingComment}
                                                        className="flex items-center gap-2 px-4 py-2 bg-dark-green text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <Clock size={16} className="text-green" />
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Activity Timeline</h3>
                                    </div>

                                    <div className="relative ml-2">
                                        <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                                        <div className="space-y-6">
                                            {activities.map((activity, index) => {
                                                const isComment = activity.type === 'COMMENT';
                                                const isEscalation = activity.description?.includes('escalated');
                                                const dotColor = isComment ? 'bg-blue-500' :
                                                    isEscalation ? 'bg-amber-500' :
                                                        activity.type === 'ASSIGNED' ? 'bg-purple-500' :
                                                            activity.type === 'UNDER_REVIEW' ? 'bg-amber-400' :
                                                                activity.type === 'CLOSED' || activity.type === 'RESOLVED' ? 'bg-gray-400' :
                                                                    'bg-green';

                                                return (
                                                    <div key={index} className="relative pl-6">
                                                        <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${dotColor}`}></div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {isComment ? 'Comment' :
                                                                    isEscalation ? 'Escalated' :
                                                                        getStatusLabel(activity.type ?? '')}
                                                            </p>
                                                            {(isComment || activity.description) && (
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
                        fetchCaseDetails(id);
                        fetchTimeline(id);
                    }
                }}
            />
        </DashboardLayout>
    );
};

export default CaseAction;
