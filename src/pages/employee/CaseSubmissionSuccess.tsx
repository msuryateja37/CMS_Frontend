import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { CheckCircle, FileText, ArrowRight, Home } from 'lucide-react';

interface LocationState {
    caseNumber?: string;
    caseId?: string;
}

const CaseSubmissionSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    // Redirect if no case data
    useEffect(() => {
        if (!state?.caseNumber && !state?.caseId) {
            navigate('/employee/dashboard');
        }
    }, [state, navigate]);

    return (
        <DashboardLayout
            title="Welcome back"
            description="Case Submitted"
            breadcrumbs={[{ label: "Dashboard", path: "/employee/dashboard" }, { label: "Case Submitted" }]}
        >
            <div className="min-h-[600px] flex items-center justify-center">
                <div className="max-w-2xl w-full">
                    {/* Success Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-12 text-center">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-light-green rounded-full flex items-center justify-center">
                                <CheckCircle className="text-dark-green" size={48} />
                            </div>
                        </div>

                        {/* Success Title */}
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">
                            Case Submitted Successfully!
                        </h2>

                        <p className="text-gray-500 text-base mb-8">
                            Your case has been received and will be reviewed by a supervisor
                        </p>

                        {/* Case Number Display */}
                        {state?.caseNumber && (
                            <div className="bg-subtle-grey rounded-2xl p-6 mb-8">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <FileText className="text-green" size={24} />
                                    <span className="text-sm font-bold text-gray-600">Case Number</span>
                                </div>
                                <div className="text-4xl font-bold text-dark-green mb-1">
                                    {state.caseNumber}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Reference this number for all future communications
                                </p>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
                            <h4 className="text-sm font-bold text-gray-800 mb-2">What happens next?</h4>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-green mt-0.5">•</span>
                                    <span>A supervisor will review your case within 48 hours</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green mt-0.5">•</span>
                                    <span>You will receive email notifications on status updates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green mt-0.5">•</span>
                                    <span>Track your case progress in the "My Cases" section</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green mt-0.5">•</span>
                                    <span>You can add additional information or evidence anytime</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/employee/dashboard')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-green text-white font-bold text-sm rounded-xl hover:bg-[#2aa88f] transition-colors shadow-lg shadow-green/20"
                            >
                                <Home size={18} />
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/employee/my-cases')}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                View My Cases
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Submit Another Case Link */}
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/ohs/report-incident')}
                                className="text-green hover:text-dark-green font-medium text-sm transition-colors underline"
                            >
                                Report Another Incident
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CaseSubmissionSuccess;
