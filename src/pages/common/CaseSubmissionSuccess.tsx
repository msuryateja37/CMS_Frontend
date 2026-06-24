import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { CheckCircle, FileText, ArrowRight, Home } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface LocationState {
    caseNumber?: string;
    caseId?: string;
}

const CaseSubmissionSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const state = location.state as LocationState;

    const userRole = user?.role?.name?.toUpperCase() || 'EMPLOYEE';

    // Determine paths based on role
    let dashboardPath = '/employee/dashboard';
    let viewCasesPath = '/employee/my-cases';
    let submitAnotherPath = '/ohs/report-incident';
    let viewCasesLabel = 'View My Cases';
    let nextSteps = [
        "Supervisor review within 48 hours",
        "Email updates on status changes",
        "Track status under 'My Cases'"
    ];

    if (userRole === 'SUPERVISOR') {
        dashboardPath = '/supervisor/dashboard';
        viewCasesPath = '/supervisor/cases-review';
        submitAnotherPath = '/supervisor/submit-case';
        viewCasesLabel = 'View All Cases';
        nextSteps = [
            "Your case will be reviewed within 48 hours",
            "You will receive email notifications on status updates",
            "Track progress in the 'Cases for Review' section"
        ];
    } else if (userRole === 'OHS_PRACTITIONER') {
        dashboardPath = '/ohs/dashboard';
        viewCasesPath = '/ohs/my-cases';
        submitAnotherPath = '/ohs/report-incident';
        viewCasesLabel = 'View My Cases';
        nextSteps = [
            "Supervisor review within 48 hours",
            "Email updates on status changes",
            "Track status under 'My Cases'"
        ];
    }

    // Redirect if no case data
    useEffect(() => {
        if (!state?.caseNumber && !state?.caseId) {
            navigate(dashboardPath);
        }
    }, [state, navigate, dashboardPath]);

    return (
        <DashboardLayout
            title={userRole === 'SUPERVISOR' ? 'Case Submitted' : 'Welcome back'}
            description="Case Submitted"
            breadcrumbs={[{ label: "Dashboard", path: dashboardPath }, { label: "Case Submitted" }]}
        >
            <div className="min-h-[500px] flex items-center justify-center py-8">
                <div className="max-w-xl w-full px-4">
                    {/* Success Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 md:p-10 text-center">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-light-gold rounded-full flex items-center justify-center">
                                <CheckCircle className="text-brown" size={32} />
                            </div>
                        </div>

                        {/* Success Title */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Case Submitted Successfully!
                        </h2>

                        <p className="text-gray-500 text-sm mb-6">
                            {userRole === 'SUPERVISOR'
                                ? 'Your case has been created and assigned for review.'
                                : 'Your case has been received and will be reviewed by a supervisor.'}
                        </p>

                        {/* Case Number Display */}
                        {state?.caseNumber && (
                            <div className="bg-subtle-grey rounded-xl p-5 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-1.5">
                                    <FileText className="text-gold" size={18} />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Case Number</span>
                                </div>
                                <div className="text-3xl font-bold text-brown mb-0.5">
                                    {state.caseNumber}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Reference this number for future communication
                                </p>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="bg-blue-50/75 border border-blue-100 rounded-lg p-4 mb-6 text-left">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">What happens next?</h4>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                {nextSteps.map((stepText, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-gold mt-0.5">•</span>
                                        <span>{stepText}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => navigate(dashboardPath)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Home size={15} />
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => navigate(viewCasesPath)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-white font-bold text-xs rounded-lg hover:bg-[#A1743E] transition-colors shadow-md shadow-gold/10"
                            >
                                {viewCasesLabel}
                                <ArrowRight size={15} />
                            </button>
                        </div>

                        {/* Submit Another Case Link */}
                        <div className="mt-5">
                            <button
                                onClick={() => navigate(submitAnotherPath)}
                                className="text-gold hover:text-brown font-semibold text-xs transition-colors underline"
                            >
                                {userRole === 'SUPERVISOR' ? 'Submit Another Case' : 'Report Another Incident'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CaseSubmissionSuccess;
