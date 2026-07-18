import React, { useState, useRef } from 'react';
import casesService, { type Case, type CaseApproval } from '../../services/cases.service';
import { Shield, Plus, Upload, Loader2, Pencil, Trash2, X, CheckCircle, AlertCircle, Send } from 'lucide-react';

const provincialNames = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "Western Cape"
];

const PROVINCIAL_APPROVAL_ROLES = [
    { roleName: 'Provincial Security Coordinator', label: 'Provincial Security Coordinator / Director PSSC for recommendations', hint: 'Recommendations report' },
];

const NATIONAL_APPROVAL_ROLES = [
    { roleName: 'Assistant Director', label: 'Assistant Director: OHS for Recommendations', hint: 'Recommendations report' },
    { roleName: 'Director', label: 'Director: Document Security Compliance & OHS for recommendations', hint: 'Recommendations report' },
];

const ALL_RECOMMENDATION_ROLES = [
    { roleName: 'OHS Practitioner', label: 'OHS Practitioner Recommendation', hint: 'Recommendation report', aliases: ['OHS Practitioner'] },
    { roleName: 'PSSC Coordinator', label: 'Provincial Security Coordinator / Director PSSC for recommendations', hint: 'Recommendations report', aliases: ['Provincial Security Coordinator', 'PSSC Coordinator'] },
    { roleName: 'Deputy Director', label: 'Deputy Director Recommendation', hint: 'Approvals/Recommendations report', aliases: ['Deputy Director', 'Deputy_Director'] },
    { roleName: 'Director', label: 'Director: Document Security Compliance & OHS for recommendations', hint: 'Recommendations report', aliases: ['Director'] },
];

function normalizeApprovals(raw: unknown): CaseApproval[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((a: Record<string, unknown>) => {
        const atts = a.attachments as CaseApproval['attachments'] | undefined;
        if (atts && atts.length > 0) {
            return { ...(a as unknown as CaseApproval), attachments: atts };
        }
        const legacyUrl = a.fileUrl as string | undefined;
        if (legacyUrl) {
            return {
                ...(a as unknown as CaseApproval),
                attachments: [
                    {
                        id: `legacy-${a.id}`,
                        fileUrl: legacyUrl,
                        fileName: (a.fileName as string) ?? null,
                        fileType: (a.fileType as string) ?? null,
                        createdAt: (a.createdAt as string) ?? new Date().toISOString(),
                    },
                ],
            };
        }
        return { ...(a as unknown as CaseApproval), attachments: [] };
    });
}

