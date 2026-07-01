import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminDashboard from '../pages/admin/Dashboard';
import IncidentManagement from '../pages/admin/IncidentManagement';
import MyAssignedIncidents from '../pages/admin/MyAssignedIncidents';
import CaseDetails from '../pages/common/CaseDetails';
import Profile from '../pages/common/Profile';
import CaseSubmissionSuccess from '../pages/common/CaseSubmissionSuccess';
import OHSDashboard from '../pages/ohs/Dashboard';
import OHSMyCases from '../pages/ohs/MyCases';
import OHSCaseAction from '../pages/ohs/CaseAction';
import OHSCasesReview from '../pages/ohs/CasesReviewOHS';
import ReportIncident from '../pages/ohs/ReportIncident';
import OHSSubmitCase from '../pages/ohs/SubmitCase';
import HazardReports from '../pages/ohs/HazardReports';
import RiskRegister from '../pages/ohs/RiskRegister';
import JSADocuments from '../pages/ohs/JSADocuments';
import SafeWorkProcedures from '../pages/ohs/SafeWorkProcedures';
import OHSDisabilityForm from '../pages/forms/OHSDisabilityForm';
import OHSInspectionForm from '../pages/forms/OHSInspectionForm';
import OHSNewBuildingForm from '../pages/forms/OHSNewBuildingForm';
import OHSAuditForm from '../pages/forms/OHSAuditForm';
import OHSHazardForm from '../pages/forms/OHSHazardForm';
import OHSFormSubmissions from '../pages/forms/OHSFormSubmissionshistory';

import PermitToWork from '../pages/operations/PermitToWork';
import Inspections from '../pages/operations/Inspections';
import Audits from '../pages/operations/Audits';
import ResponsePlan from '../pages/emergency/ResponsePlan';
import DrillSchedule from '../pages/emergency/DrillSchedule';
import EquipmentInventory from '../pages/emergency/EquipmentInventory';
import KPIDashboard from '../pages/performance/KPIDashboard';
import PDCAWorkflow from '../pages/performance/PDCAWorkflow';
import ActionPlans from '../pages/performance/ActionPlans';
import Administration from '../pages/admin/Administration';
import FormBuilderSettings from '../pages/admin/FormBuilderSettings';

