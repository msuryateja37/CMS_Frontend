import {
    LayoutDashboard,
    AlertCircle,
    Shield,
    FileText,
    HardHat,
    Settings,
    Siren,
    BarChart2,
    UserCog,
    Folder,
    FilePlus,
    FolderOpen,
    Clock,
    CheckCircle,
    Home
} from 'lucide-react';


export const SIDEBAR_ITEMS = [
    {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Incidents',
        icon: AlertCircle,
        children: [
            { path: '/admin/incidents', label: 'All Incident' },
            { path: '/ohs/report-incident', label: 'Report Incident' },
            { path: '/admin/incidents/assigned', label: 'My Assigned' }
        ]
    },
    {
        label: 'Security',
        icon: Shield,
        children: [
            { path: '/security', label: 'Security Incidents' },
            { path: '/security/report-breach', label: 'Report Security Breach' },
            { path: '/security/access-control', label: 'Access Control' }
        ]
    },
    {
        path: '/admin/invoice-management',
        label: 'Invoice Management',
        icon: FileText,
        isSingle: true
        // Previously had submenu children:
        // { path: '/invoices/inbox', label: 'Invoice Inbox' },
        // { path: '/invoices/pending', label: 'Pending Approval' },
        // { path: '/invoices/tracking', label: 'Payment Tracking' }
    },
    {
        label: 'OHS Management',
        icon: HardHat,
        children: [
            { path: '/ohs/hazards', label: 'Hazard Reports' },
            { path: '/ohs/risk-register', label: 'Risk Register' },
            { path: '/ohs/jsa', label: 'JSA Documents' },
            { path: '/ohs/procedures', label: 'Safe Work Procedures' }
        ]
    },
    {
        label: 'Operations',
        icon: Settings,
        children: [
            { path: '/operations/permits', label: 'Permit to work' },
            { path: '/operations/inspections', label: 'Inspections' },
            { path: '/operations/audits', label: 'Audits' }
        ]
    },
    {
        label: 'Emergency',
        icon: Siren,
        children: [
            { path: '/emergency/plan', label: 'Response Plan' },
            { path: '/emergency/drills', label: 'Drill Schedule' },
            { path: '/emergency/inventory', label: 'Equipment Inventory' }
        ]
    },
    {
        label: 'Performance',
        icon: BarChart2,
        children: [
            { path: '/performance/kpi', label: 'KPI Dashboard' },
            { path: '/performance/pdca', label: 'PDCA workflow' },
            { path: '/performance/actions', label: 'Action Plans' }
        ]
    },
    {
        path: '/admin/administration',
        label: 'ADMINISTRATION',
        icon: UserCog,
        isSingle: true
    }
];

export const EMPLOYEE_SIDEBAR = [
    {
        path: '/employee/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        path: '/employee/submit-case',
        label: 'Submit Case',
        icon: FileText,
        isSingle: true
    },
    {
        path: '/employee/my-cases',
        label: 'My Case',
        icon: Folder,
        isSingle: true
    }
];

export const SUPERVISOR_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/supervisor/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Submit Case',
        path: '/supervisor/submit-case',
        icon: FilePlus,
        isSingle: true
    },
    {
        label: 'Cases for Review',
        path: '/supervisor/cases-review',
        icon: FolderOpen,
        isSingle: true
    },
    {
        label: 'Approvals',
        path: '/supervisor/approvals',
        icon: CheckCircle,
        isSingle: true
    },
    {
        label: 'Invoice Management',
        path: '/supervisor/invoices',
        icon: FileText,
        isSingle: true
    }
];

export const OHS_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/ohs/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Disability Assessment Checklist',
        path: '/ohs/forms/disability',
        icon: FileText,
        isSingle: true
    },
    {
        label: 'OHS Inspection Checklist',
        path: '/ohs/forms/inspection',
        icon: AlertCircle,
        isSingle: true
    },
    {
        label: 'New Building Assessment Checklist',
        path: '/ohs/forms/building',
        icon: Home,
        isSingle: true
    },
    {
        label: 'OHS Compliance Audit',
        path: '/ohs/forms/audit',
        icon: CheckCircle,
        isSingle: true
    }
];

export const SECURITY_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/security/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'My Cases',
        path: '/security/my-cases',
        icon: Folder,
        isSingle: true
    },
    {
        label: 'Cases Under Review',
        path: '/security/cases-review',
        icon: FolderOpen,
        isSingle: true
    }
];

export const INVESTIGATOR_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/investigator/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Assigned Cases',
        path: '/investigator/assigned-cases',
        icon: Folder,
        isSingle: true
    },
    {
        label: 'Investigation Queue',
        path: '/investigator/queue',
        icon: FileText,
        isSingle: true
    },
    {
        label: 'Hearing Schedule',
        path: '/investigator/hearing-schedule',
        icon: Clock, // using Clock as placeholder for hearing/schedule if Calendar not imported
        isSingle: true
    },
    {
        label: 'Evidence Management',
        path: '/investigator/evidence-management',
        icon: FilePlus,
        isSingle: true
    },
    {
        label: 'SLA Tracking',
        path: '/investigator/sla-tracking',
        icon: Clock,
        isSingle: true
    }
];

export const CHAIRPERSON_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/chairperson/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Hearing Schedule',
        path: '/chairperson/hearing-schedule',
        icon: Clock,
        isSingle: true
    },
    {
        label: 'Pending Decisions',
        path: '/chairperson/pending-decisions',
        icon: Clock,
        isSingle: true
    },
    {
        label: 'Evidence Management',
        path: '/chairperson/evidence-management',
        icon: FilePlus,
        isSingle: true
    },
    {
        label: 'Appeals',
        path: '/chairperson/appeals',
        icon: FolderOpen,
        isSingle: true
    },
    {
        label: 'Escalations',
        path: '/chairperson/escalations',
        icon: AlertCircle,
        isSingle: true
    }
];

export const EA_DA_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/ea-da/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Hearing Schedule',
        path: '/ea-da/hearing-schedule',
        icon: Clock,
        isSingle: true
    },
    {
        label: 'Pending Decisions',
        path: '/ea-da/pending-decisions',
        icon: Clock,
        isSingle: true
    },
    {
        label: 'Evidence Management',
        path: '/ea-da/evidence-management',
        icon: FilePlus,
        isSingle: true
    },
    {
        label: 'Appeals',
        path: '/ea-da/appeals',
        icon: FolderOpen,
        isSingle: true
    },
    {
        label: 'Escalations',
        path: '/ea-da/escalations',
        icon: AlertCircle,
        isSingle: true
    }
];