interface ApprovalsTabProps {
    caseId: string;
    caseData: Case;
    canEdit: boolean;
    user: any; // User object from auth store
    onSuccess: () => void; // callback to refresh parent details
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({
    caseId,
    caseData,
    canEdit,
    user,
    onSuccess
}) => {
    // States
    const [newApprovalForRole, setNewApprovalForRole] = useState<string | null>(null);
    const [newApprRecommender, setNewApprRecommender] = useState('');
    const [newApprText, setNewApprText] = useState('');
    const [newApprFile, setNewApprFile] = useState<{ fileUrl: string; fileName: string; fileType: string } | null>(null);
    const [uploadingNewFile, setUploadingNewFile] = useState(false);
    const [submittingNewApproval, setSubmittingNewApproval] = useState(false);

    const [editingApprovalMeta, setEditingApprovalMeta] = useState<{
        id: string;
        recommenderName: string;
        recommendationText: string;
    } | null>(null);
    const [savingApprovalMetaId, setSavingApprovalMetaId] = useState<string | null>(null);

    const [extraAttachApprovalId, setExtraAttachApprovalId] = useState<string | null>(null);
    const [uploadingExtraAttachments, setUploadingExtraAttachments] = useState(false);

    const [deletingAttachmentKey, setDeletingAttachmentKey] = useState<string | null>(null);
    const [deletingApprovalId, setDeletingApprovalId] = useState<string | null>(null);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [showOhsSubmitModal, setShowOhsSubmitModal] = useState(false);
    const [ohsRecText, setOhsRecText] = useState('');
    const [submittingOhsRec, setSubmittingOhsRec] = useState(false);

    // Refs
    const newApprFilesInputRef = useRef<HTMLInputElement>(null);
    const extraAttachInputRef = useRef<HTMLInputElement>(null);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setErrorMsg(null);
        setTimeout(() => setSuccessMsg(null), 4000);
    };

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setSuccessMsg(null);
        setTimeout(() => setErrorMsg(null), 4000);
    };

    const provinceName = caseData.building?.province?.name || '';
    const isProvincial = provincialNames.includes(provinceName);
    const rolesList = isProvincial ? PROVINCIAL_APPROVAL_ROLES : NATIONAL_APPROVAL_ROLES;

    const userRole = user?.role?.name?.toLowerCase()?.replace(/_/g, ' ')?.replace(/\s+/g, ' ')?.trim();
    const isOHS = userRole === 'ohs practitioner';

    const handleSendOhsRecommendation = async () => {
        try {
            setSubmittingOhsRec(true);
            setShowOhsSubmitModal(false);

            // 1. Add OHS Practitioner recommendation approval record
            const savedSig = localStorage.getItem(`user_sig_${user?.id}`);
            await casesService.addApproval(caseId, {
                roleName: 'OHS Practitioner',
                recommenderName: user?.fullName || user?.name || 'T. Dlamini',
                recommendationText: ohsRecText.trim() || undefined,
                files: [
                    {
                        fileUrl: savedSig || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                        fileName: 'OHS_Signature.png',
                        fileType: 'image/png'
                    }
                ]
            });

            // 2. Transition case status to UNDER_PSSC_RECOMMENDATION
            await casesService.updateStatus(caseId, 'UNDER_PSSC_RECOMMENDATION');

            showSuccess('Recommendation submitted to PSSC Coordinator successfully.');
            setOhsRecText('');
            onSuccess();
        } catch (err) {
            console.error('Error sending OHS recommendation:', err);
            showError('Failed to send recommendation.');
        } finally {
            setSubmittingOhsRec(false);
        }
    };

    const openNewApprovalForm = (roleName: string) => {
        setNewApprovalForRole(roleName);
        setNewApprRecommender(user?.fullName || '');
        setNewApprText('');
        setNewApprFile(null);
    };

    const handleNewFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = '';
        if (!file || !caseId) return;
        try {
            setUploadingNewFile(true);
            const uploaded = await casesService.uploadFile(file, caseId);
            setNewApprFile({
                fileUrl: uploaded.url,
                fileName: file.name,
                fileType: file.type,
            });
            showSuccess('File uploaded successfully.');
        } catch (err) {
            console.error('Error uploading file:', err);
            showError('Failed to upload file.');
        } finally {
            setUploadingNewFile(false);
        }
    };

    const submitNewApprovalForRole = async (roleName: string) => {
        if (!caseId || !newApprFile) {
            showError('Select a file to upload for this approval record.');
            return;
        }
        if (!newApprRecommender.trim()) {
            showError('Please enter the name of the person who gave the recommendation/approval.');
            return;
        }
        try {
            setSubmittingNewApproval(true);
            await casesService.addApproval(caseId, {
                roleName,
                recommenderName: newApprRecommender.trim(),
                recommendationText: newApprText.trim() || undefined,
                files: [newApprFile],
            });
            showSuccess('Approval / recommendation record saved.');
            setNewApprovalForRole(null);
            setNewApprRecommender('');
            setNewApprText('');
            setNewApprFile(null);
            onSuccess();
        } catch (err) {
            console.error('Error saving approval:', err);
            showError('Failed to save approval record.');
        } finally {
            setSubmittingNewApproval(false);
        }
    };

    const saveApprovalMeta = async () => {
        if (!caseId || !editingApprovalMeta) return;
        if (!editingApprovalMeta.recommenderName.trim()) {
            showError('Recommender name is required.');
            return;
        }
        try {
            setSavingApprovalMetaId(editingApprovalMeta.id);
            await casesService.updateApproval(caseId, editingApprovalMeta.id, {
                recommenderName: editingApprovalMeta.recommenderName.trim(),
                recommendationText: editingApprovalMeta.recommendationText.trim() || undefined,
            });
            setEditingApprovalMeta(null);
            showSuccess('Recommendation details updated.');
            onSuccess();
        } catch (err) {
            console.error('Error updating approval:', err);
            showError('Failed to update approval.');
        } finally {
            setSavingApprovalMetaId(null);
        }
    };

    const triggerExtraAttachments = (approvalId: string) => {
        setExtraAttachApprovalId(approvalId);
        extraAttachInputRef.current?.click();
    };

    const onExtraAttachmentFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (e.target) e.target.value = '';
        const targetId = extraAttachApprovalId;
        if (!caseId || !targetId || !file) return;
        try {
            setUploadingExtraAttachments(true);
            const up = await casesService.uploadFile(file, caseId);
            await casesService.addApprovalAttachment(caseId, targetId, {
                fileUrl: up.url,
                fileName: file.name,
                fileType: file.type,
            });
            showSuccess('File added to this record.');
            onSuccess();
        } catch (err) {
            console.error('Error adding attachment:', err);
            showError('Failed to add attachment.');
        } finally {
            setUploadingExtraAttachments(false);
            setExtraAttachApprovalId(null);
        }
    };

    const removeApprovalAttachment = async (approvalId: string, attachmentId: string) => {
        if (!caseId || String(attachmentId).startsWith('legacy-')) {
            showError('Remove legacy rows by re-uploading under a new record after migration.');
            return;
        }
        const key = `${approvalId}:${attachmentId}`;
        try {
            setDeletingAttachmentKey(key);
            await casesService.deleteApprovalAttachment(caseId, approvalId, attachmentId);
            showSuccess('Attachment removed.');
            onSuccess();
        } catch (err) {
            console.error('Error deleting attachment:', err);
            showError('Failed to remove attachment.');
        } finally {
            setDeletingAttachmentKey(null);
        }
    };

    const removeApprovalRecord = async (approvalId: string) => {
        if (!caseId) return;
        try {
            setDeletingApprovalId(approvalId);
            await casesService.deleteApproval(caseId, approvalId);
            showSuccess('Approval record removed.');
            onSuccess();
        } catch (err) {
            console.error('Error deleting approval:', err);
            showError('Failed to remove approval record.');
        } finally {
            setDeletingApprovalId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Local success / error alerts */}
            {successMsg && (
                <div className="flex items-center gap-2 bg-gold-50 border border-gold-200 text-gold-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="shrink-0" size={16} />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="shrink-0" size={16} />
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)} className="ml-auto hover:text-red-900"><X size={14} /></button>
                </div>
            )}

            {/* Hidden file inputs */}
            <input
                ref={newApprFilesInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleNewFileSelect}
            />
            <input
                ref={extraAttachInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={onExtraAttachmentFiles}
            />

            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 sm:p-6">
                <div className="flex flex-col items-center justify-center gap-2 mb-8 text-center">
                    <Shield className="text-gray-400" size={32} />
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Approvals & recommendations</h4>
                </div>

                <div className="grid gap-4 items-start grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {ALL_RECOMMENDATION_ROLES.map((def) => {
                        const approvalsList = normalizeApprovals(caseData.approvals);
                        const forRole = approvalsList.filter((a) => {
                            if (def.aliases) {
                                return def.aliases.some(alias => a.roleName?.toLowerCase() === alias.toLowerCase());
                            }
                            return a.roleName?.toLowerCase() === def.roleName.toLowerCase();
                        });
                        const canEditColumn = canEdit && (def.roleName === 'OHS Practitioner' || userRole === 'admin' || userRole === 'system administrator' || userRole === 'supervisor');
                        return (
                            <div
                                key={def.roleName}
                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 text-left min-w-0 w-full overflow-hidden"
                            >
                                <div className="w-full min-w-0">
                                    <h5 className="font-bold text-sm text-gray-900 break-words">{def.label}</h5>
                                    <p className="text-xs text-gray-500 mt-0.5 break-words">{def.hint}</p>
                                </div>

                                {forRole.length > 0 && (
                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1 w-full min-w-0">
                                        {forRole.map((ap) => (
                                            <div
                                                key={ap.id}
                                                className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 space-y-2 w-full min-w-0 overflow-hidden"
                                            >
                                                <div className="flex justify-between gap-2 items-start w-full min-w-0">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-gray-700 break-words">
                                                            {ap.recommenderName?.trim() || 'Name not recorded'}
                                                        </p>
                                                        {ap.recommendationText ? (
                                                            <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                                                                {ap.recommendationText}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    {canEditColumn && (
                                                        <div className="flex shrink-0 gap-1">
                                                            <button
                                                                type="button"
                                                                title="Edit name & recommendation text"
                                                                onClick={() =>
                                                                    setEditingApprovalMeta({
                                                                        id: ap.id,
                                                                        recommenderName: ap.recommenderName ?? '',
                                                                        recommendationText: ap.recommendationText ?? '',
                                                                    })
                                                                }
                                                                className="p-1.5 rounded-md text-gray-500 hover:bg-white hover:text-gray-800"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                title="Delete this record"
                                                                disabled={deletingApprovalId === ap.id}
                                                                onClick={() => {
                                                                    if (window.confirm('Remove this approval record and all its files?')) {
                                                                        void removeApprovalRecord(ap.id);
                                                                    }
                                                                }}
                                                                className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                                            >
                                                                {deletingApprovalId === ap.id ? (
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                ) : (
                                                                    <Trash2 size={14} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {editingApprovalMeta?.id === ap.id && (
                                                    <div className="space-y-2 pt-2 border-t border-gray-200">
                                                        <input
                                                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                                                            placeholder="Name of person who gave the recommendation / approval"
                                                            value={editingApprovalMeta.recommenderName}
                                                            onChange={(e) =>
                                                                setEditingApprovalMeta((m) =>
                                                                    m ? { ...m, recommenderName: e.target.value } : m,
                                                                )
                                                            }
                                                        />
                                                        <textarea
                                                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 min-h-[72px]"
                                                            placeholder="Written recommendation or conditions"
                                                            value={editingApprovalMeta.recommendationText}
                                                            onChange={(e) =>
                                                                setEditingApprovalMeta((m) =>
                                                                    m ? { ...m, recommendationText: e.target.value } : m,
                                                                )
                                                            }
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                className="text-xs font-semibold text-gray-500"
                                                                onClick={() => setEditingApprovalMeta(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={savingApprovalMetaId === ap.id}
                                                                onClick={() => void saveApprovalMeta()}
                                                                className="text-xs font-semibold text-white bg-brown px-3 py-1.5 rounded-lg disabled:opacity-50"
                                                            >
                                                                {savingApprovalMetaId === ap.id ? 'Saving…' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-1.5 w-full min-w-0">
                                                    {ap.attachments && ap.attachments.map((att) => (
                                                        <div
                                                            key={att.id}
                                                            className="flex items-center gap-2 bg-white rounded-md border border-gray-100 px-2 py-1.5 w-full min-w-0 overflow-hidden"
                                                        >
                                                            <a
                                                                href={
                                                                    att.fileUrl?.match(/^\s*(javascript|data|vbscript):/i)
                                                                        ? '#'
                                                                        : att.fileUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-gold font-medium truncate flex-1 min-w-0"
                                                            >
                                                                {att.fileName || 'Document'}
                                                            </a>
                                                            {canEditColumn && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        deletingAttachmentKey === `${ap.id}:${att.id}` ||
                                                                        String(att.id).startsWith('legacy-')
                                                                    }
                                                                    onClick={() => void removeApprovalAttachment(ap.id, att.id)}
                                                                    className="text-gray-400 hover:text-red-500 shrink-0 disabled:opacity-30"
                                                                >
                                                                    {deletingAttachmentKey === `${ap.id}:${att.id}` ? (
                                                                        <Loader2 size={12} className="animate-spin" />
                                                                    ) : (
                                                                        <X size={12} />
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {canEditColumn && (
                                                    <button
                                                        type="button"
                                                        disabled={uploadingExtraAttachments}
                                                        onClick={() => triggerExtraAttachments(ap.id)}
                                                        className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-brown border border-gold/30 rounded-lg py-1.5 hover:bg-gold/5 disabled:opacity-50"
                                                    >
                                                        {uploadingExtraAttachments && extraAttachApprovalId === ap.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Upload size={14} />
                                                        )}
                                                        Add more files
                                                    </button>
                                                )}
                                                <p className="text-[10px] text-gray-500">
                                                    {new Date(ap.createdAt).toLocaleString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                    {ap.uploadedBy?.name ? ` · logged by ${ap.uploadedBy.name}` : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {forRole.length === 0 && (
                                    isOHS && def.roleName === 'OHS Practitioner' && (caseData.status === 'ASSIGNED' || caseData.status === 'IN_PROGRESS' || caseData.status === 'UNDER_INVESTIGATION' || caseData.status === 'POOL') ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOhsRecText('');
                                                setShowOhsSubmitModal(true);
                                            }}
                                            className="w-full mt-4 flex items-center justify-center gap-1.5 px-3 py-2 bg-brown hover:bg-opacity-90 text-white text-xs font-bold rounded-lg transition shadow-sm"
                                        >
                                            <Send size={14} /> Send Recommendation/Approval
                                        </button>
                                    ) : (
                                        <div className="text-xs text-gray-400 italic py-2">
                                            {caseData.status === 'UNDER_PSSC_RECOMMENDATION' ? (
                                                <span className="text-[#884616] font-bold">Sent to PSSC Coordinator for recommendations</span>
                                            ) : caseData.status === 'UNDER_DEP_DIRECTOR_RECOMMENDATION' ? (
                                                <span className="text-[#884616] font-bold">Sent to Deputy Director for approvals</span>
                                            ) : caseData.status === 'DIRECTOR_APPROVAL' ? (
                                                <span className="text-[#884616] font-bold">Sent to Director for approvals</span>
                                            ) : (
                                                "No recommendation or approval recorded"
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* OHS Practitioner Recommendation Modal */}
            {showOhsSubmitModal && (
                <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center animate-fadeIn p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp relative">
                        <button
                            type="button"
                            onClick={() => setShowOhsSubmitModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center pb-2 border-b border-gray-100">
                            <h3 className="text-base font-black text-gray-800 uppercase tracking-wider">Send Recommendation/Approval</h3>
                            <p className="text-[10px] text-gray-400 mt-1 font-semibold">You are submitting your recommendation to the PSSC Coordinator</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider block">Add your recommendation (optional)</label>
                            <textarea
                                value={ohsRecText}
                                onChange={(e) => setOhsRecText(e.target.value)}
                                placeholder="Enter OHS recommendation for the PSSC Coordinator..."
                                className="w-full text-xs border border-gray-250 rounded-xl p-3 outline-none focus:border-[#884616] min-h-[100px] bg-white font-medium text-gray-800"
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowOhsSubmitModal(false)}
                                className="px-4 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submittingOhsRec}
                                onClick={handleSendOhsRecommendation}
                                className="px-5 py-2.5 bg-[#884616] hover:bg-[#723b12] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5"
                            >
                                {submittingOhsRec ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
