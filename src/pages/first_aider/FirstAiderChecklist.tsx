import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { ClipboardList, ChevronDown, Save, CheckCircle, AlertCircle } from 'lucide-react';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const CHECKLIST_ITEMS = [
    'Wound Cleaner / Antiseptic (100ml)',
    '1 Roll Elastic Adhesive Strip (25mm x 3mm)',
    'Swabs for Cleaning Wound (100g)',
    '1 Anti-Allergic Adhesive Strip (25mm x 3mm)',
    'Cotton Wool for Padding (100g)',
    '1 Packet Adhesive Dressing Strips (Min. 10 assorted sizes)',
    'Sterile Gauze (min. 10)',
    '4 Large Dressings (160mm x 200mm)',
    '1 Pair Forceps (for splinters)',
    '4 Shell Dressings (160mm x 200mm)',
    '1 Pair Scissors (min. 100mm)',
    '2 Straight Splints',
    '1 Card Safety Pins',
    '2 Pairs Large Disposable Latex Gloves',
    '4 Triangular Bandages',
    '2 Pair Medium Latex Gloves',
    '4 Roller Bandages (75mm x 5mm)',
    '2 CPR Mouth Pieces or Similar Devices',
    '4 Roller Bandages (100mm x 5mm)',
    '1 Resuscitation Face Shield',
    '1 Crepe Bandage (75mm)',
    '1 Emergency Foil Blanket',
    '1 Crepe Bandage (100mm)',
    'Burn Shield Dressing (large)',
    '1 Roll Waterproof Plaster',
    'Eyewash (sterile)',
];

type RadioValue = 'yes' | 'no' | '';

interface IncidentInfo {
    firstAiderName: string;
    officeName: string;
    contactNumber: string;
    natureOfIncident: string;
    locationOfIncident: string;
    timeOfIncident: string;
    dateOfIncident: string;
    businessImpact: string;
    dateBusinessResumed: string;
    recoveryTime: string;
    affectedPerson: string;
    possibleCause: string;
    immediateAction: string;
    investigations: string;
}

