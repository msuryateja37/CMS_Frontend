import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/auth.store';
import { Plus, Trash2, Upload, Save, Send, X, CheckCircle2 } from 'lucide-react';

interface RouteEntry {
    id: string;
    author: string;
    branch: string;
    rankDirector: string;
    fileReference: string;
    subject: string;
    telephone: string;
    cellular: string;
    email: string;
    rank: string;
    surnameInitials: string;
    toDgInitial: string;
    toDgDate: string;
    fromDgInitial: string;
    fromDgDate: string;
}

interface SignOff {
    id: string;
    recommendations: string;
    name: string;
    position: string;
    date: string;
}

const emptyRoute = (): RouteEntry => ({
    id: crypto.randomUUID(),
    author: '', branch: '', rankDirector: '', fileReference: '', subject: '',
    telephone: '', cellular: '', email: '', rank: '', surnameInitials: '',
    toDgInitial: '', toDgDate: '', fromDgInitial: '', fromDgDate: '',
});

const emptySignOff = (): SignOff => ({
    id: crypto.randomUUID(), recommendations: '', name: '', position: '', date: '',
});

const inputCls = 'w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-xs transition';
const labelCls = 'block text-[11px] font-semibold text-gray-600 mb-1';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className={labelCls}>{label}</label>
        {children}
    </div>
);

