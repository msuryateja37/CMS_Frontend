import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import casesService, { type Case } from '../../services/cases.service';
import { useAuthStore } from '../../store/auth.store';
import {
    ArrowLeft, Calendar, User, Clock, AlertCircle, FileText, Download, Save, CheckCircle,
    MessageSquare, Send, Loader2, X, Building2, Shield, HelpCircle
} from 'lucide-react';

const HRCaseDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [wclRecord, setWclRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actioning, setActioning] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Form sections active tab
    const [activeTab, setActiveTab] = useState<'employer' | 'employee' | 'disease' | 'particulars'>('employer');

    // Comment form
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Form inputs state
    const [formData, setFormData] = useState<any>({
        wclReference: '',
        employerName: 'Department of Rural Development and Land Reform',
        employerRegNumber: '990001234567',
        employerContactPerson: 'Thandi Molefe',
        employerAddress: '184 Jeff Masemola St, Pretoria, 0002',
        employerTel: '(012) 312-8911',
        employerFax: '(012) 312-8066',
        employerEmail: 'ohs@drdlr.gov.za',
        employerSituation: 'Providence Office, Pretoria',
        employerNatureOfBusiness: 'Government - Rural Development and Land Reform',

        employeeSurname: '',
        employeeFirstNames: '',
        employeeIdNumber: '',
        employeeDob: '',
        employeeSex: '',
        employeeMaritalState: '',
        employeeCitizenship: 'South Africa',
        employeePersonnelNo: '',
        employeeAddress: '',
        employeePeriodInEmploy: '',
        employeeWorkingDirector: 'No',
        employeeOccupation: '',

        diseaseNature: '',
        diseaseDateDiagnosed: '',
        diseaseAllegedCause: '',
        diseaseExposurePeriod: '',
        diseaseDateReported: '',
        diseasePrevEmployer: 'N/A',
        diseaseWorkOtherEmployer: 'N/A',

        earningsGrossWeek: '0.00',
        earningsGrossMonth: '0.00',
        earningsBonusesWeek: '0.00',
        earningsBonusesMonth: '0.00',
        earningsAllowancesWeek: '0.00',
        earningsAllowancesMonth: '0.00',
        earningsFoodWeek: '0.00',
        earningsFoodMonth: '0.00',
        earningsQuartersWeek: '0.00',
        earningsQuartersMonth: '0.00',
        continueFreeFood: 'No',
        continueFreeQuarters: 'No',
        prepCashPayments: 'No',
        totalCashPaid: '0.00',
        cashPaymentPeriod: '—',
        dateCeasedWork: '',
        dateResumedWork: '—',
        prevCompensation: 'None',
        deliberateNonCompliance: 'No',
        deliberateDisregard: 'No',
    });

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const caseRes = await casesService.getCaseById(id);
            setCaseData(caseRes);

            const wclRes = await casesService.getWclRecord(id);
            setWclRecord(wclRes);

            // Populate form inputs with existing wcl record data, falling back to defaults
            setFormData((prev: any) => ({
                ...prev,
                ...wclRes,
                wclReference: wclRes.wclReference || '',
                // Fallback employee name/surname from reportedBy if empty
                employeeFirstNames: wclRes.employeeFirstNames || caseRes.reportedBy?.name?.split(' ')[0] || '',
                employeeSurname: wclRes.employeeSurname || caseRes.reportedBy?.name?.split(' ').slice(1).join(' ') || '',
            }));
        } catch (err) {
            console.error(err);
            setError('Failed to load incident or WCL details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleSelfAssign = async () => {
        if (!id || !user) return;
        setActioning(true);
        try {
            await casesService.hrPickupCase(id);
            showSuccess('Case self-assigned successfully.');
            fetchData();
        } catch (err) {
            setError('Failed to self-assign case.');
        } finally {
            setActioning(false);
        }
    };

    const handleIssueWcl = async () => {
        if (!id) return;
        setActioning(true);
        try {
            await casesService.hrUpdateStatus(id, 'WCL_ISSUED');
            showSuccess('WCL Form issued to employee successfully.');
            fetchData();
        } catch (err) {
            setError('Failed to issue WCL form.');
        } finally {
            setActioning(false);
        }
    };

    const handleSaveWclRecord = async () => {
        if (!id) return;
        setSaving(true);
        try {
            await casesService.updateWclRecord(id, formData);
            showSuccess('WCL Form details saved successfully.');
            fetchData();
        } catch (err) {
            setError('Failed to save WCL details.');
        } finally {
            setSaving(false);
        }
    };

    const handleCloseHrCase = async () => {
        if (!id) return;
        setActioning(true);
        try {
            await casesService.hrUpdateStatus(id, 'CLOSED');
            showSuccess('HR Benefits track for this case closed successfully.');
            fetchData();
        } catch (err) {
            setError('Failed to close HR case.');
        } finally {
            setActioning(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!id) return;
        setDownloading(true);
        try {
            await casesService.downloadWclPdf(id);
            showSuccess('WCL PDF downloaded successfully.');
        } catch (err) {
            setError('Failed to download WCL PDF.');
        } finally {
            setDownloading(false);
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !id) return;
        setSubmittingComment(true);
        try {
            await casesService.addComment(id, comment.trim());
            setComment('');
            showSuccess('Comment added successfully.');
            fetchData();
        } catch (err) {
            setError('Failed to add comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <DashboardLayout title="WCL Details" description="Loading..." breadcrumbs={[{ label: "WCL Records", path: "/hr/wcl-records" }, { label: "Loading..." }]}>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!caseData) {
        return (
            <DashboardLayout title="WCL Details" description="Error" breadcrumbs={[{ label: "WCL Records", path: "/hr/wcl-records" }, { label: "Error" }]}>
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                    <p className="font-bold">Error</p>
                    <p className="text-sm mt-1">{error || 'Incident details not found.'}</p>
                    <button onClick={() => navigate(-1)} className="mt-3 bg-red-100 px-4 py-2 rounded-lg text-red-800 font-bold text-sm">Go Back</button>
                </div>
            </DashboardLayout>
        );
    }

    const hrStatus = caseData.hrStatus || 'HR_UNASSIGNED';
    const isHrAssignedToMe = caseData.hrAssignedTo?.id === user?.id;
    const isEditable = (hrStatus === 'WCL_PROCESSED' || hrStatus === 'WCL_ISSUED') && isHrAssignedToMe;
    const isClosed = hrStatus === 'CLOSED';

    return (
        <DashboardLayout
            title={`Incident ${caseData.incidentNumber}`}
            description="Workmen's Compensation (WCL1) claiming overview."
            breadcrumbs={[{ label: 'WCL Records', path: '/hr/wcl-records' }, { label: caseData.incidentNumber }]}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Status Banners */}
                {successMsg && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <CheckCircle size={16} />
                        {successMsg}
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
                    </div>
                )}

                {/* Back and Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => navigate('/hr/dashboard')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors font-semibold text-sm"
                    >
                        <ArrowLeft size={18} />
                        <span>Back to Dashboard</span>
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Self Assign */}
                        {hrStatus === 'HR_UNASSIGNED' && (
                            <button
                                onClick={handleSelfAssign}
                                disabled={actioning}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                            >
                                {actioning ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                                <span>Self Assign Incident</span>
                            </button>
                        )}

                        {/* Issue WCL Form */}
                        {hrStatus === 'HR_ASSIGNED' && isHrAssignedToMe && (
                            <button
                                onClick={handleIssueWcl}
                                disabled={actioning}
                                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                            >
                                {actioning ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                                <span>Issue WCL Form to Employee</span>
                            </button>
                        )}

                        {/* Save Changes */}
                        {isEditable && (
                            <button
                                onClick={handleSaveWclRecord}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                <span>Save Form Changes</span>
                            </button>
                        )}

                        {/* Download WCL PDF */}
                        {(hrStatus === 'WCL_PROCESSED' || isClosed) && (
                            <button
                                onClick={handleDownloadPdf}
                                disabled={downloading}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                            >
                                {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                                <span>Download WCL Form PDF</span>
                            </button>
                        )}

                        {/* Close HR Case */}
                        {hrStatus === 'WCL_PROCESSED' && isHrAssignedToMe && (
                            <button
                                onClick={handleCloseHrCase}
                                disabled={actioning}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                            >
                                {actioning ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                                <span>Close Case (HR Closure)</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2/3 - Form and Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* WCL claim processing header card */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Workmen's Compensation Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">WCL Reference</label>
                                    {isEditable ? (
                                        <input
                                            type="text"
                                            value={formData.wclReference}
                                            onChange={(e) => handleInputChange('wclReference', e.target.value)}
                                            placeholder="Enter Reference (e.g. WCL-2026-001)"
                                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    ) : (
                                        <span className="text-xs font-mono font-bold text-gray-800">
                                            {wclRecord?.wclReference || <span className="text-gray-400 italic">Not issued</span>}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">HR Processing Status</label>
                                    <span className="inline-block text-xs font-semibold">
                                        {hrStatus === 'HR_UNASSIGNED' && <span className="text-gray-500">Unassigned</span>}
                                        {hrStatus === 'HR_ASSIGNED' && <span className="text-indigo-600">Awaiting WCL Form</span>}
                                        {hrStatus === 'WCL_ISSUED' && <span className="text-amber-600">Form Sent to Employee</span>}
                                        {hrStatus === 'WCL_PROCESSED' && <span className="text-emerald-600">WCL Form Processed</span>}
                                        {hrStatus === 'CLOSED' && <span className="text-gray-400">Closed</span>}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">HR Officer Assigned</label>
                                    <span className="text-xs font-semibold text-gray-800">
                                        {caseData.hrAssignedTo?.name || <span className="text-gray-400 italic">Unassigned</span>}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* WCL1 Form Sections */}
                        {(hrStatus === 'WCL_PROCESSED' || hrStatus === 'WCL_ISSUED' || isClosed) && (
                            <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                                {/* Form Section Tabs */}
                                <div className="flex border-b border-gray-100 bg-gray-50/50">
                                    <button
                                        onClick={() => setActiveTab('employer')}
                                        className={`flex-1 px-4 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === 'employer' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                    >
                                        1. Employer Info
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('employee')}
                                        className={`flex-1 px-4 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === 'employee' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                    >
                                        2. Employee Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('disease')}
                                        className={`flex-1 px-4 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === 'disease' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                    >
                                        3. Disease &amp; Cause
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('particulars')}
                                        className={`flex-1 px-4 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === 'particulars' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                    >
                                        4. Other Particulars
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Tab 1: Employer */}
                                    {activeTab === 'employer' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Registered Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.employerName}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Registration Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.employerRegNumber}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employerRegNumber', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Contact Person</label>
                                                <input
                                                    type="text"
                                                    value={formData.employerContactPerson}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employerContactPerson', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Telephone Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.employerTel}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employerTel', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    value={formData.employerAddress}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employerAddress', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab 2: Employee */}
                                    {activeTab === 'employee' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Surname</label>
                                                <input
                                                    type="text"
                                                    value={formData.employeeSurname}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeeSurname', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">First Name(s)</label>
                                                <input
                                                    type="text"
                                                    value={formData.employeeFirstNames}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeeFirstNames', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ID Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.employeeIdNumber}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeeIdNumber', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    value={formData.employeeDob}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeeDob', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Sex</label>
                                                <select
                                                    value={formData.employeeSex}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeeSex', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                >
                                                    <option value="">Select Sex</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Personnel Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.employeePersonnelNo}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeePersonnelNo', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Occupation</label>
                                                <input
                                                    type="text"
                                                    value={formData.employeeOccupation || ''}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeeOccupation', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Period in Employ</label>
                                                <input
                                                    type="text"
                                                    value={formData.employeePeriodInEmploy || ''}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeePeriodInEmploy', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Working Director / CC Member / Owner?</label>
                                                <select
                                                    value={formData.employeeWorkingDirector || 'No'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeeWorkingDirector', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    value={formData.employeeAddress}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('employeeAddress', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab 3: Disease */}
                                    {activeTab === 'disease' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nature of Disease</label>
                                                <input
                                                    type="text"
                                                    value={formData.diseaseNature || ''}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('diseaseNature', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Date Diagnosed</label>
                                                <input
                                                    type="date"
                                                    value={formData.diseaseDateDiagnosed || ''}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('diseaseDateDiagnosed', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Exposure Period</label>
                                                <input
                                                    type="text"
                                                    value={formData.diseaseExposurePeriod || ''}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('diseaseExposurePeriod', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Date Employee Reported Disease</label>
                                                <input
                                                    type="date"
                                                    value={formData.diseaseDateReported || ''}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('diseaseDateReported', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Previous Employer (if applicable)</label>
                                                <input
                                                    type="text"
                                                    value={formData.diseasePrevEmployer || 'N/A'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('diseasePrevEmployer', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Work Performed with Other Employer</label>
                                                <input
                                                    type="text"
                                                    value={formData.diseaseWorkOtherEmployer || 'N/A'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('diseaseWorkOtherEmployer', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Alleged Cause of Disease</label>
                                                <textarea
                                                    value={formData.diseaseAllegedCause || ''}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('diseaseAllegedCause', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab 4: Other Particulars */}
                                    {activeTab === 'particulars' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Gross Cash Earnings (per Week)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsGrossWeek || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsGrossWeek', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Gross Cash Earnings (per Month)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsGrossMonth || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsGrossMonth', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bonuses (per Week)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsBonusesWeek || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsBonusesWeek', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Bonuses (per Month)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsBonusesMonth || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsBonusesMonth', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Other Allowances (per Week)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsAllowancesWeek || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsAllowancesWeek', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Other Allowances (per Month)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsAllowancesMonth || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsAllowancesMonth', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Cash Value of Food (per Week)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsFoodWeek || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsFoodWeek', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Cash Value of Food (per Month)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsFoodMonth || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsFoodMonth', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Value of Free Quarters (per Week)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsQuartersWeek || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsQuartersWeek', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Value of Free Quarters (per Month)</label>
                                                <input
                                                    type="text"
                                                    value={formData.earningsQuartersMonth || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('earningsQuartersMonth', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Continue Free Food during disablement?</label>
                                                <select
                                                    value={formData.continueFreeFood || 'No'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('continueFreeFood', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Continue Free Quarters during disablement?</label>
                                                <select
                                                    value={formData.continueFreeQuarters || 'No'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('continueFreeQuarters', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Prepared to make Cash Payments (&gt;3 Months)?</label>
                                                <select
                                                    value={formData.prepCashPayments || 'No'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('prepCashPayments', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Cash Already Paid (R)</label>
                                                <input
                                                    type="text"
                                                    value={formData.totalCashPaid || '0.00'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('totalCashPaid', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Cash Payment Period</label>
                                                <input
                                                    type="text"
                                                    value={formData.cashPaymentPeriod || '—'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('cashPaymentPeriod', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Date Employee Ceased Work</label>
                                                <input
                                                    type="date"
                                                    value={formData.dateCeasedWork || ''}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('dateCeasedWork', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Date Employee Resumed Work</label>
                                                <input
                                                    type="text"
                                                    value={formData.dateResumedWork || '—'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('dateResumedWork', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Previous Compensation</label>
                                                <input
                                                    type="text"
                                                    value={formData.prevCompensation || 'None'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('prevCompensation', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Deliberate Non-Compliance?</label>
                                                <select
                                                    value={formData.deliberateNonCompliance || 'No'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('deliberateNonCompliance', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Deliberate Disregard of Safety Laws?</label>
                                                <select
                                                    value={formData.deliberateDisregard || 'No'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleInputChange('deliberateDisregard', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                                                >
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* General Incident Description Card */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Incident Description</h2>
                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{caseData.description || 'No description provided.'}</p>
                        </div>

                        {/* Treatment Record Section */}
                        {caseData.treatmentAdministered && (
                            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4">
                                <h2 className="text-sm font-bold text-gray-450 uppercase tracking-wider mb-2">First Aid Treatment Log</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Actions Taken</label>
                                        <span className="font-semibold text-gray-800">{caseData.treatmentAdministered}</span>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Outcome</label>
                                        <span className="font-semibold text-gray-800 capitalize">{caseData.treatmentOutcome}</span>
                                    </div>
                                    {caseData.treatmentOutcome === 'referred' && (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Referral Facility</label>
                                                <span className="font-semibold text-gray-800">{caseData.treatmentReferral || '—'}</span>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Reason for Referral</label>
                                                <span className="font-semibold text-gray-800">{caseData.treatmentReason || '—'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right 1/3 - Timeline and Comments */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Claim Quick Info</h3>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                                <span className="text-gray-400 font-bold uppercase">OHS Status</span>
                                <span className="font-semibold text-gray-800">{caseData.status.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                                <span className="text-gray-400 font-bold uppercase">Category</span>
                                <span className="font-semibold text-gray-800 capitalize">{caseData.category}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                                <span className="text-gray-400 font-bold uppercase">Reported By</span>
                                <span className="font-semibold text-gray-800">{caseData.reportedBy?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 text-xs">
                                <span className="text-gray-400 font-bold uppercase">Date Occurred</span>
                                <span className="font-semibold text-gray-800">
                                    {caseData.occurredAt ? new Date(caseData.occurredAt).toLocaleDateString('en-GB') : '—'}
                                </span>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Comments &amp; Activity Log</h3>

                            {/* Add Comment Box */}
                            <div className="space-y-2">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Type claim notes or comments here..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 resize-none"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!comment.trim() || submittingComment}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                        {submittingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                        <span>Add Comment</span>
                                    </button>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                {caseData.comments && caseData.comments.length > 0 ? (
                                    caseData.comments.map((c: any) => (
                                        <div key={c.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                                            <div className="flex justify-between font-bold text-gray-800">
                                                <span>{c.user?.name || 'HR User'}</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(c.createdAt).toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 font-semibold leading-relaxed whitespace-pre-wrap">{c.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-4 font-semibold">No comments added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HRCaseDetails;
