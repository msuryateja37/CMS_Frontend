import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService from '../../services/cases.service';
import { Pill } from '../../components/common/Pill';
import { getStatusLabel } from '../../data/constants';
import {
    FileText, Users, ArrowLeft, Clock, UserPlus, CheckCircle,
    MapPin, Calendar, Building2, User,
    Shield, MessageSquare, Send, Loader2, Plus, Upload, X, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useCaseDetails, useCaseTimeline } from '../../hooks/useIncidents';
import AssignmentModal from '../../components/incident/AssignmentModal';
import EscalationModal from '../../components/incident/EscalationModal';
import { ApprovalsTab } from '../../components/incident/ApprovalsTab';
import { formatCategory } from '../../utils/formatters';


const TABS = [
    { id: 'details', label: 'Details of the incident' },
    { id: 'actions', label: 'Corrective actions' },
    { id: 'evidence', label: 'Attachments / evidence' },
    { id: 'approvals', label: 'Approvals / recommendations' },
    { id: 'comments', label: 'Comments' },
    { id: 'timeline', label: 'Timeline' },
];

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
    critical: { bg: 'bg-subtle-red', text: 'text-brand-red', dot: 'bg-brand-red' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    medium: { bg: 'bg-light-yellow', text: 'text-yellow-800', dot: 'bg-brand-yellow' },
    low: { bg: 'bg-light-gold', text: 'text-brown', dot: 'bg-[#21FC95]' },
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

    const [activeTab, setActiveTab] = useState('details');
    const [showActionForm, setShowActionForm] = useState(false);
    const [showEvidenceForm, setShowEvidenceForm] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);
    
    // Interaction State
    const [newActionText, setNewActionText] = useState('');
    const [submittingAction, setSubmittingAction] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [actionPatchingId, setActionPatchingId] = useState<string | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Custom wizard states
    const [wizardStep, setWizardStep] = useState<'details' | 'preview'>('details');
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [recommendationText, setRecommendationText] = useState('');
    const [sigType, setSigType] = useState<'profile' | 'draw' | 'upload'>('profile');
    const [tempSigUrl, setTempSigUrl] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [canvasEmpty, setCanvasEmpty] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [submittingWizard, setSubmittingWizard] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [signedDetails, setSignedDetails] = useState<{
        name: string;
        employeeId: string;
        date: string;
        method: string;
        signatureUrl: string;
    } | null>(null);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 4000);
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !id) return;
        try {
            setSubmittingComment(true);
            await casesService.addComment(id, comment.trim());
            setComment('');
            refetchDetails();
            refetchTimeline();
            showSuccess('Comment added successfully.');
        } catch (err) {
            console.error('Error adding comment:', err);
            showError('Failed to add comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const userRole = user?.role?.name?.toLowerCase()?.replace(/_/g, ' ')?.replace(/\s+/g, ' ')?.trim();
    const isSupervisor = userRole === 'supervisor';
    const isAdmin = userRole === 'admin' || userRole === 'system administrator';
    const isOHS = userRole === 'ohs practitioner';
    const isSecurity = userRole === 'security practitioner';
    const isAssigned = caseData?.status === 'ASSIGNED' || !!caseData?.assignedTo;
    const isClosed = caseData?.status === 'CLOSED' || caseData?.status === 'RESOLVED' || caseData?.status === 'COMPLETED';
    const isEscalatedToAdmin = caseData?.status === 'ESCALATED_TO_ADMIN';
    const isCurrentAssignee = user?.id === caseData?.assignedTo?.id;
    const isHR = userRole === 'hr';
    const isUnderReview = caseData?.status === 'UNDER_REVIEW';
    const canAdd = !isClosed && (isCurrentAssignee || isSupervisor || isAdmin);

    // Practitioner-only actions
    const canAddAction = !isClosed && isOHS && isCurrentAssignee;
    const canAddEvidence = !isClosed && isOHS && isCurrentAssignee;
    const canAddApproval = !isClosed && isOHS && isCurrentAssignee;

    const handleAddCorrectiveAction = async () => {
        if (!newActionText.trim() || !id) return;
        try {
            setSubmittingAction(true);
            await casesService.addCorrectiveAction(id, newActionText.trim());
            setNewActionText('');
            setShowActionForm(false);
            showSuccess('Corrective action added successfully.');
            refetchDetails();
            refetchTimeline();
        } catch (err) {
            console.error('Error adding corrective action:', err);
            showError('Failed to add corrective action.');
        } finally {
            setSubmittingAction(false);
        }
    };

    const patchCorrectiveActionRow = async (
        actionId: string,
        patch: {
            actionText?: string;
            status?: string;
            dueDate?: string | null;
            notes?: string | null;
            completedAt?: string | null;
        }
    ) => {
        if (!id) return;
        try {
            setActionPatchingId(actionId);
            await casesService.updateCorrectiveAction(id, actionId, patch);
            showSuccess('Action updated.');
            refetchDetails();
        } catch (err) {
            console.error('Error patching action:', err);
            showError('Failed to update action.');
        } finally {
            setActionPatchingId(null);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (idx: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleUploadEvidence = async () => {
        if (selectedFiles.length === 0 || !id) return;
        try {
            setUploadingFiles(true);
            const roleName = isSupervisor ? 'Supervisor' : 
                             isOHS ? 'OHS Practitioner' : 
                             isSecurity ? 'Security Practitioner' : 
                             isAdmin ? 'Admin' : 'Other';
            
            for (const file of selectedFiles) {
                const uploaded = await casesService.uploadFile(file, id);
                await casesService.addEvidence(id, {
                    fileUrl: uploaded.url,
                    fileType: file.type,
                    fileName: file.name,
                    uploaderRole: roleName,
                });
            }
            setSelectedFiles([]);
            setShowEvidenceForm(false);
            showSuccess('Evidence uploaded successfully.');
            refetchDetails();
            refetchTimeline();
        } catch (err) {
            console.error('Error uploading evidence:', err);
            showError('Failed to upload evidence.');
        } finally {
            setUploadingFiles(false);
        }
    };

    const parseTreatmentRecord = (entry?: string) => {
        if (!entry?.startsWith('[Treatment Record]')) return null;

        const payload = entry.replace('[Treatment Record] ', '');
        const fields = payload.split(' | ');
        const treatmentField = fields.find(field => field.startsWith('Treatments:'))?.replace('Treatments: ', '') || '';
        const medicationField = fields.find(field => field.startsWith('Medication:'))?.replace('Medication: ', '') || '';
        const outcomeField = fields.find(field => field.startsWith('Outcome:'))?.replace('Outcome: ', '') || '';
        const reasonField = fields.find(field => field.startsWith('Reason:'))?.replace('Reason: ', '') || '';

        const treatments = treatmentField
            ? treatmentField.split(',').map(item => item.trim()).filter(Boolean)
            : [];

        let referral = 'None - treated on-site.';
        if (outcomeField.toLowerCase().startsWith('referred to ')) {
            referral = outcomeField.replace(/^Referred to\s+/i, '').trim();
        } else if (outcomeField) {
            referral = outcomeField;
        }

        return {
            treatments,
            medication: medicationField || 'None',
            outcome: outcomeField || 'Unknown',
            referral,
            reason: reasonField || '',
        };
    };

    const latestTreatmentRecord = caseData?.comments
        ? [...caseData.comments]
            .reverse()
            .find((comment) => comment.comment?.startsWith('[Treatment Record]'))
        : null;

    const treatmentRecord = parseTreatmentRecord(latestTreatmentRecord?.comment) || (caseData?.treatmentAdministered ? {
        treatments: [caseData.treatmentAdministered],
        medication: 'Recorded',
        outcome: caseData.treatmentOutcome || 'Unknown',
        referral: caseData.treatmentReferral || 'None - treated on-site.',
        reason: caseData.treatmentReason || '',
    } : null);


    const getSeverityStyle = (severity?: string) => {
        if (!severity) return severityConfig.medium;
        return severityConfig[severity.toLowerCase()] || severityConfig.medium;
    };

    // Canvas drawing logic
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
        setCanvasEmpty(false);
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
                setTempSigUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getProfileSignature = () => {
        if (!user?.id) return null;
        return localStorage.getItem(`user_sig_${user.id}`);
    };

    const handleVerifyOtp = () => {
        if (otpCode.length !== 6) return;
        setVerifyingOtp(true);
        setOtpError(null);
        setTimeout(() => {
            setVerifyingOtp(false);
            setOtpVerified(true);
        }, 1200);
    };

    const handleWizardSignSubmit = () => {
        let finalSigUrl = '';
        let finalMethod = 'Profile Signature';

        if (sigType === 'profile') {
            finalSigUrl = getProfileSignature() || '';
            finalMethod = 'Saved Profile Signature';
        } else if (sigType === 'draw') {
            const canvas = canvasRef.current;
            if (canvas) {
                finalSigUrl = canvas.toDataURL();
            }
            finalMethod = 'Hand-drawn (Canvas)';
        } else {
            finalSigUrl = tempSigUrl || '';
            finalMethod = 'Upload from device';
        }

        if (!finalSigUrl) {
            showError('Signature is required.');
            return;
        }

        setSignedDetails({
            name: user?.fullName || user?.name || (userRole === 'deputy director' ? 'Gauteng Deputy Director' : 'Gauteng Pssc Coordinator'),
            employeeId: user?.employeeNumber || 'EMP-DD-0042',
            date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
            method: finalMethod,
            signatureUrl: finalSigUrl
        });

        setIsSignModalOpen(false);
        setWizardStep('preview');
    };

    const handleFinalSubmit = () => {
        setIsConfirmModalOpen(true);
    };

    const executeFinalSubmit = async () => {
        if (!id) return;
        const isPssc = userRole === 'pssc coordinator';
        try {
            setSubmittingWizard(true);
            setIsConfirmModalOpen(false);
            const nextStatus = isPssc ? 'UNDER_DEP_DIRECTOR_RECOMMENDATION' : 'DIRECTOR_APPROVAL';
            
            // Add approval record
            await casesService.addApproval(id, {
                roleName: isPssc ? 'PSSC Coordinator' : 'Deputy Director',
                recommenderName: signedDetails?.name || user?.fullName || 'Nkosi Manyage',
                recommendationText: recommendationText,
                files: [
                    {
                        fileUrl: signedDetails?.signatureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                        fileName: signedDetails?.method || 'Signature.png',
                        fileType: 'image/png'
                    }
                ]
            });

            // Update case status
            await casesService.updateStatus(id, nextStatus);

            showSuccess('Recommendation submitted successfully.');
            setTimeout(() => {
                if (userRole === 'pssc coordinator') {
                    navigate('/pssc/dashboard');
                } else if (userRole === 'deputy director') {
                    navigate('/deputy/dashboard');
                } else {
                    navigate('/admin/dashboard');
                }
            }, 1500);
        } catch (err) {
            console.error('Error submitting recommendation:', err);
            showError('Failed to submit recommendation.');
        } finally {
            setSubmittingWizard(false);
        }
    };

    const renderPssCDeputyView = () => {
        if (!caseData) return null;

        const isPssc = userRole === 'pssc coordinator';

        // Retrieve existing recommendations
        const ohsApproval = caseData.approvals?.find(
            (ap) => ap.roleName?.toLowerCase() === 'ohs practitioner'
        );
        const psscApproval = caseData.approvals?.find(
            (ap) => ap.roleName?.toLowerCase() === 'provincial security coordinator' || ap.roleName?.toLowerCase() === 'pssc coordinator'
        );
        const deputyApproval = caseData.approvals?.find(
            (ap) => ap.roleName?.toLowerCase() === 'deputy director' || ap.roleName?.toLowerCase() === 'deputy_director'
        );
        const hasAnyRecommendations = !!(ohsApproval || psscApproval || deputyApproval);
        const isPendingRecommendation = 
            (userRole === 'pssc coordinator' && caseData.status === 'UNDER_PSSC_RECOMMENDATION') ||
            (userRole === 'deputy director' && caseData.status === 'UNDER_DEP_DIRECTOR_RECOMMENDATION');

        const isAlreadySubmitted = 
            (userRole === 'pssc coordinator' && caseData.status !== 'UNDER_PSSC_RECOMMENDATION') ||
            (userRole === 'deputy director' && caseData.status !== 'UNDER_DEP_DIRECTOR_RECOMMENDATION' && caseData.status !== 'UNDER_PSSC_RECOMMENDATION');

        const submissionRecord = 
            (userRole === 'deputy director' && deputyApproval) 
                ? deputyApproval 
                : psscApproval;

        const signedByName = signedDetails?.name || submissionRecord?.recommenderName || user?.fullName || (userRole === 'deputy director' ? 'Gauteng Deputy Director' : 'Gauteng Pssc Coordinator');
        const employeeIdVal = signedDetails?.employeeId || submissionRecord?.uploadedBy?.employeeNumber || user?.employeeNumber || 'EMP-DD-0042';
        const signatureDate = signedDetails?.date || (submissionRecord?.createdAt ? new Date(submissionRecord.createdAt).toISOString().split('T')[0].replace(/-/g, '/') : (caseData.updatedAt ? new Date(caseData.updatedAt).toISOString().split('T')[0].replace(/-/g, '/') : '2026/07/17'));
        const signatureMethod = signedDetails?.method || (submissionRecord?.attachments?.[0]?.fileName?.toLowerCase()?.includes('upload') || submissionRecord?.attachments?.[0]?.fileName?.toLowerCase()?.includes('device') ? 'Upload from device' : (submissionRecord?.attachments?.[0]?.fileName?.includes('Profile') ? 'Profile E-Signature' : 'Hand-drawn (Canvas)'));

        const correctiveActionsList = caseData.correctiveActions || [];
        const hasAnyActionItems = correctiveActionsList.length > 0;

        if (wizardStep === 'preview') {
            return (
                <DashboardLayout
                    title={`Incident ${caseData.incidentNumber}`}
                    description="Preview Before Submission"
                    breadcrumbs={[{ label: "Dashboard" }, { label: "Incident Details" }, { label: "Preview" }]}
                >
                    <div className="max-w-4xl mx-auto flex flex-col gap-6 relative">
                        {/* Back Arrow button */}
                        <div className="md:absolute md:-left-14 md:top-2 mb-2 md:mb-0">
                            <button
                                onClick={() => setWizardStep('details')}
                                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                                title="Go Back"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        </div>

                        {/* Preview Banner */}
                        <div className="bg-[#884616] text-white rounded-2xl p-5 shadow-sm">
                            <h2 className="text-base font-black uppercase tracking-wider">Preview Before Submission</h2>
                            <p className="text-xs text-gold-100 mt-1 font-medium">Please review all details carefully before final submission</p>
                        </div>

                        {/* Incident Details Card */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Incident Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-xs font-semibold text-gray-700">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">ID</span>
                                    <span>{caseData.incidentNumber}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Category</span>
                                    <span>{formatCategory(caseData.category)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Province</span>
                                    <span>{caseData.building?.province?.name || 'GP'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Date</span>
                                    <span>{caseData.occurredAt ? new Date(caseData.occurredAt).toLocaleDateString('en-GB') : '—'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Location</span>
                                    <span>{caseData.location || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Reported By</span>
                                    <span>{caseData.reportedBy?.name || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Investigation Details Card */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Investigation Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700 mb-2">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Investigated By</span>
                                    <span>Gauteng Ohs Practitioner — OHS Practitioner, Gauteng</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Investigation Date</span>
                                    <span>{caseData.annexureOne?.investigationDate || (caseData.occurredAt ? new Date(new Date(caseData.occurredAt).getTime() + 86400000).toLocaleDateString('en-GB') : '—')}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Investigation Report</span>
                                <p className="text-xs text-gray-650 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium leading-relaxed font-mono whitespace-pre-wrap">
                                    {caseData.annexureOne?.incidentShortDesc || 'Investigation report not given by OHS practitioner.'}
                                </p>
                            </div>
                            {caseData.annexureOne?.suspectedCause && (
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Suspected Cause</span>
                                    <p className="text-xs text-gray-650 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium leading-relaxed font-mono whitespace-pre-wrap">
                                        {caseData.annexureOne.suspectedCause}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Items Card */}
                        {hasAnyActionItems && (
                            <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Action Items</h3>
                                <div className="space-y-3">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1 font-bold">Tracked Corrective Actions</span>
                                    {correctiveActionsList.map((act) => (
                                        <div key={act.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs font-semibold text-gray-700">
                                            <span>{act.actionText}</span>
                                            <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2.5 py-1 rounded-md">STATUS: {act.status?.toUpperCase() || 'PENDING'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendation Card */}
                        <div className="bg-[#FAF6F0] rounded-2xl border border-gold/20 p-6 space-y-3 shadow-sm">
                            <h3 className="text-xs font-black text-[#884616] uppercase tracking-wider">Your Recommendation</h3>
                            <p className="text-xs font-semibold text-gray-700 italic leading-relaxed">
                                "{recommendationText}"
                            </p>
                        </div>

                        {/* Submission Details Card */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Submission Details</h3>
                            <div className="grid grid-cols-[120px_1fr] gap-x-6 gap-y-3 text-xs font-semibold text-gray-700">
                                <span className="text-gray-450 font-bold">Signed By</span>
                                <span className="text-gray-800 font-bold">{signedByName}</span>
                                <span className="text-gray-450 font-bold">Employee ID</span>
                                <span className="text-gray-800 font-bold">{employeeIdVal}</span>
                                <span className="text-gray-450 font-bold">Date</span>
                                <span className="text-gray-800 font-bold">{signatureDate}</span>
                                <span className="text-gray-450 font-bold">Signature Method</span>
                                <span className="text-gray-800 font-bold">{signatureMethod}</span>
                            </div>
                        </div>

                        {/* Actions footer */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setWizardStep('details')}
                                className="px-5 py-2.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-lg transition"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={submittingWizard}
                                onClick={handleFinalSubmit}
                                className="px-6 py-2.5 bg-[#884616] hover:bg-[#723b12] text-white font-bold text-xs rounded-lg transition shadow flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingWizard ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    userRole === 'pssc coordinator' ? 'Submit to Deputy Director' : 'Submit to Director'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Submission Modal */}
                    {isConfirmModalOpen && (
                        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center animate-fadeIn p-4">
                            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp relative text-center">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Confirm Submission</h3>
                                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                                    {userRole === 'pssc coordinator' 
                                        ? 'Are you sure you want to submit this recommendation to the Deputy Director?' 
                                        : 'Are you sure you want to submit this recommendation to the Director?'}
                                </p>
                                <div className="flex justify-center gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirmModalOpen(false)}
                                        className="px-4 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={executeFinalSubmit}
                                        className="px-5 py-2.5 bg-[#884616] hover:bg-[#723b12] text-white text-xs font-bold rounded-xl transition shadow"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </DashboardLayout>
            );
        }

        return (
            <DashboardLayout
                title={`Incident ${caseData.incidentNumber}`}
                description="Incident Details"
                breadcrumbs={[{ label: "Dashboard" }, { label: "Incident Details" }]}
            >
                <div className="max-w-4xl mx-auto flex flex-col gap-6 relative">
                    {/* Back Arrow button */}
                    <div className="md:absolute md:-left-14 md:top-2 mb-2 md:mb-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                            title="Go Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    {/* Incident Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Incident Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-xs font-semibold text-gray-700">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Incident ID</span>
                                <span>{caseData.incidentNumber}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Category</span>
                                <span>{formatCategory(caseData.category)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Province</span>
                                <span>{caseData.building?.province?.name || 'GP'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Status</span>
                                <span className="text-blue-600 font-bold">{getStatusLabel(caseData.status)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Date</span>
                                <span>{caseData.occurredAt ? new Date(caseData.occurredAt).toLocaleDateString('en-GB') : '—'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Location</span>
                                <span>{caseData.location || '—'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Reported By</span>
                                <span>{caseData.reportedBy?.name || '—'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Assigned To</span>
                                <span>{caseData.assignedTo?.name || 'Gauteng Ohs Practitioner'}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-2 font-bold">Description</span>
                            <p className="text-xs text-gray-700 leading-relaxed font-medium bg-gray-50 border border-gray-100 p-3.5 rounded-xl whitespace-pre-wrap">
                                {caseData.description}
                            </p>
                        </div>
                    </div>

                    {/* Investigation Details Card */}
                    <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Investigation Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Investigated By</span>
                                <span>Gauteng Ohs Practitioner — OHS Practitioner, Gauteng</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">Investigation Date</span>
                                <span>{caseData.annexureOne?.investigationDate || (caseData.occurredAt ? new Date(new Date(caseData.occurredAt).getTime() + 86400000).toLocaleDateString('en-GB') : '—')}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Investigation Report</span>
                            <p className="text-xs text-gray-650 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium leading-relaxed font-mono whitespace-pre-wrap">
                                {caseData.annexureOne?.incidentShortDesc || 'Investigation report not given by OHS practitioner.'}
                            </p>
                        </div>
                        {caseData.annexureOne?.suspectedCause && (
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Suspected Cause</span>
                                <p className="text-xs text-gray-650 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium leading-relaxed font-mono whitespace-pre-wrap">
                                    {caseData.annexureOne.suspectedCause}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Items Card */}
                    {hasAnyActionItems && (
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Action Items</h3>
                            <div className="space-y-3">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1 font-bold">Tracked Corrective Actions</span>
                                {correctiveActionsList.map((act) => (
                                    <div key={act.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs font-semibold text-gray-700">
                                        <span>{act.actionText}</span>
                                        <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2.5 py-1 rounded-md">STATUS: {act.status?.toUpperCase() || 'PENDING'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Existing Recommendations Card */}
                    {hasAnyRecommendations && (
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Existing Recommendations</h3>
                            <div className="space-y-3 font-semibold text-xs text-gray-700 italic">
                                {ohsApproval && (
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl leading-relaxed">
                                        <span className="text-[10px] text-[#884616] font-extrabold uppercase tracking-wide block mb-1">OHS Practitioner Recommendation</span>
                                        "{ohsApproval.recommendationText || 'No recommendation text provided.'}"
                                    </div>
                                )}
                                {psscApproval && (
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl leading-relaxed">
                                        <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wide block mb-1">PSSC Coordinator Recommendation</span>
                                        "{psscApproval.recommendationText || 'No recommendation text provided.'}"
                                    </div>
                                )}
                                {deputyApproval && (
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl leading-relaxed">
                                        <span className="text-[10px] text-green-700 font-extrabold uppercase tracking-wide block mb-1">Deputy Director Recommendation</span>
                                        "{deputyApproval.recommendationText || 'No recommendation text provided.'}"
                                        <span className="text-[10px] text-gray-400 block mt-1 font-bold">— Signed by {deputyApproval.recommenderName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submission Details Card */}
                    {isAlreadySubmitted && (
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 space-y-4 shadow-sm">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Submission Details</h3>
                            <div className="grid grid-cols-[120px_1fr] gap-x-6 gap-y-3 text-xs font-semibold text-gray-700">
                                <span className="text-gray-450 font-bold">Signed By</span>
                                <span className="text-gray-800 font-bold">{signedByName}</span>
                                <span className="text-gray-450 font-bold">Employee ID</span>
                                <span className="text-gray-800 font-bold">{employeeIdVal}</span>
                                <span className="text-gray-450 font-bold">Date</span>
                                <span className="text-gray-800 font-bold">{signatureDate}</span>
                                <span className="text-gray-450 font-bold">Signature Method</span>
                                <span className="text-gray-800 font-bold">{signatureMethod}</span>
                            </div>
                        </div>
                    )}

                    {/* Add Recommendation Card */}
                    {isPendingRecommendation && (
                        <>
                            <div className="bg-white rounded-2xl border border-gold/30 p-6 space-y-4 shadow-sm bg-gradient-to-br from-white to-gold/5">
                                <div>
                                    <h3 className="text-xs font-black text-[#884616] uppercase tracking-wider">Add Recommendation</h3>
                                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                                        Your recommendation will be submitted to the {isPssc ? 'Deputy Director' : 'Director'} for final approval.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block">Enter your recommendations *</label>
                                    <textarea
                                        value={recommendationText}
                                        onChange={(e) => setRecommendationText(e.target.value)}
                                        placeholder="Enter your detailed recommendations based on the investigation findings..."
                                        className="w-full text-xs border border-gray-250 rounded-xl p-3.5 outline-none focus:border-[#884616] min-h-[120px] bg-white font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Next Button Footer */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    disabled={!recommendationText.trim()}
                                    onClick={() => {
                                        // Reset OTP states
                                        setOtpCode('');
                                        setOtpVerified(false);
                                        setOtpError(null);
                                        setIsSignModalOpen(true);
                                    }}
                                    className="px-6 py-2.5 bg-[#884616] hover:bg-[#723b12] text-white font-bold text-xs rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next &gt;
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Sign Before Submission Modal */}
                {isSignModalOpen && (
                    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center animate-fadeIn p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp relative max-h-[90vh]">
                            <button
                                type="button"
                                onClick={() => setIsSignModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center pb-2 border-b border-gray-100">
                                <h3 className="text-base font-black text-gray-800 uppercase tracking-wider">Sign Before Submission</h3>
                                <p className="text-[10px] text-gray-400 mt-1 font-semibold">An e-signature is required to proceed</p>
                            </div>

                            {/* Sign Tabs */}
                            <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setSigType('profile')}
                                    className={`py-2 rounded-lg text-xs font-bold transition text-center ${
                                        sigType === 'profile'
                                            ? 'bg-white text-[#884616] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    Use Profile Signature
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setSigType('draw'); clearCanvas(); }}
                                    className={`py-2 rounded-lg text-xs font-bold transition text-center ${
                                        sigType === 'draw'
                                            ? 'bg-white text-[#884616] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    Draw Signature
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSigType('upload')}
                                    className={`py-2 rounded-lg text-xs font-bold transition text-center ${
                                        sigType === 'upload'
                                            ? 'bg-white text-[#884616] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    Upload Signature
                                </button>
                            </div>

                            {/* Sign Tab Contents */}
                            <div className="min-h-[160px] flex items-center justify-center bg-gray-50/50 border border-gray-150 rounded-xl p-4">
                                {sigType === 'profile' && (() => {
                                    const profSig = getProfileSignature();
                                    if (profSig) {
                                        return (
                                            <div className="flex flex-col items-center gap-2 w-full">
                                                <span className="text-[10px] text-green-700 font-bold">✓ Saved signature loaded from profile</span>
                                                <img src={profSig} alt="Profile Signature" className="max-h-24 bg-white p-2 border border-gray-250 rounded-lg shadow-sm" />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="text-center p-4">
                                            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500 font-bold">No saved signature found in your profile</p>
                                            <p className="text-[10px] text-gray-400 mt-1 font-medium">Please draw or upload one, or save a signature in your Profile tab first.</p>
                                        </div>
                                    );
                                })()}

                                {sigType === 'draw' && (
                                    <div className="flex flex-col items-center gap-3 w-full">
                                        <canvas
                                            ref={canvasRef}
                                            width={460}
                                            height={140}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchEnd={stopDrawing}
                                            className="w-full bg-white border border-gray-250 rounded-xl cursor-crosshair max-w-[460px] shadow-inner"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearCanvas}
                                            className="text-[10px] text-gray-400 hover:text-red border-b border-dashed border-red/40"
                                        >
                                            Clear signature
                                        </button>
                                    </div>
                                )}

                                {sigType === 'upload' && (
                                    <div className="flex flex-col items-center gap-3 w-full">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <label className="px-4 py-2 bg-[#884616] hover:bg-[#723b12] text-white font-bold text-xs rounded-lg transition cursor-pointer shadow">
                                            Choose File
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
                                            <span className="text-[10px] text-gray-400">PNG, JPG recommended</span>
                                        )}
                                        {tempSigUrl && (
                                            <img src={tempSigUrl} alt="Uploaded Signature" className="max-h-20 bg-white p-2 border border-gray-200 rounded-lg shadow-sm" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSignModalOpen(false)}
                                    className="px-4 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    disabled={(sigType === 'profile' && !getProfileSignature()) || (sigType === 'draw' && canvasEmpty) || (sigType === 'upload' && !tempSigUrl)}
                                    onClick={() => {
                                        setIsSignModalOpen(false);
                                        setWizardStep('preview');
                                        
                                        // Save signature details for preview display
                                        let methodStr = 'Profile E-Signature';
                                        let sigUrlVal = getProfileSignature() || '';
                                        if (sigType === 'draw') {
                                            methodStr = 'Hand-drawn (Canvas)';
                                            sigUrlVal = canvasRef.current?.toDataURL() || '';
                                        } else if (sigType === 'upload') {
                                            methodStr = 'Upload from device';
                                            sigUrlVal = tempSigUrl || '';
                                        }
                                        
                                        setSignedDetails({
                                            name: user?.fullName || user?.name || (userRole === 'deputy director' ? 'Gauteng Deputy Director' : 'Gauteng Pssc Coordinator'),
                                            employeeId: user?.employeeNumber || 'EMP-DD-0042',
                                            date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
                                            method: methodStr,
                                            signatureUrl: sigUrlVal
                                        });
                                    }}
                                    className="px-5 py-2.5 bg-[#884616] hover:bg-[#723b12] text-white text-xs font-bold rounded-xl transition shadow disabled:opacity-50"
                                >
                                    Sign &amp; Preview
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Submission Modal */}
                {isConfirmModalOpen && (
                    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center animate-fadeIn p-4">
                        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp relative text-center">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Confirm Submission</h3>
                            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                                {userRole === 'pssc coordinator' 
                                    ? 'Are you sure you want to submit this recommendation to the Deputy Director?' 
                                    : 'Are you sure you want to submit this recommendation to the Director?'}
                            </p>
                            <div className="flex justify-center gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="px-4 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={executeFinalSubmit}
                                    className="px-5 py-2.5 bg-[#884616] hover:bg-[#723b12] text-white text-xs font-bold rounded-xl transition shadow"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        );
    };

    if (caseLoading) {
        return (
            <DashboardLayout title="Incident Details" description="Loading..." breadcrumbs={[{ label: "Dashboard" }, { label: "Incident Details" }]}>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (caseError || !caseData) {
        return (
            <DashboardLayout title="Incident Details" description="Error" breadcrumbs={[{ label: "Dashboard" }, { label: "Error" }]}>
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                    <p className="font-bold">Error</p>
                    <p className="text-sm mt-1">{(caseError as { message?: string })?.message || 'Incident not found.'}</p>
                    <button onClick={() => navigate(-1)} className="mt-3 bg-red-100 px-4 py-2 rounded-lg text-red-800 font-bold text-sm">Go Back</button>
                </div>
            </DashboardLayout>
        );
    }

    const isPsscOrDeputy = userRole === 'pssc coordinator' || userRole === 'deputy director';
    const isPendingRecommendation = 
        (userRole === 'pssc coordinator' && caseData.status === 'UNDER_PSSC_RECOMMENDATION') ||
        (userRole === 'deputy director' && caseData.status === 'UNDER_DEP_DIRECTOR_RECOMMENDATION');

    if (isPsscOrDeputy) {
        return renderPssCDeputyView();
    }

    const sevStyle = getSeverityStyle(caseData.severity);

    return (
        <DashboardLayout
            title={`Incident ${caseData.incidentNumber}`}
            description="Incident Details"
            breadcrumbs={[{ label: "Dashboard" }, { label: "Incident Details" }]}
        >
            <div className="max-w-7xl mx-auto">
                {/* Status Messages */}
                {successMsg && (
                    <div className="mb-4 flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        <CheckCircle size={16} />
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={16} />
                        {errorMsg}
                    </div>
                )}

                {/* Top Bar: Back + Actions */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    {isSupervisor && !isClosed && !isAssigned && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-brown text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm shadow-sm"
                            >
                                <UserPlus size={16} />
                                Assign Practitioner
                            </button>
                        </div>
                    )}

                    {isSupervisor && isClosed && (
                        <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm">
                            <CheckCircle size={16} />
                            Incident Closed
                        </span>
                    )}

                    {/* Admin: reassign a 3-day-escalated case to another province's OHS practitioner */}
                    {isAdmin && isEscalatedToAdmin && (
                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-brown text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-sm shadow-sm"
                        >
                            <UserPlus size={16} />
                            Reassign to OHS (another province)
                        </button>
                    )}

                    {/* Self Assign button for unassigned cases when viewed by any practitioner role */}
                    {!isClosed && !isUnderReview && !caseData.assignedTo && (isOHS || isSecurity || isHR || isAdmin || userRole === 'first aider') && (
                        <button
                            onClick={async () => {
                                try {
                                    await casesService.pickupCase(caseData.id);
                                    showSuccess('Incident self-assigned successfully.');
                                    refetchDetails();
                                    refetchTimeline();
                                } catch {
                                    showError('Failed to self-assign incident.');
                                }
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg font-semibold text-sm shadow-md transition"
                        >
                            <CheckCircle size={16} />
                            Self Assign Incident
                        </button>
                    )}
                </div>

                {/* Assignment Modal */}
                <AssignmentModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    incidentId={caseData.id}
                    provinceId={caseData.building?.province?.id}
                    crossProvince={isAdmin && isEscalatedToAdmin}
                    onSuccess={() => refetchDetails()}
                />

                {/* Escalation Modal */}
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
                                variant={caseData.status ? caseData.status.toLowerCase().replace('_', ' ') : 'default'}
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
                                {formatCategory(caseData.category || caseData.type || 'Untitled Incident')}
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
                                        <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap text-justify">
                                            {caseData.description || 'No description provided.'}
                                        </div>
                                    </div>

                                    {treatmentRecord && (
                                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Treatment Record</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Administered by</span>
                                                    <span className="font-semibold text-gray-800">{latestTreatmentRecord?.user?.name || 'First Aider'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Date / Time</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {latestTreatmentRecord?.createdAt
                                                            ? new Date(latestTreatmentRecord.createdAt).toLocaleString('en-GB', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : '—'}
                                                    </span>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Actions taken</span>
                                                    <span className="font-medium text-gray-700 leading-relaxed block whitespace-pre-wrap">
                                                        {treatmentRecord.treatments.length > 0 ? treatmentRecord.treatments.join(', ') : 'No treatment details recorded.'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Medication / aid provided</span>
                                                    <span className="font-semibold text-gray-800">{treatmentRecord.medication}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Referral</span>
                                                    <span className="font-semibold text-gray-800">{treatmentRecord.referral}</span>
                                                </div>
                                                {treatmentRecord.reason && (
                                                    <div className="md:col-span-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Reason for referral</span>
                                                        <span className="font-medium text-gray-700 leading-relaxed block whitespace-pre-wrap">
                                                            {treatmentRecord.reason}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="md:col-span-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Outcome</span>
                                                    <span className="font-semibold text-gray-800">{treatmentRecord.outcome}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Details Grid */}
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Incident Details</h3>
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
                                                    {caseData.assignedTo?.name || (
                                                        ['North West', 'Eastern Cape', 'Northern Cape'].includes(caseData.province?.name || '') && caseData.category?.toLowerCase() !== 'health' ? (
                                                            <span className="text-gold font-bold text-[13px]">Serviced by National Office (ASD OHS)</span>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Unassigned</span>
                                                        )
                                                    )}
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
                                                    variant={caseData.status ? caseData.status.toLowerCase().replace('_', ' ') : 'default'}
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
                                                    {caseData.assignedTo?.name || (
                                                        ['North West', 'Eastern Cape', 'Northern Cape'].includes(caseData.province?.name || '') && caseData.category?.toLowerCase() !== 'health' ? (
                                                            <span className="text-gold font-bold text-xs">Serviced by National Office (ASD OHS)</span>
                                                        ) : (
                                                            <span className="text-gray-400 italic text-xs">Unassigned</span>
                                                        )
                                                    )}
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

                                 {/* Corrective Actions (Tracked) */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tracked Corrective Actions</h3>
                                        {!isClosed && canAddAction && (
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
                                            <h4 className="text-sm font-bold text-gray-700 mb-4">Create New Action</h4>
                                            <textarea
                                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent min-h-[100px] mb-4"
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
                                                    className="flex items-center gap-2 px-4 py-2 bg-brown text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                                                >
                                                    {submittingAction ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                                    Add Action
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
                                            <p className="text-gray-400 font-medium text-sm">No tracked corrective actions yet.</p>
                                        </div>
                                    )}

                                    {caseData.otherActions && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Original Report Actions</h4>
                                            {(() => {
                                                try {
                                                    const actions = JSON.parse(caseData.otherActions);
                                                    if (Array.isArray(actions)) {
                                                        return (
                                                            <div className="flex flex-col gap-3">
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
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'evidence' && (
                            <div className="space-y-6 max-w-4xl w-full">
                                {/* Evidence Section */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Uploaded Attachments</h3>
                                        {!isClosed && canAddEvidence && (
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
                                    {showEvidenceForm && !isClosed && canAddEvidence && (
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
                                        <div className="space-y-6">                                            {(() => {
                                                const roles = Array.from(new Set(caseData.evidence?.map(e => 
                                                    (!e.uploaderRole || e.uploaderRole === 'Other') ? 'Employee' : e.uploaderRole
                                                ) || []));
                                                // Sort roles to have a consistent order
                                                const sortedRoles = roles.sort((a, b) => {
                                                    const order: Record<string, number> = { 'Employee': 1, 'Supervisor': 2, 'OHS Practitioner': 3, 'Security Practitioner': 4, 'Admin': 5 };
                                                    return (order[a] || 99) - (order[b] || 99);
                                                });

                                                return sortedRoles.map(role => {
                                                    const roleDocs = caseData.evidence?.filter(e => {
                                                        const r = (!e.uploaderRole || e.uploaderRole === 'Other') ? 'Employee' : e.uploaderRole;
                                                        return r === role;
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

                        {activeTab === 'approvals' && caseData && (
                            <div className="max-w-4xl w-full">
                                <ApprovalsTab
                                    caseId={id || ''}
                                    caseData={caseData}
                                    canEdit={canAddApproval}
                                    user={user}
                                    onSuccess={() => {
                                        refetchDetails();
                                        refetchTimeline();
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
                                        {!isClosed && canAdd && (
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
                                    {showCommentForm && !isClosed && canAdd && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                                            <h4 className="text-sm font-bold text-gray-700 mb-4">Add Comment / Notes</h4>
                                            <div>
                                                <textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder="Document your findings, actions taken, or notes about this incident..."
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none bg-gray-50"
                                                    rows={4}
                                                />
                                                <div className="flex justify-end mt-3">
                                                    <button
                                                        onClick={() => {
                                                            handleAddComment();
                                                            setShowCommentForm(false);
                                                        }}
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
                                            {timeline.map((activity, index) => {
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

                                            {timeline.length === 0 && (
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

            </DashboardLayout>
    );
};

export default CaseDetails;