const ChiefFacilitiesMemorandum: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [routes, setRoutes] = useState<RouteEntry[]>([emptyRoute()]);
    const [signOffs, setSignOffs] = useState<SignOff[]>([emptySignOff(), emptySignOff()]);
    const [memo, setMemo] = useState({
        subject: '', fileReference: '', adg: '', purpose: '',
        background: '', orgImplications: '', financialImplications: '',
        legalImplications: '', policyImplications: '', communicationImplications: '',
        consultation: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const updateRoute = (id: string, patch: Partial<RouteEntry>) =>
        setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const updateSignOff = (id: string, patch: Partial<SignOff>) =>
        setSignOffs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const setMemoField = (k: keyof typeof memo, v: string) => setMemo((prev) => ({ ...prev, [k]: v }));

    const handleSaveDraft = () => {
        const draft = { routes, signOffs, memo, savedAt: new Date().toISOString() };
        const drafts = JSON.parse(localStorage.getItem('memorandum_drafts') || '[]');
        drafts.push(draft);
        localStorage.setItem('memorandum_drafts', JSON.stringify(drafts));
        alert('Memorandum saved as draft.');
    };

    const handleSubmit = () => setSubmitted(true);

    if (submitted) {
        return (
            <DashboardLayout title="Memorandum" description="OHS Route Form & Memorandum">
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-10 text-center max-w-md">
                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-4">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h2 className="text-lg font-black text-gray-800">Memorandum Submitted</h2>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            The OHS Route Form &amp; Memorandum has been routed for approval per the notification matrix.
                        </p>
                        <button
                            onClick={() => navigate('/facilities/dashboard')}
                            className="mt-6 bg-brown text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Memorandum"
            description="OHS Route Form & Memorandum"
            breadcrumbs={[{ label: 'Dashboard', path: '/facilities/dashboard' }, { label: 'Memorandum' }]}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* ===== Route Form ===== */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6">
                    <div className="border-b border-gray-100 pb-3 mb-5">
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Route Form</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{user?.department?.name || 'OHS'} · {user?.province?.name || 'Gauteng'}</p>
                    </div>

                    {routes.map((r, idx) => (
                        <div key={r.id} className="mb-6 last:mb-0">
                            {routes.length > 1 && (
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold text-brown uppercase tracking-wide">Route {idx + 1}</span>
                                    <button
                                        onClick={() => setRoutes((prev) => prev.filter((x) => x.id !== r.id))}
                                        className="text-gray-400 hover:text-red flex items-center gap-1 text-[11px] font-semibold"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                    </button>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Name of Author"><input className={inputCls} value={r.author} onChange={(e) => updateRoute(r.id, { author: e.target.value })} placeholder="Enter name" /></Field>
                                <Field label="Name of Branch"><input className={inputCls} value={r.branch} onChange={(e) => updateRoute(r.id, { branch: e.target.value })} placeholder="Enter name" /></Field>
                                <Field label="Rank Director"><input className={inputCls} value={r.rankDirector} onChange={(e) => updateRoute(r.id, { rankDirector: e.target.value })} placeholder="Enter rank" /></Field>
                                <Field label="File Reference"><input className={inputCls} value={r.fileReference} onChange={(e) => updateRoute(r.id, { fileReference: e.target.value })} placeholder="Enter reference" /></Field>
                                <Field label="Subject"><input className={inputCls} value={r.subject} onChange={(e) => updateRoute(r.id, { subject: e.target.value })} placeholder="Enter subject" /></Field>
                                <Field label="Telephone No"><input className={inputCls} value={r.telephone} onChange={(e) => updateRoute(r.id, { telephone: e.target.value })} placeholder="Enter telephone no" /></Field>
                                <Field label="Cellular No"><input className={inputCls} value={r.cellular} onChange={(e) => updateRoute(r.id, { cellular: e.target.value })} placeholder="Enter cellular no" /></Field>
                                <Field label="E-mail"><input className={inputCls} value={r.email} onChange={(e) => updateRoute(r.id, { email: e.target.value })} placeholder="Enter e-mail" /></Field>
                                <Field label="Rank"><input className={inputCls} value={r.rank} onChange={(e) => updateRoute(r.id, { rank: e.target.value })} placeholder="Enter rank" /></Field>
                                <Field label="Surname and Initials (Origin)"><input className={inputCls} value={r.surnameInitials} onChange={(e) => updateRoute(r.id, { surnameInitials: e.target.value })} placeholder="Enter" /></Field>
                                <Field label="To DG - Initial"><input className={inputCls} value={r.toDgInitial} onChange={(e) => updateRoute(r.id, { toDgInitial: e.target.value })} placeholder="Enter" /></Field>
                                <Field label="To DG - Date"><input type="date" className={inputCls} value={r.toDgDate} onChange={(e) => updateRoute(r.id, { toDgDate: e.target.value })} /></Field>
                                <Field label="From DG - Initial"><input className={inputCls} value={r.fromDgInitial} onChange={(e) => updateRoute(r.id, { fromDgInitial: e.target.value })} placeholder="Enter reference" /></Field>
                                <Field label="From DG - Date"><input type="date" className={inputCls} value={r.fromDgDate} onChange={(e) => updateRoute(r.id, { fromDgDate: e.target.value })} /></Field>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setRoutes((prev) => [...prev, emptyRoute()])}
                            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Another Route
                        </button>
                    </div>
                </div>

                {/* ===== Memorandum Form ===== */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6">
                    <div className="border-b border-gray-100 pb-3 mb-5">
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Memorandum Form</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Subject"><input className={inputCls} value={memo.subject} onChange={(e) => setMemoField('subject', e.target.value)} placeholder="Enter subject" /></Field>
                        <Field label="File Reference"><input className={inputCls} value={memo.fileReference} onChange={(e) => setMemoField('fileReference', e.target.value)} placeholder="Enter reference" /></Field>
                        <Field label="Acting Director-General (ADG)"><input className={inputCls} value={memo.adg} onChange={(e) => setMemoField('adg', e.target.value)} placeholder="Enter" /></Field>
                        <Field label="Purpose"><input className={inputCls} value={memo.purpose} onChange={(e) => setMemoField('purpose', e.target.value)} placeholder="Enter" /></Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <Field label="Background and Discussion"><textarea className={`${inputCls} min-h-[70px] resize-y`} value={memo.background} onChange={(e) => setMemoField('background', e.target.value)} placeholder="Enter" /></Field>
                        <Field label="Organizational & Personnel Implications"><textarea className={`${inputCls} min-h-[70px] resize-y`} value={memo.orgImplications} onChange={(e) => setMemoField('orgImplications', e.target.value)} placeholder="Enter implications" /></Field>
                        <Field label="Financial Implications"><textarea className={`${inputCls} min-h-[70px] resize-y`} value={memo.financialImplications} onChange={(e) => setMemoField('financialImplications', e.target.value)} placeholder="Enter implications" /></Field>
                        <Field label="Constitutional/Legislation &/Legal Implications"><textarea className={`${inputCls} min-h-[70px] resize-y`} value={memo.legalImplications} onChange={(e) => setMemoField('legalImplications', e.target.value)} placeholder="Enter implications" /></Field>
                        <Field label="Policy Implications"><textarea className={`${inputCls} min-h-[70px] resize-y`} value={memo.policyImplications} onChange={(e) => setMemoField('policyImplications', e.target.value)} placeholder="Enter implications" /></Field>
                        <Field label="Communication Implications"><textarea className={`${inputCls} min-h-[70px] resize-y`} value={memo.communicationImplications} onChange={(e) => setMemoField('communicationImplications', e.target.value)} placeholder="Enter implications" /></Field>
                    </div>

                    <div className="mt-4">
                        <Field label="Consultation with other Departments/Committees/Bodies">
                            <input className={inputCls} value={memo.consultation} onChange={(e) => setMemoField('consultation', e.target.value)} placeholder="Enter" />
                        </Field>
                    </div>

                    {/* Attachments */}
                    <div className="mt-5">
                        <label className={labelCls}>Attachments</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center justify-center text-gray-400 hover:border-gold transition cursor-pointer">
                            <Upload className="w-6 h-6 mb-2" />
                            <span className="text-xs font-semibold">Drag and drop files here or click to browse</span>
                            <span className="text-[10px] mt-1">Supported: PDF, DOCX, JPG, PNG (Max 10MB each)</span>
                        </div>
                    </div>

                    {/* Recommendations / Sign-off (repeatable) */}
                    <div className="mt-6 space-y-4">
                        {signOffs.map((s, idx) => (
                            <div key={s.id} className="border border-gray-100 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Recommendations / Comments</span>
                                    {signOffs.length > 1 && (
                                        <button onClick={() => setSignOffs((prev) => prev.filter((x) => x.id !== s.id))} className="text-gray-400 hover:text-red">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <textarea className={`${inputCls} min-h-[60px] resize-y`} value={s.recommendations} onChange={(e) => updateSignOff(s.id, { recommendations: e.target.value })} placeholder="Enter recommendations / comments..." />
                                <div className="mt-3">
                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Sign-Off {idx + 1}</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                                        <Field label="Name & Surname"><input className={inputCls} value={s.name} onChange={(e) => updateSignOff(s.id, { name: e.target.value })} placeholder="Name & Surname" /></Field>
                                        <Field label="Position"><input className={inputCls} value={s.position} onChange={(e) => updateSignOff(s.id, { position: e.target.value })} placeholder="Position" /></Field>
                                        <Field label="Date"><input type="date" className={inputCls} value={s.date} onChange={(e) => updateSignOff(s.id, { date: e.target.value })} /></Field>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setSignOffs((prev) => [...prev, emptySignOff()])}
                            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Sign-Off
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pb-4">
                    <button onClick={handleSubmit} className="flex items-center gap-1.5 bg-brown text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition shadow-md">
                        <Send className="w-4 h-4" /> Submit Form
                    </button>
                    <button onClick={handleSaveDraft} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition">
                        <Save className="w-4 h-4" /> Save as Draft
                    </button>
                    <button onClick={() => navigate('/facilities/dashboard')} className="px-5 py-2.5 text-gray-500 text-xs font-bold hover:text-gray-700 transition">
                        Cancel
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChiefFacilitiesMemorandum;
