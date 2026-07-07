import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import EmployeeDashboard from '../pages/employee/Dashboard';
import MyCases from '../pages/employee/MyCases';
import ReportIncident from '../pages/employee/ReportIncident';
import CaseSubmissionSuccess from '../pages/common/CaseSubmissionSuccess';
import EmployeeCaseDetails from '../pages/employee/EmployeeCaseDetails';
import OHSSafetyAiAssistant from '../pages/employee/OHSSafetyAiAssistant';

const EmployeeRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="my-cases" element={<ProtectedRoute><MyCases /></ProtectedRoute>} />
            <Route path="my-cases/:id" element={<ProtectedRoute><EmployeeCaseDetails /></ProtectedRoute>} />
            <Route path="submit-case" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="submit-case/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="ai-assistant" element={<ProtectedRoute><OHSSafetyAiAssistant /></ProtectedRoute>} />
        </Routes>
    );
};

export default EmployeeRoutes;
