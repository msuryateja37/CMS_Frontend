import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BookOpen, ChevronDown, Save, CheckCircle, AlertCircle } from 'lucide-react';

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
    const [selectedMonth, setSelectedMonth] = useState('');
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
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

    const handleChange = (field: keyof DressingEntry, value: string) => {
        setEntry(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!entry.officeName || !entry.date || !entry.name) {
            setError('Please fill in Office Name, Date, and Name fields.');
            return;
        }
        if (!selectedMonth) {
            setError('Please select a month.');
            return;
        }
        setError('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
        setEntry({ officeName: '', date: '', time: '', name: '', natureOfInjury: '', treatmentRendered: '', treatedBy: '', dateResumedWork: '' });
        setSelectedMonth('');
    };

    const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400";

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
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-brown">
                            <BookOpen size={18} />
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
                        Dressing registry entry submitted successfully!
                    </div>
                )}
                {error && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
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
                                <button
                                    type="button"
                                    onClick={() => setShowMonthDropdown(prev => !prev)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 shadow-sm hover:border-brown/40 transition-all"
                                >
                                    {selectedMonth || 'Select Month'}
                                    <ChevronDown size={14} className={`transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showMonthDropdown && (
                                    <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
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

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Office Name</label>
                                    <input type="text" placeholder="Enter name" value={entry.officeName} onChange={e => handleChange('officeName', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                                    <input type="date" value={entry.date} onChange={e => handleChange('date', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                                    <input type="time" placeholder="Enter time" value={entry.time} onChange={e => handleChange('time', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                                    <input type="text" placeholder="Enter name" value={entry.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nature of Injury</label>
                                    <input type="text" placeholder="Enter nature" value={entry.natureOfInjury} onChange={e => handleChange('natureOfInjury', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Treatment Rendered</label>
                                    <input type="text" placeholder="Enter treatment" value={entry.treatmentRendered} onChange={e => handleChange('treatmentRendered', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Treated By</label>
                                    <input type="text" placeholder="Enter name" value={entry.treatedBy} onChange={e => handleChange('treatedBy', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date Resumed Work</label>
                                    <input type="date" value={entry.dateResumedWork} onChange={e => handleChange('dateResumedWork', e.target.value)} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                            <button
                                type="submit"
                                id="submit-dressing-form-btn"
                                className="flex items-center gap-2 px-6 py-2.5 bg-brown hover:bg-opacity-90 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                            >
                                <Save size={15} />
                                Submit Form
                            </button>
                            <button
                                type="button"
                                id="save-draft-btn"
                                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                            >
                                Save as Draft
                            </button>
                            <button
                                type="button"
                                id="cancel-dressing-btn"
                                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={() => setEntry({ officeName: '', date: '', time: '', name: '', natureOfInjury: '', treatmentRendered: '', treatedBy: '', dateResumedWork: '' })}
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
