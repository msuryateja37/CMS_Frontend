import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService from '../../services/cases.service';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import {
    FileText, Users, ArrowLeft, Clock, UserPlus, CheckCircle,
    ArrowUpRight, MapPin, Calendar, Building2, User,
    Shield, MessageSquare, Send, Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useCaseDetails, useCaseTimeline } from '../../hooks/useIncidents';
import AssignmentModal from '../../components/incident/AssignmentModal';
import EscalationModal from '../../components/incident/EscalationModal';
import { formatCategory } from '../../utils/formatters';

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
    critical: { bg: 'bg-subtle-red', text: 'text-brand-red', dot: 'bg-brand-red' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    medium: { bg: 'bg-light-yellow', text: 'text-yellow-800', dot: 'bg-brand-yellow' },
    low: { bg: 'bg-light-green', text: 'text-dark-green', dot: 'bg-green' },
};



const CaseDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Use TanStack Query hooks
    const { data: caseData, isLoading: caseLoading, error: caseError, refetch: refetchDetails } = useCaseDetails(id || '');
    const { data: timeline = [], refetch: refetchTimeline } = useCaseTimeline(id || '');

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [showEscalation, setShowEscalation] = useState(false);
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const handleAddComment = async () => {
        if (!comment.trim() || !id) return;
        try {
            setSubmittingComment(true);
            await casesService.addComment(id, comment.trim());
            setComment('');
            refetchDetails();
            refetchTimeline();
        } catch (err) {
            console.error('Error adding comment:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const isSupervisor = user?.role?.name?.toLowerCase() === 'supervisor';
    const isAssigned = caseData?.status === 'ASSIGNED' || !!caseData?.assignedTo;
    const isClosed = caseData?.status === 'CLOSED' || caseData?.status === 'RESOLVED';

    const getSeverityStyle = (severity?: string) => {
        if (!severity) return severityConfig.medium;
        return severityConfig[severity.toLowerCase()] || severityConfig.medium;
    };



    if (caseLoading) {
        return (
            <DashboardLayout title="Case Details" description="Loading..." breadcrumbs={[{ label: "Dashboard" }, { label: "Case Details" }]}>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (caseError || !caseData) {
        return (
            <DashboardLayout title="Case Details" description="Error" breadcrumbs={[{ label: "Dashboard" }, { label: "Error" }]}>
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                    <p className="font-bold">Error</p>
                    <p className="text-sm mt-1">{(caseError as any)?.message || 'Case not found.'}</p>
                    <button onClick={() => navigate(-1)} className="mt-3 bg-red-100 px-4 py-2 rounded-lg text-red-800 font-bold text-sm">Go Back</button>
                </div>
            </DashboardLayout>
        );
    }

    const sevStyle = getSeverityStyle(caseData.severity);

    return (
        <DashboardLayout
            title={`Case ${caseData.incidentNumber}`}
            description="Case Details"
            breadcrumbs={[{ label: "Dashboard" }, { label: "Case Details" }]}
        >
            <div className="max-w-7xl mx-auto">
                {/* Top Bar: Back + Actions */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    {isSupervisor && !isClosed && (
                        <div className="flex items-center gap-2">
                            {!isAssigned && (
                                <button
                                    onClick={() => setIsAssignModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-dark-green text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm shadow-sm"
                                >
                                    <UserPlus size={16} />
                                    Assign Practitioner
                                </button>
                            )}
                            {isAssigned && (
                                <span
                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-lg font-semibold text-sm cursor-default select-none"
                                >
                                    <CheckCircle size={16} />
                                    Assigned
                                </span>
                            )}
                            <button
                                onClick={() => navigate(`/supervisor/cases/${caseData.id}/approve`)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-green text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm shadow-sm"
                            >
                                <CheckCircle size={16} />
                                Review
                            </button>
                            {isAssigned && (
                                <button
                                    onClick={() => setShowEscalation(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all font-semibold text-sm"
                                >
                                    <ArrowUpRight size={16} />
                                    Escalate
                                </button>
                            )}
                        </div>
                    )}

                    {isSupervisor && isClosed && (
                        <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm">
                            <CheckCircle size={16} />
                            Case Closed
                        </span>
                    )}
                </div>

                {/* Assignment Modal */}
                <AssignmentModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    incidentId={caseData.id}
                    provinceId={caseData.building?.province?.id}
                    onSuccess={() => refetchDetails()}
                />

                {/* Escalation Modal — Supervisor reassigns to different practitioner */}
                <EscalationModal
                    isOpen={showEscalation}
                    onClose={() => setShowEscalation(false)}
                    caseId={caseData.id}
                    currentRole={caseData.type === 'SECURITY_BREACH' ? 'SECURITY_PRACTITIONER' : 'OHS_PRACTITIONER'}
                    currentUserId={caseData.assignedTo?.id || ''}
                    onSuccess={() => {
                        refetchDetails();
                        refetchTimeline();
                    }}
                />

                {/* ====== MAIN 2-COLUMN LAYOUT ====== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN — Main content (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Colored top strip based on severity */}
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

                        {/* Description Card — Prominent on top */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                {caseData.description || 'No description provided.'}
                            </div>
                            {caseData.immediateActions && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Immediate Actions Taken</h4>
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
                            )}
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

                        {/* Evidence Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Evidence & Attachments</h3>
                            {caseData.evidence && caseData.evidence.length > 0 ? (
                                <div className="space-y-6">
                                    {['Employee', 'Supervisor', 'Other'].map(role => {
                                        const roleDocs = caseData.evidence?.filter(e =>
                                            role === 'Other'
                                                ? !e.uploaderRole || !['Employee', 'Supervisor'].includes(e.uploaderRole)
                                                : e.uploaderRole === role
                                        );
                                        if (!roleDocs || roleDocs.length === 0) return null;

                                        return (
                                            <div key={role}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${role === 'Employee' ? 'bg-blue-50 text-blue-700' :
                                                        role === 'Supervisor' ? 'bg-light-green text-dark-green' :
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
                                                            href={file.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-green/30 hover:shadow-sm transition-all group"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-gray-100 text-gray-400 group-hover:text-green shrink-0">
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
                                        src={`https://maps.google.com/maps?q=${caseData.latitude},${caseData.longitude}&z=15&output=embed`}
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <Clock size={16} className="text-green" />
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Timeline</h3>
                            </div>

                            <div className="relative ml-2">
                                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                                <div className="space-y-5">
                                    {timeline.map((activity, index) => {
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
                                                        <p className={`text-xs mt-0.5 ${isComment ? 'text-gray-600 bg-gray-50 px-2 py-1 rounded' : 'text-gray-500'}`}>
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

                                    {timeline.length === 0 && (
                                        <p className="text-xs text-gray-400 italic pl-6">No activity recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        {user?.role?.name?.toLowerCase() !== 'employee' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageSquare size={16} className="text-blue-500" />
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Comments</h3>
                                    {caseData.comments && caseData.comments.length > 0 && (
                                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                            {caseData.comments.length}
                                        </span>
                                    )}
                                </div>

                                {/* Comment Input */}
                                {!isClosed && (
                                    <div className="mb-4">
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Add a comment or note..."
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green resize-none"
                                            rows={3}
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={handleAddComment}
                                                disabled={!comment.trim() || submittingComment}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-green text-white text-xs font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submittingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                Add Comment
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Comments List */}
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
                                                <p className="text-sm text-gray-600 leading-relaxed">{c.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 italic text-center py-4">No comments yet. Add a comment before assigning.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CaseDetails;
