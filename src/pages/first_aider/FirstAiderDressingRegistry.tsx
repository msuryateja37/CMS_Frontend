import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BookOpen, ChevronDown, Save, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import casesService, { type Case } from '../../services/cases.service';
import { dressingRegistryService } from '../../services/dressingRegistry.service';
import { formatCategory } from '../../utils/formatters';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

interface DressingEntry {
    officeName: string;
    date: string;
    time: string;
    name: string;
    natureOfInjury: string;
    treatmentRendered: string;
    treatedBy: string;
    dateResumedWork: string;
}

const FirstAiderDressingRegistry: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [selectedMonth, setSelectedMonth] = useState('');
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    // Case dependency states
    const [isCaseLinked, setIsCaseLinked] = useState(false);
    const [assignedCases, setAssignedCases] = useState<Case[]>([]);
    const [loadingCases, setLoadingCases] = useState(false);
    const [selectedCaseId, setSelectedCaseId] = useState('');

    const [entry, setEntry] = useState<DressingEntry>({
        officeName: '',
        date: '',
        time: '',
        name: '',
        natureOfInjury: '',
        treatmentRendered: '',
        treatedBy: '',
        dateResumedWork: '',
    });

    useEffect(() => {
        if (user) {
            setEntry(prev => ({
                ...prev,
                treatedBy: user.fullName || '',
                officeName: user.department?.building?.name || '',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            }));
            
            // Set current month as default selected month
            const currentMonthIndex = new Date().getMonth();
            setSelectedMonth(MONTHS[currentMonthIndex]);
        }
    }, [user]);

    // Fetch assigned cases if user chooses to link a case
    useEffect(() => {
        if (isCaseLinked && user?.id) {
            const fetchCases = async () => {
                setLoadingCases(true);
                try {
                    const res = await casesService.getCases({ assignedToId: user.id });
                    setAssignedCases(res.data || []);
                } catch (err) {
                    console.error('Failed to load assigned cases:', err);
                } finally {
                    setLoadingCases(false);
                }
            };
            fetchCases();
        } else {
            setSelectedCaseId('');
        }
    }, [isCaseLinked, user?.id]);

    const handleChange = (field: keyof DressingEntry, value: string) => {
        setEntry(prev => ({ ...prev, [field]: value }));
    };

    const handleCaseSelect = (caseId: string) => {
        setSelectedCaseId(caseId);
        const c = assignedCases.find(item => item.id === caseId);
        if (c) {
            setEntry(prev => ({
                ...prev,
                name: c.reportedBy?.name || prev.name,
                natureOfInjury: c.category || prev.natureOfInjury,
                treatmentRendered: c.treatmentAdministered || c.description || prev.treatmentRendered,
                officeName: c.building?.name || prev.officeName,
                // Prepopulate occurred date/time if available
                date: c.occurredAt ? c.occurredAt.split('T')[0] : prev.date,
                time: c.occurredAt ? new Date(c.occurredAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : prev.time,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entry.officeName || !entry.date || !entry.name) {
            setError('Please fill in Office Name, Date, and Patient Name fields.');
            return;
        }
        if (!selectedMonth) {
            setError('Please select a month.');
            return;
        }
        setError('');
        try {
            setSubmitting(true);
            await dressingRegistryService.submitEntry({
                officeName: entry.officeName,
                date: entry.date,
                time: entry.time,
                name: entry.name,
                natureOfInjury: entry.natureOfInjury,
                treatmentRendered: entry.treatmentRendered,
                dateResumedWork: entry.dateResumedWork || undefined,
                incidentId: isCaseLinked && selectedCaseId ? selectedCaseId : undefined,
            });
            
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                navigate('/first-aider/my-registry');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit dressing registry entry.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setEntry({
            officeName: user?.department?.building?.name || '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            name: '',
            natureOfInjury: '',
            treatmentRendered: '',
            treatedBy: user?.fullName || '',
            dateResumedWork: '',
        });
        setIsCaseLinked(false);
        setSelectedCaseId('');
        const currentMonthIndex = new Date().getMonth();
        setSelectedMonth(MONTHS[currentMonthIndex]);
    };

    const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed";

    return (
        <DashboardLayout
            title="Dressing Registry"
            description="OHS Dressing Registry"
            breadcrumbs={[
                { label: 'Dashboard', path: '/first-aider/dashboard' },
                { label: 'Dressing Registry' }
            ]}
        >
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brown/10 flex items-center justify-center text-brown">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">OHS Dressing Registry</h1>
                            <p className="text-xs text-gray-500">Inspection Register</p>
                        </div>
                    </div>
                </div>

                {submitted && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <CheckCircle size={16} />
                        Dressing registry entry submitted successfully! Redirecting...
                    </div>
                )}
                {error && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                        <button type="button" onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Section Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="w-6 h-6 rounded-full bg-brown text-white text-xs font-bold flex items-center justify-center">A</span>
                                <h2 className="text-sm font-bold text-gray-800">First Aid Dressing Register</h2>
                            </div>

                            {/* Month Selector */}
                            <div className="mb-6 relative inline-block">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Month</label>
                                <button
                                    type="button"
                                    onClick={() => setShowMonthDropdown(prev => !prev)}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 shadow-sm hover:border-brown/40 transition-all"
                                >
                                    {selectedMonth || 'Select Month'}
                                    <ChevronDown size={14} className={`transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showMonthDropdown && (
                                    <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px] max-h-60 overflow-y-auto">
                                        {MONTHS.map(m => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => { setSelectedMonth(m); setShowMonthDropdown(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedMonth === m ? 'bg-brown text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Case Dependency Toggle */}
                            <div className="mb-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 flex flex-col gap-3">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isCaseLinked}
                                        onChange={e => setIsCaseLinked(e.target.checked)}
                                        className="w-4.5 h-4.5 rounded border-gray-300 text-brown focus:ring-brown focus:ring-opacity-20"
                                    />
                                    <span className="text-sm font-bold text-gray-750 select-none">Is this entry related to an assigned case?</span>
                                </label>
                                
                                {isCaseLinked && (
                                    <div className="animate-fadeIn">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Select Case</label>
                                        {loadingCases ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                                <Loader2 size={16} className="animate-spin text-brown" />
                                                <span>Loading your assigned cases...</span>
                                            </div>
                                        ) : assignedCases.length === 0 ? (
                                            <p className="text-xs text-red-500 italic py-1">No cases currently assigned to you.</p>
                                        ) : (
                                            <select
                                                value={selectedCaseId}
                                                onChange={e => handleCaseSelect(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all"
                                            >
                                                <option value="">-- Choose Case --</option>
                                                {assignedCases.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.incidentNumber} - {c.category ? formatCategory(c.category) : 'Uncategorized'} ({c.reportedBy?.name || 'Unknown Patient'})
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Office Name</label>
                                    <input type="text" placeholder="Enter office name" value={entry.officeName} onChange={e => handleChange('officeName', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                                    <input type="date" value={entry.date} onChange={e => handleChange('date', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                                    <input type="text" placeholder="e.g. 14:30" value={entry.time} onChange={e => handleChange('time', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Patient Name</label>
                                    <input type="text" placeholder="Enter patient name" value={entry.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nature of Injury</label>
                                    <input type="text" placeholder="Enter nature of injury" value={entry.natureOfInjury} onChange={e => handleChange('natureOfInjury', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Treatment Rendered</label>
                                    <input type="text" placeholder="Enter treatment details" value={entry.treatmentRendered} onChange={e => handleChange('treatmentRendered', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Treated By (First Aider)</label>
                                    <input type="text" placeholder="First aider name" value={entry.treatedBy} disabled className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date Resumed Work (Optional)</label>
                                    <input type="date" value={entry.dateResumedWork} onChange={e => handleChange('dateResumedWork', e.target.value)} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                            <button
                                type="submit"
                                id="submit-dressing-form-btn"
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-brown hover:bg-opacity-90 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                Submit Form
                            </button>
                            <button
                                type="button"
                                id="cancel-dressing-btn"
                                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default FirstAiderDressingRegistry;
