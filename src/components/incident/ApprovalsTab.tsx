import React, { useState, useRef } from 'react';
import casesService, { type Case, type CaseApproval } from '../../services/cases.service';
import { Shield, Plus, Upload, Loader2, Pencil, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

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
    { roleName: 'Chief Director (Provincial)', label: 'Chief Director for approval', hint: 'Final approved report' },
];

const NATIONAL_APPROVAL_ROLES = [
    { roleName: 'Assistant Director', label: 'Assistant Director: OHS for Recommendations', hint: 'Recommendations report' },
    { roleName: 'Director', label: 'Director: Document Security Compliance & OHS for recommendations', hint: 'Recommendations report' },
    { roleName: 'Chief Director (National)', label: 'Chief Director: Security and Facilities Management Services for approval', hint: 'Final approved report' },
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

    const openNewApprovalForm = (roleName: string) => {
        setNewApprovalForRole(roleName);
        setNewApprRecommender(user?.fullName || user?.name || '');
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

                <div className={`grid gap-4 items-start ${isProvincial ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                    {rolesList.map((def) => {
                        const approvalsList = normalizeApprovals(caseData.approvals);
                        const forRole = approvalsList.filter((a) => a.roleName === def.roleName);
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
                                                    {canEdit && (
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
                                                            {canEdit && (
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

                                                {canEdit && (
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

                                {forRole.length === 0 && !canEdit && (
                                    <div className="text-xs text-gray-400 italic py-2">
                                        No recommendation or approval recorded
                                    </div>
                                )}

                                {canEdit && (
                                    <>
                                        {newApprovalForRole === def.roleName ? (
                                            <div className="rounded-lg border border-dashed border-gold/40 bg-gold/5 p-3 space-y-2">
                                                <p className="text-xs font-bold text-gray-700">New record</p>
                                                <input
                                                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                                                    placeholder="Name of person who gave the recommendation / approval *"
                                                    value={newApprRecommender}
                                                    onChange={(e) => setNewApprRecommender(e.target.value)}
                                                />
                                                <textarea
                                                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white min-h-[64px]"
                                                    placeholder="Written recommendation (optional)"
                                                    value={newApprText}
                                                    onChange={(e) => setNewApprText(e.target.value)}
                                                />
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={uploadingNewFile}
                                                        onClick={() => newApprFilesInputRef.current?.click()}
                                                        className="text-xs font-semibold px-2 py-1.5 rounded-md bg-white border border-gray-200 flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        {uploadingNewFile ? (
                                                            <Loader2 size={12} className="animate-spin text-gold" />
                                                        ) : (
                                                            <Upload size={12} />
                                                        )}
                                                        {newApprFile ? 'Change file' : 'Choose file *'}
                                                    </button>
                                                    {newApprFile && (
                                                        <div className="flex items-center gap-1 text-[10px] bg-white border border-gray-200 rounded px-2 py-1 truncate max-w-[180px]">
                                                            <span className="truncate">{newApprFile.fileName}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setNewApprFile(null)}
                                                                className="text-gray-400 hover:text-red-500 ml-1"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-end gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        className="text-xs font-semibold text-gray-500"
                                                        onClick={() => {
                                                            setNewApprovalForRole(null);
                                                            setNewApprFile(null);
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={submittingNewApproval || uploadingNewFile}
                                                        onClick={() => void submitNewApprovalForRole(def.roleName)}
                                                        className="text-xs font-semibold text-white bg-brown px-3 py-1.5 rounded-lg disabled:opacity-50 inline-flex items-center gap-1"
                                                    >
                                                        {submittingNewApproval ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Upload size={14} />
                                                        )}
                                                        Save record
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openNewApprovalForm(def.roleName)}
                                                className="mt-auto w-full flex items-center justify-center gap-2 px-3 py-2 bg-brown text-white text-xs font-semibold rounded-lg hover:bg-opacity-90"
                                            >
                                                <Plus size={14} /> Add recommendation / approval
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
