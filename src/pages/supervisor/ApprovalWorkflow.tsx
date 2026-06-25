import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, UserPlus, Shield, AlertTriangle, Check, Loader2, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import AssignmentModal from '../../components/incident/AssignmentModal';
import EscalationModal from '../../components/incident/EscalationModal';

const ApprovalWorkflow: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [showEscalation, setShowEscalation] = useState(false);
    const [comments, setComments] = useState<Array<{ id: string; comment: string; user: { id: string; name: string }; createdAt: string }>>([]);

    // Checklist state
    const [checklist, setChecklist] = useState([
        { id: 1, text: 'Incident report reviewed', required: true, checked: false },
        { id: 2, text: 'Risk assessment completed', required: true, checked: false },
        { id: 3, text: 'Evidence documentation verified', required: true, checked: false },
        { id: 4, text: 'Corrective actions identified', required: true, checked: false },
        { id: 5, text: 'Affected personnel notified', required: false, checked: false },
        { id: 6, text: 'Provincial authority informed', required: false, checked: false },
    ]);

    const [decisionNote, setDecisionNote] = useState('');

    useEffect(() => {
        if (id) {
            fetchCaseDetails(id);
            fetchComments(id);
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

    const fetchComments = async (caseId: string) => {
        try {
            const data = await casesService.getComments(caseId);
            setComments(data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const toggleCheck = (itemId: number) => {
        setChecklist(prev => prev.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        ));
    };

    const allRequiredChecked = checklist.filter(i => i.required).every(i => i.checked);
    const checkedCount = checklist.filter(i => i.checked).length;

    const handleApprove = async () => {
        if (!allRequiredChecked || !id) return;

        try {
            setSubmitting(true);
            await casesService.updateStatus(id, 'CLOSED');
            if (decisionNote.trim()) {
                await casesService.addComment(id, decisionNote.trim());
            }
            setSuccessMsg('Case approved and closed successfully.');
            setTimeout(() => navigate('/supervisor/approvals'), 2000);
        } catch (err) {
            console.error('Error approving case:', err);
            setError('Failed to approve case.');
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!id || !decisionNote.trim()) {
            setError('Decision notes are required for rejection.');
            return;
        }

        try {
            setRejecting(true);
            await casesService.updateStatus(id, 'OPEN');
            await casesService.addComment(id, `Rejected: ${decisionNote.trim()}`);
            setSuccessMsg('Case rejected and returned.');
            setTimeout(() => navigate('/supervisor/approvals'), 2000);
        } catch (err) {
            console.error('Error rejecting case:', err);
            setError('Failed to reject case.');
            setRejecting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Approval Workflow" description="Loading..." breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "Approvals", path: "/supervisor/approvals" }, { label: "Loading..." }]}>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-10 h-10 text-gold animate-spin" />
                    <span className="ml-3 text-gray-600">Loading case details...</span>
                </div>
            </DashboardLayout>
        );
    }

    if (!loading && (error && !caseData)) {
        return (
            <DashboardLayout title="Approval Workflow" description="Error" breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "Approvals", path: "/supervisor/approvals" }, { label: "Error" }]}>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error || 'Case not found.'}</span>
                    <button onClick={() => navigate(-1)} className="mt-4 bg-red-100 px-4 py-2 rounded text-red-800 font-bold">Go Back</button>
                </div>
            </DashboardLayout>
        );
    }

    if (!caseData) return null;

    const severityLabel = caseData.severity
        ? caseData.severity.charAt(0).toUpperCase() + caseData.severity.slice(1)
        : 'N/A';
    const severityColor: Record<string, string> = {
        low: 'bg-gold-100 text-gold-700',
        medium: 'bg-amber-100 text-amber-700',
        high: 'bg-orange-500 text-white',
        critical: 'bg-red-500 text-white',
    };
    const sevClass = severityColor[(caseData.severity || '').toLowerCase()] || 'bg-gray-100 text-gray-600';

    return (
        <DashboardLayout
            title="Approval Workflow"
            description={`${caseData.incidentNumber} — ${caseData.category || caseData.type}`}
            breadcrumbs={[{ label: "Dashboard", path: "/supervisor/dashboard" }, { label: "Approvals", path: "/supervisor/approvals" }, { label: caseData.incidentNumber || "Case Details" }]}
        >
            <div className="max-w-6xl mx-auto">
                {/* Success Banner */}
                {successMsg && (
                    <div className="flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-700 px-4 py-3 rounded-xl text-sm font-medium mb-6">
                        <CheckCircle size={16} />
                        {successMsg}
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-6">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Case Details Card - Dynamic Data */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6 text-orange-600 font-bold">
                            <AlertTriangle size={20} />
                            <span>Case Details</span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 mb-6 flex items-center justify-between border border-gray-100">
                            <div>
                                <h4 className="font-bold text-gray-900">{caseData.incidentNumber}</h4>
                                <p className="text-sm text-gray-500">{caseData.category || 'N/A'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm ${sevClass}`}>{severityLabel}</span>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Status', value: caseData.status?.replace(/_/g, ' ') || 'N/A' },
                                { label: 'Severity', value: severityLabel },
                                { label: 'Priority Level', value: caseData.priorityLevel || 'N/A' },
                                { label: 'Incident Date', value: caseData.occurredAt ? new Date(caseData.occurredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' },
                                { label: 'Reported By', value: caseData.reportedBy?.name || 'N/A' },
                                { label: 'Assigned To', value: caseData.assignedTo?.name || 'N/A' },
                                { label: 'Location', value: caseData.building?.name ? `${caseData.building.name}${caseData.building.province?.name ? ', ' + caseData.building.province.name : ''}` : (caseData.location || 'N/A') },
                                { label: 'Department', value: caseData.department?.name || 'N/A' },
                                { label: 'Affected Persons', value: caseData.peopleImpacted != null ? String(caseData.peopleImpacted) : 'N/A' },
                                { label: 'Due Date', value: caseData.dueDate ? new Date(caseData.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' },
                                { label: 'Submitted', value: caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' },
                                { label: 'Escalated', value: caseData.isEscalated ? 'Yes' : 'No' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                                    <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                                    <span className="text-sm text-gray-900 font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Approval Checklist Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-gold-600 font-bold">
                                <Shield size={20} />
                                <span>Approval Checklist</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">{checkedCount}/{checklist.length}</span>
                        </div>

                        <div className="space-y-4">
                            {checklist.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleCheck(item.id)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${item.checked ? 'bg-gold-500 border-gold-500 text-white shadow-sm' : 'border-gray-200 bg-white'}`}>
                                        {item.checked && <Check size={16} strokeWidth={4} />}
                                    </div>
                                    <span className={`text-sm font-medium ${item.checked ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {item.text} {item.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {!allRequiredChecked && (
                            <div className="mt-6 flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                                <AlertTriangle size={14} />
                                <span>All required items must be checked to approve</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Decision Notes Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Decision Notes</h3>
                    <textarea
                        className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-[#BB8F53]/20 focus:outline-none text-sm text-gray-700 placeholder:text-gray-400 resize-none transition-all"
                        placeholder="Provide rationale for your decision (required for rejection)..."
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                    />
                </div>

                {/* Comments */}
                {comments.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Comments ({comments.length})</h3>
                        <div className="space-y-3">
                            {comments.map((c) => (
                                <div key={c.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-800">{c.user?.name || 'N/A'}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(c.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{c.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions Footer */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            disabled={!allRequiredChecked || submitting}
                            onClick={handleApprove}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm
                                ${allRequiredChecked
                                    ? 'bg-[#BB8F53] text-white hover:bg-[#A1743E] scale-[1.02] active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : <CheckCircle size={18} />}
                            Approve
                        </button>
                        <button
                            disabled={rejecting}
                            onClick={handleReject}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all font-bold text-sm shadow-sm disabled:opacity-50"
                        >
                            {rejecting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : <XCircle size={18} />}
                            Reject
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {caseData.assignedTo ? (
                            <>
                                <span
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gold-50 border border-gold-200 text-gold-700 rounded-lg font-bold text-sm cursor-default select-none"
                                >
                                    <CheckCircle size={18} />
                                    Assigned
                                </span>
                                <button
                                    onClick={() => setShowEscalation(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all font-bold text-sm"
                                >
                                    <ArrowUpRight size={18} />
                                    Escalate
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-brown text-white rounded-lg hover:bg-opacity-90 transition-all font-bold text-sm shadow-sm"
                            >
                                <UserPlus size={18} />
                                Assign Practitioner
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-[10px] text-gray-400 mt-6 font-medium flex items-center justify-center gap-1 uppercase tracking-widest whitespace-nowrap">
                    <Shield size={10} />
                    All actions are recorded in the compliance audit trail
                </p>

                {/* Assignment Modal */}
                <AssignmentModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    incidentId={caseData.id}
                    provinceId={caseData.building?.province?.id}
                    onSuccess={() => fetchCaseDetails(caseData.id)}
                />

                {/* Escalation Modal — Supervisor reassigns to different practitioner */}
                <EscalationModal
                    isOpen={showEscalation}
                    onClose={() => setShowEscalation(false)}
                    caseId={caseData.id}
                    currentRole={caseData.type === 'SECURITY_BREACH' ? 'SECURITY_PRACTITIONER' : 'OHS_PRACTITIONER'}
                    currentUserId={caseData.assignedTo?.id || ''}
                    onSuccess={() => {
                        fetchCaseDetails(caseData.id);
                        if (id) fetchComments(id);
                    }}
                />
            </div>
        </DashboardLayout>
    );
};

export default ApprovalWorkflow;