const FirstAiderChecklist: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState('');
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [checklistValues, setChecklistValues] = useState<Record<string, RadioValue>>({});
    const [incidentInfo, setIncidentInfo] = useState<IncidentInfo>({
        firstAiderName: '',
        officeName: '',
        contactNumber: '',
        natureOfIncident: '',
        locationOfIncident: '',
        timeOfIncident: '',
        dateOfIncident: '',
        businessImpact: '',
        dateBusinessResumed: '',
        recoveryTime: '',
        affectedPerson: '',
        possibleCause: '',
        immediateAction: '',
        investigations: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleRadio = (item: string, value: RadioValue) => {
        setChecklistValues(prev => ({ ...prev, [item]: value }));
    };

    const handleInfoChange = (field: keyof IncidentInfo, value: string) => {
        setIncidentInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        const unanswered = CHECKLIST_ITEMS.filter(item => !checklistValues[item]);
        if (unanswered.length > 0) {
            setError(`Please answer all checklist items. ${unanswered.length} item(s) remaining.`);
            return;
        }
        if (!selectedMonth) {
            setError('Please select a month for the checklist.');
            return;
        }
        setError('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <DashboardLayout
            title="First Aid Checklist"
            description="OHS First Aid Kit Inspection Register"
            breadcrumbs={[
                { label: 'Dashboard', path: '/first-aider/dashboard' },
                { label: 'First Aid Checklist' }
            ]}
        >
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-brown">
                            <ClipboardList size={18} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">OHS First Aid Checklist</h1>
                            <p className="text-xs text-gray-500">Inspection Register</p>
                        </div>
                    </div>
                </div>

                {/* Success Banner */}
                {submitted && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <CheckCircle size={16} />
                        Checklist submitted successfully!
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Section A: Incident Information */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-5">
                                <span className="w-6 h-6 rounded-full bg-brown text-white text-xs font-bold flex items-center justify-center">A</span>
                                <h2 className="text-sm font-bold text-gray-800">Enter incident information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name of First Aider */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Name of First Aider</label>
                                    <input
                                        type="text"
                                        placeholder="Enter name"
                                        value={incidentInfo.firstAiderName}
                                        onChange={e => handleInfoChange('firstAiderName', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Name of Office */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Name of Office</label>
                                    <input
                                        type="text"
                                        placeholder="Enter name"
                                        value={incidentInfo.officeName}
                                        onChange={e => handleInfoChange('officeName', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter contact details"
                                        value={incidentInfo.contactNumber}
                                        onChange={e => handleInfoChange('contactNumber', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Nature/Description of Incident */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nature/Description of Incident</label>
                                    <input
                                        type="text"
                                        placeholder="Enter nature/description"
                                        value={incidentInfo.natureOfIncident}
                                        onChange={e => handleInfoChange('natureOfIncident', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Location of Incident */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Location of Incident</label>
                                    <input
                                        type="text"
                                        placeholder="Enter location"
                                        value={incidentInfo.locationOfIncident}
                                        onChange={e => handleInfoChange('locationOfIncident', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Time of Incident */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Time of Incident</label>
                                    <input
                                        type="time"
                                        placeholder="Enter time"
                                        value={incidentInfo.timeOfIncident}
                                        onChange={e => handleInfoChange('timeOfIncident', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all"
                                    />
                                </div>

                                {/* Date of Incident */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Incident</label>
                                    <input
                                        type="date"
                                        value={incidentInfo.dateOfIncident}
                                        onChange={e => handleInfoChange('dateOfIncident', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all"
                                    />
                                </div>

                                {/* Business Impact */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Business Impact (i.e. office closure)</label>
                                    <input
                                        type="text"
                                        placeholder="Enter impact"
                                        value={incidentInfo.businessImpact}
                                        onChange={e => handleInfoChange('businessImpact', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Date of Business Resumed Operations */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Business Resumed Operations</label>
                                    <input
                                        type="date"
                                        value={incidentInfo.dateBusinessResumed}
                                        onChange={e => handleInfoChange('dateBusinessResumed', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all"
                                    />
                                </div>

                                {/* Recovery Time */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Recovery Time</label>
                                    <input
                                        type="text"
                                        placeholder="Enter time"
                                        value={incidentInfo.recoveryTime}
                                        onChange={e => handleInfoChange('recoveryTime', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Affected Person/Area */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Affected Person/Area</label>
                                    <input
                                        type="text"
                                        placeholder="Enter affected person/area"
                                        value={incidentInfo.affectedPerson}
                                        onChange={e => handleInfoChange('affectedPerson', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Possible Cause of Incident */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Possible Cause of Incident</label>
                                    <input
                                        type="text"
                                        placeholder="Enter possible cause"
                                        value={incidentInfo.possibleCause}
                                        onChange={e => handleInfoChange('possibleCause', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Immediate Action Taken */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Immediate Action Taken</label>
                                    <input
                                        type="text"
                                        placeholder="Enter action taken"
                                        value={incidentInfo.immediateAction}
                                        onChange={e => handleInfoChange('immediateAction', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Investigations */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Investigations</label>
                                    <input
                                        type="text"
                                        placeholder="Enter investigations"
                                        value={incidentInfo.investigations}
                                        onChange={e => handleInfoChange('investigations', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 outline-none focus:border-brown focus:ring-1 focus:ring-brown/20 transition-all placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Month selector */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <div className="relative inline-block">
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
                        </div>

                        {/* Checklist Items */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                                {CHECKLIST_ITEMS.map(item => (
                                    <div key={item}>
                                        <p className="text-sm font-medium text-gray-700 mb-2">{item}</p>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={item}
                                                    value="yes"
                                                    checked={checklistValues[item] === 'yes'}
                                                    onChange={() => handleRadio(item, 'yes')}
                                                    className="accent-brown w-3.5 h-3.5"
                                                />
                                                <span className={`text-sm font-medium ${checklistValues[item] === 'yes' ? 'text-green-700' : 'text-gray-500'}`}>Yes</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={item}
                                                    value="no"
                                                    checked={checklistValues[item] === 'no'}
                                                    onChange={() => handleRadio(item, 'no')}
                                                    className="accent-red-500 w-3.5 h-3.5"
                                                />
                                                <span className={`text-sm font-medium ${checklistValues[item] === 'no' ? 'text-red-600' : 'text-gray-500'}`}>No</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                id="submit-checklist-btn"
                                className="flex items-center gap-2 px-6 py-2.5 bg-brown hover:bg-opacity-90 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                            >
                                <Save size={15} />
                                Submit Checklist
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default FirstAiderChecklist;
