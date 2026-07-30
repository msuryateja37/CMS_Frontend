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
import ReportIncident from '../pages/employee/ReportIncident';
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
import OHSInspections from '../pages/ohs/Inspections';
import OHSHira from '../pages/ohs/Hira';

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
import FirstAiderMyRegistry from '../pages/first_aider/FirstAiderMyRegistry';
import FirstAiderChecklist from '../pages/first_aider/FirstAiderChecklist';
import FirstAiderDressingRegistry from '../pages/first_aider/FirstAiderDressingRegistry';
import CasePool from '../pages/ohs/CasePool';
import HRDashboard from '../pages/hr/Dashboard';
import HRLoggedIncidents from '../pages/hr/LoggedIncidents';
import HRWCLRecords from '../pages/hr/WCLRecords';
import HRCaseDetails from '../pages/hr/HRCaseDetails';
import HRAIAssistant from '../pages/hr/AIAssistant';
import InvoiceInbox from '../pages/invoices/InvoiceInbox';
import PendingApproval from '../pages/invoices/PendingApproval';
import PaymentTracking from '../pages/invoices/PaymentTracking';
import { AdminInvoiceList, AdminInvoiceDetail } from '../pages/admin/AdminInvoiceManagement';
import NationalDashboard from '../pages/ohs_national/NationalDashboard';
import NationalLoggedIncidents from '../pages/ohs_national/NationalLoggedIncidents';
import NationalAdministration from '../pages/ohs_national/NationalAdministration';
import NationalAIAssistant from '../pages/ohs_national/NationalAIAssistant';
import PlaceholderPage from '../components/common/PlaceholderPage';
import OHSSafetyAiAssistant from '../pages/employee/OHSSafetyAiAssistant';
import PssCDashboard from '../pages/pssc/Dashboard';
import PssCReports from '../pages/pssc/Reports';
import PssCInspectionRegistry from '../pages/pssc/InspectionRegistry';
import PssCMonthlyStatistics from '../pages/pssc/MonthlyStatistics';

import DeputyDashboard from '../pages/deputy/Dashboard';
import DeputyReports from '../pages/deputy/Reports';
import DeputyInspectionRegistry from '../pages/deputy/InspectionRegistry';
import DeputyMonthlyStatistics from '../pages/deputy/MonthlyStatistics';

import ChiefDirectorDashboard from '../pages/chief_director/Dashboard';
import ChiefDirectorInfrastructure from '../pages/chief_director/InfrastructureIncidents';
import ChiefDirectorEscalations from '../pages/chief_director/EscalationReports';
import ChiefDirectorStrategicDecisions from '../pages/chief_director/StrategicDecisions';
import ChiefDirectorCompliance from '../pages/chief_director/ProvincialCompliance';
import ChiefDirectorAIAssistant from '../pages/chief_director/AIAssistant';
import ChiefDirectorIncidentApprovals from '../pages/chief_director/IncidentApprovals';

