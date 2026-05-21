import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import SupervisorDashboard from '../pages/supervisor/Dashboard';
import SubmitCase from '../pages/supervisor/SubmitCase';
import CasesReview from '../pages/supervisor/CasesReview';
import Approvals from '../pages/supervisor/Approvals';
import CaseSubmissionSuccess from '../pages/common/CaseSubmissionSuccess';
import CaseDetails from '../pages/common/CaseDetails';
import ApprovalWorkflow from '../pages/supervisor/ApprovalWorkflow';
import { SupervisorInvoiceList, SupervisorInvoiceNew, SupervisorInvoiceDetail } from '../pages/supervisor/InvoiceManagement';

const SupervisorRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute><SupervisorDashboard /></ProtectedRoute>} />
            <Route path="submit-case" element={<ProtectedRoute><SubmitCase /></ProtectedRoute>} />
            <Route path="submit-case/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="cases/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
            <Route path="cases/:id/approve" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
            <Route path="cases-review" element={<ProtectedRoute><CasesReview /></ProtectedRoute>} />
            <Route path="approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />

            {/* Invoice Management Routes */}
            <Route path="invoices" element={<ProtectedRoute><SupervisorInvoiceList /></ProtectedRoute>} />
            <Route path="invoices/new" element={<ProtectedRoute><SupervisorInvoiceNew /></ProtectedRoute>} />
            <Route path="invoices/:id" element={<ProtectedRoute><SupervisorInvoiceDetail /></ProtectedRoute>} />
        </Routes>
    );
};

export default SupervisorRoutes;

