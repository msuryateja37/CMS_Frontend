import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminDashboard from '../pages/admin/Dashboard';
import IncidentManagement from '../pages/admin/IncidentManagement';
import MyAssignedIncidents from '../pages/admin/MyAssignedIncidents';
import CaseDetails from '../pages/common/CaseDetails';
import Profile from '../pages/common/Profile';
import OHSDashboard from '../pages/ohs/Dashboard';
import OHSMyCases from '../pages/ohs/MyCases';
import OHSCaseAction from '../pages/ohs/CaseAction';
import OHSCasesReview from '../pages/ohs/CasesReviewOHS';
import ReportIncident from '../pages/ohs/ReportIncident';
import HazardReports from '../pages/ohs/HazardReports';
import RiskRegister from '../pages/ohs/RiskRegister';
import JSADocuments from '../pages/ohs/JSADocuments';
import SafeWorkProcedures from '../pages/ohs/SafeWorkProcedures';
import OHSDisabilityForm from '../pages/forms/OHSDisabilityForm';
import OHSInspectionForm from '../pages/forms/OHSInspectionForm';
import OHSNewBuildingForm from '../pages/forms/OHSNewBuildingForm';

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

import SecurityDashboard from '../pages/security_practitioner/SecurityDashboard';
import SecurityMyCases from '../pages/security_practitioner/SecurityMyCases';
import SecurityCasesReview from '../pages/security_practitioner/SecurityCasesReview';
import SecurityCaseAction from '../pages/security_practitioner/SecurityCaseAction';
import { ReportBreach } from '../pages/security_practitioner/ReportBreach';
import { AccessControl } from '../pages/security_practitioner/AccessControl';
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
            <Route path="/ohs/hazards" element={<ProtectedRoute><HazardReports /></ProtectedRoute>} />
            <Route path="/ohs/risk-register" element={<ProtectedRoute><RiskRegister /></ProtectedRoute>} />
            <Route path="/ohs/procedures" element={<ProtectedRoute><SafeWorkProcedures /></ProtectedRoute>} />
            <Route path="/ohs/forms/disability" element={<ProtectedRoute><OHSDisabilityForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/inspection" element={<ProtectedRoute><OHSInspectionForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/building" element={<ProtectedRoute><OHSNewBuildingForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/audit" element={<ProtectedRoute><OHSInspectionForm /></ProtectedRoute>} />
            <Route path="/ohs" element={<Navigate to="/ohs/hazards" replace />} />

            {/* Security Practitioner Routes */}
            <Route path="/security/dashboard" element={<ProtectedRoute><SecurityDashboard /></ProtectedRoute>} />
            <Route path="/security/my-cases" element={<ProtectedRoute><SecurityMyCases /></ProtectedRoute>} />
            <Route path="/security/cases-review" element={<ProtectedRoute><SecurityCasesReview /></ProtectedRoute>} />
            <Route path="/security/cases/:id" element={<ProtectedRoute><SecurityCaseAction /></ProtectedRoute>} />
            <Route path="/security/report-breach" element={<ProtectedRoute><ReportBreach /></ProtectedRoute>} />
            <Route path="/security/access-control" element={<ProtectedRoute><AccessControl /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecurityDashboard /></ProtectedRoute>} />

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