import FacilitiesMemorandum from '../pages/facilities/Memorandum';

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
            <Route path="/ohs/submit-case" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="/ohs/report-incident/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="/ohs/submit-case/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="/ohs/pool" element={<ProtectedRoute><CasePool /></ProtectedRoute>} />
            <Route path="/ohs/inspections" element={<ProtectedRoute><OHSInspections /></ProtectedRoute>} />
            <Route path="/ohs/hira" element={<ProtectedRoute><OHSHira /></ProtectedRoute>} />
            <Route path="/ohs/hazards" element={<ProtectedRoute><HazardReports /></ProtectedRoute>} />
            <Route path="/ohs/risk-register" element={<ProtectedRoute><RiskRegister /></ProtectedRoute>} />
            <Route path="/ohs/procedures" element={<ProtectedRoute><SafeWorkProcedures /></ProtectedRoute>} />
            <Route path="/ohs/forms/disability" element={<ProtectedRoute><OHSDisabilityForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/inspection" element={<ProtectedRoute><OHSInspectionForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/building" element={<ProtectedRoute><OHSNewBuildingForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/audit" element={<ProtectedRoute><OHSAuditForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/hazard" element={<ProtectedRoute><OHSHazardForm /></ProtectedRoute>} />
            <Route path="/ohs/forms/submissions" element={<ProtectedRoute><OHSFormSubmissions /></ProtectedRoute>} />
            <Route path="/ohs" element={<Navigate to="/ohs/dashboard" replace />} />

            {/* OHS National Office Routes */}
            <Route path="/ohs-national/dashboard" element={<ProtectedRoute><NationalDashboard /></ProtectedRoute>} />
            <Route path="/ohs-national/logged-incidents" element={<ProtectedRoute><NationalLoggedIncidents /></ProtectedRoute>} />
            <Route path="/ohs-national/administration" element={<ProtectedRoute><NationalAdministration /></ProtectedRoute>} />
            <Route path="/ohs-national/ai-assistant" element={<ProtectedRoute><NationalAIAssistant /></ProtectedRoute>} />
            <Route path="/ohs-national" element={<Navigate to="/ohs-national/dashboard" replace />} />

            {/* First Aider Routes (health cases) */}
            <Route path="/first-aider/dashboard" element={<ProtectedRoute><FirstAiderDashboard /></ProtectedRoute>} />
            <Route path="/first-aider/my-cases" element={<ProtectedRoute><FirstAiderMyCases /></ProtectedRoute>} />
            <Route path="/first-aider/cases-review" element={<ProtectedRoute><FirstAiderCasesReview /></ProtectedRoute>} />
            <Route path="/first-aider/my-registry" element={<ProtectedRoute><FirstAiderMyRegistry /></ProtectedRoute>} />
            <Route path="/first-aider/checklist" element={<ProtectedRoute><FirstAiderChecklist /></ProtectedRoute>} />
            <Route path="/first-aider/dressing-registry" element={<ProtectedRoute><FirstAiderDressingRegistry /></ProtectedRoute>} />
            <Route path="/first-aider/report-incident" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="/first-aider/cases/:id" element={<ProtectedRoute><FirstAiderCaseAction /></ProtectedRoute>} />
            <Route path="/first-aider" element={<ProtectedRoute><FirstAiderDashboard /></ProtectedRoute>} />

            {/* HR Routes (review + close cases) */}
            <Route path="/hr/dashboard" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
            <Route path="/hr/logged-incidents" element={<ProtectedRoute><HRLoggedIncidents /></ProtectedRoute>} />
            <Route path="/hr/wcl-records" element={<ProtectedRoute><HRWCLRecords /></ProtectedRoute>} />
            <Route path="/hr/cases/:id" element={<ProtectedRoute><HRCaseDetails /></ProtectedRoute>} />
            <Route path="/hr/ai-assistant" element={<ProtectedRoute><HRAIAssistant /></ProtectedRoute>} />
            <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />

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

            {/* PSSC Coordinator specific routes */}
            <Route path="/pssc/dashboard" element={<ProtectedRoute><PssCDashboard /></ProtectedRoute>} />
            <Route path="/pssc/reports" element={<ProtectedRoute><PssCReports /></ProtectedRoute>} />
            <Route path="/pssc/inspection-registry" element={<ProtectedRoute><PssCInspectionRegistry /></ProtectedRoute>} />
            <Route path="/pssc/monthly-statistics" element={<ProtectedRoute><PssCMonthlyStatistics /></ProtectedRoute>} />
            <Route path="/pssc/incidents" element={<ProtectedRoute><IncidentManagement /></ProtectedRoute>} />
            <Route path="/pssc/incidents/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
            <Route path="/pssc/report-incident" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="/pssc/hira" element={<ProtectedRoute><OHSHira /></ProtectedRoute>} />
            <Route path="/pssc/ai-assistant" element={<ProtectedRoute><OHSSafetyAiAssistant /></ProtectedRoute>} />

            {/* Deputy Director specific routes */}
            <Route path="/deputy/dashboard" element={<ProtectedRoute><DeputyDashboard /></ProtectedRoute>} />
            <Route path="/deputy/reports" element={<ProtectedRoute><DeputyReports /></ProtectedRoute>} />
            <Route path="/deputy/inspection-registry" element={<ProtectedRoute><DeputyInspectionRegistry /></ProtectedRoute>} />
            <Route path="/deputy/monthly-statistics" element={<ProtectedRoute><DeputyMonthlyStatistics /></ProtectedRoute>} />
            <Route path="/deputy/incidents" element={<ProtectedRoute><IncidentManagement /></ProtectedRoute>} />
            <Route path="/deputy/incidents/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
            <Route path="/deputy/report-incident" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="/deputy/hira" element={<ProtectedRoute><OHSHira /></ProtectedRoute>} />
            <Route path="/deputy/ai-assistant" element={<ProtectedRoute><OHSSafetyAiAssistant /></ProtectedRoute>} />

            {/* Facilities Co Coordinator routes (reuse the OHS Practitioner workflow) */}
            <Route path="/facilities/dashboard" element={<ProtectedRoute><OHSDashboard /></ProtectedRoute>} />
            <Route path="/facilities/pool" element={<ProtectedRoute><CasePool /></ProtectedRoute>} />
            <Route path="/facilities/my-cases" element={<ProtectedRoute><OHSMyCases /></ProtectedRoute>} />
            <Route path="/facilities/cases/:id" element={<ProtectedRoute><OHSCaseAction /></ProtectedRoute>} />
            <Route path="/facilities/cases-review" element={<ProtectedRoute><OHSCasesReview /></ProtectedRoute>} />
            <Route path="/facilities/report-incident" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="/facilities/submit-case" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
            <Route path="/facilities/report-incident/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="/facilities/submit-case/success" element={<ProtectedRoute><CaseSubmissionSuccess /></ProtectedRoute>} />
            <Route path="/facilities/ai-assistant" element={<ProtectedRoute><OHSSafetyAiAssistant /></ProtectedRoute>} />
            <Route path="/facilities/memorandum" element={<ProtectedRoute><FacilitiesMemorandum /></ProtectedRoute>} />
            <Route path="/facilities/cases/:id/memorandum" element={<ProtectedRoute><FacilitiesMemorandum /></ProtectedRoute>} />
            <Route path="/facilities" element={<Navigate to="/facilities/dashboard" replace />} />

            {/* Chief Director (DDG / Executive Management) specific routes */}
            <Route path="/chief-director/dashboard" element={<ProtectedRoute><ChiefDirectorDashboard /></ProtectedRoute>} />
            <Route path="/chief-director/incident-approvals" element={<ProtectedRoute><ChiefDirectorIncidentApprovals /></ProtectedRoute>} />
            <Route path="/chief-director/incidents/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
            <Route path="/chief-director/infrastructure" element={<ProtectedRoute><ChiefDirectorInfrastructure /></ProtectedRoute>} />
            <Route path="/chief-director/escalations" element={<ProtectedRoute><ChiefDirectorEscalations /></ProtectedRoute>} />
            <Route path="/chief-director/strategic-decisions" element={<ProtectedRoute><ChiefDirectorStrategicDecisions /></ProtectedRoute>} />
            <Route path="/chief-director/compliance" element={<ProtectedRoute><ChiefDirectorCompliance /></ProtectedRoute>} />
            <Route path="/chief-director/ai-assistant" element={<ProtectedRoute><ChiefDirectorAIAssistant /></ProtectedRoute>} />
            <Route path="/chief-director" element={<Navigate to="/chief-director/dashboard" replace />} />

            <Route path="/hr-team" element={<ProtectedRoute><PlaceholderPage title="HR Team" /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><OHSSafetyAiAssistant /></ProtectedRoute>} />

            {/* Catch all redirect to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AdminRoutes;
