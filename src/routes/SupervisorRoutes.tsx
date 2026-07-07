import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import SupervisorDashboard from '../pages/supervisor/Dashboard';
import ReportIncident from '../pages/employee/ReportIncident';
import CaseSubmissionSuccess from '../pages/common/CaseSubmissionSuccess';
import CaseDetails from '../pages/common/CaseDetails';
import { SupervisorInvoiceList, SupervisorInvoiceNew, SupervisorInvoiceDetail } from '../pages/supervisor/InvoiceManagement';
import LoggedIncidents from '../pages/supervisor/LoggedIncidents';
import OHSSafetyAiAssistant from '../pages/employee/OHSSafetyAiAssistant';

const SupervisorRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute><SupervisorDashboard /></ProtectedRoute>} />
            <Route path="logged-incidents" element={<ProtectedRoute><LoggedIncidents /></ProtectedRoute>} />
            <Route path="ai-assistant" element={<ProtectedRoute><OHSSafetyAiAssistant /></ProtectedRoute>} />
            <Route path="submit-case" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="submit-case/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="cases/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />

            {/* Invoice Management Routes */}
            <Route path="invoices" element={<ProtectedRoute><SupervisorInvoiceList /></ProtectedRoute>} />
            <Route path="invoices/new" element={<ProtectedRoute><SupervisorInvoiceNew /></ProtectedRoute>} />
            <Route path="invoices/:id" element={<ProtectedRoute><SupervisorInvoiceDetail /></ProtectedRoute>} />
        </Routes>
    );
};

export default SupervisorRoutes;