import FirstAiderDashboard from '../pages/first_aider/FirstAiderDashboard';
import FirstAiderMyCases from '../pages/first_aider/FirstAiderMyCases';
import FirstAiderCasesReview from '../pages/first_aider/FirstAiderCasesReview';
import FirstAiderCaseAction from '../pages/first_aider/FirstAiderCaseAction';
import CasePool from '../pages/ohs/CasePool';
import HRCaseReview from '../pages/hr/HRCaseReview';
import InvoiceInbox from '../pages/invoices/InvoiceInbox';
import PendingApproval from '../pages/invoices/PendingApproval';
import PaymentTracking from '../pages/invoices/PaymentTracking';
import { AdminInvoiceList, AdminInvoiceDetail } from '../pages/admin/AdminInvoiceManagement';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/incidents" element={<ProtectedRoute><IncidentManagement /></ProtectedRoute>} />
            <Route path="/admin/incidents/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
            <Route path="/admin/incidents/assigned" element={<ProtectedRoute><MyAssignedIncidents /></ProtectedRoute>} />

            {/* OHS Practitioner Routes */}
            <Route path="/ohs/dashboard" element={<ProtectedRoute><OHSDashboard /></ProtectedRoute>} />
            <Route path="/ohs/my-cases" element={<ProtectedRoute><OHSMyCases /></ProtectedRoute>} />
            <Route path="/ohs/cases-review" element={<ProtectedRoute><OHSCasesReview /></ProtectedRoute>} />
            <Route path="/ohs/cases/:id" element={<ProtectedRoute><OHSCaseAction /></ProtectedRoute>} />
            <Route path="/ohs/report-incident" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="/ohs/submit-case" element={<ProtectedRoute><OHSSubmitCase /></ProtectedRoute>} />
            <Route path="/ohs/report-incident/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="/ohs/submit-case/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="/ohs/pool" element={<ProtectedRoute><CasePool /></ProtectedRoute>} />
            <Route path="/ohs/hazards" element={<ProtectedRoute><HazardReports /></ProtectedRoute>} />
            <Route path="/ohs/risk-register" element={<ProtectedRoute><RiskRegister /></ProtectedRoute>} />
            <Route path="/ohs/procedures" element={<ProtectedRoute><SafeWorkProcedures /></ProtectedRoute>} />
            <Route path="/ohs/forms/disability" element={<ProtectedRoute><OHSDisabilityForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/inspection" element={<ProtectedRoute><OHSInspectionForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/building" element={<ProtectedRoute><OHSNewBuildingForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/audit" element={<ProtectedRoute><OHSAuditForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/hazard" element={<ProtectedRoute><OHSHazardForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/submissions" element={<ProtectedRoute><OHSFormSubmissions /></ProtectedRoute>} />
            <Route path="/ohs" element={<Navigate to="/ohs/hazards" replace />} />

            {/* First Aider Routes (health cases) */}
            <Route path="/first-aider/dashboard" element={<ProtectedRoute><FirstAiderDashboard /></ProtectedRoute>} />
            <Route path="/first-aider/my-cases" element={<ProtectedRoute><FirstAiderMyCases /></ProtectedRoute>} />
            <Route path="/first-aider/cases-review" element={<ProtectedRoute><FirstAiderCasesReview /></ProtectedRoute>} />
            <Route path="/first-aider/cases/:id" element={<ProtectedRoute><FirstAiderCaseAction /></ProtectedRoute>} />
            <Route path="/first-aider" element={<ProtectedRoute><FirstAiderDashboard /></ProtectedRoute>} />

            {/* HR Routes (review + close cases) */}
            <Route path="/hr/cases" element={<ProtectedRoute><HRCaseReview /></ProtectedRoute>} />
            <Route path="/hr" element={<ProtectedRoute><HRCaseReview /></ProtectedRoute>} />

            {/* Operations Routes */}
            <Route path="/operations/permits" element={<ProtectedRoute><PermitToWork /></ProtectedRoute>} />
            <Route path="/operations/inspections" element={<ProtectedRoute><Inspections /></ProtectedRoute>} />
            <Route path="/operations/audits" element={<ProtectedRoute><Audits /></ProtectedRoute>} />

            {/* Emergency Routes */}
            <Route path="/emergency/plan" element={<ProtectedRoute><ResponsePlan /></ProtectedRoute>} />
            <Route path="/emergency/drills" element={<ProtectedRoute><DrillSchedule /></ProtectedRoute>} />
            <Route path="/emergency/inventory" element={<ProtectedRoute><EquipmentInventory /></ProtectedRoute>} />

            {/* Performance Routes */}
            <Route path="/performance/kpi" element={<ProtectedRoute><KPIDashboard /></ProtectedRoute>} />
            <Route path="/performance/pdca" element={<ProtectedRoute><PDCAWorkflow /></ProtectedRoute>} />
            <Route path="/performance/actions" element={<ProtectedRoute><ActionPlans /></ProtectedRoute>} />

            {/* Administration Routes */}
            <Route path="/admin/administration" element={<ProtectedRoute><Administration /></ProtectedRoute>} />
            <Route path="/admin/forms/builder" element={<ProtectedRoute><FormBuilderSettings /></ProtectedRoute>} />

            {/* Invoice Routes */}
            <Route path="/invoices/inbox" element={<ProtectedRoute><InvoiceInbox /></ProtectedRoute>} />
            <Route path="/invoices/pending" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
            <Route path="/invoices/tracking" element={<ProtectedRoute><PaymentTracking /></ProtectedRoute>} />

            {/* Admin Invoice Management */}
            <Route path="/admin/invoice-management" element={<ProtectedRoute><AdminInvoiceList /></ProtectedRoute>} />
            <Route path="/admin/invoice-management/:id" element={<ProtectedRoute><AdminInvoiceDetail /></ProtectedRoute>} />

            {/* Common Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Catch all redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AdminRoutes;
