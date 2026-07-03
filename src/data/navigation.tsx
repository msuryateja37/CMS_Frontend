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
    Home,
    MessageSquare,
    User
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
            { path: '/admin/incidents', label: 'All Incidents' },
            { path: '/ohs/report-incident', label: 'Report new incident' },
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
        label: 'Facilities Management',
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
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
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
        path: '/employee/my-cases',
        label: 'My Incident',
        icon: Folder,
        isSingle: true
    },
    {
        path: '/employee/submit-case',
        label: 'Report new incident',
        icon: FileText,
        isSingle: true
    },
    {
        path: '/employee/ai-assistant',
        label: 'AI Assistant',
        icon: MessageSquare,
        isSingle: true
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
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
        label: 'Report new incident',
        path: '/supervisor/submit-case',
        icon: FilePlus,
        isSingle: true
    },
    {
        label: 'Facilities Management Services',
        path: '/supervisor/invoices',
        icon: FileText,
        isSingle: true
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
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
        label: 'Incident Pool',
        path: '/ohs/pool',
        icon: FolderOpen,
        isSingle: true
    },
    {
        label: 'Assigned Incidents',
        path: '/ohs/my-cases',
        icon: Folder,
        isSingle: true
    },
    {
        label: 'Inspections',
        path: '/ohs/inspections',
        icon: FileText,
        isSingle: true
    },
    {
        label: 'HIRA',
        path: '/ohs/hira',
        icon: Shield,
        isSingle: true
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
        isSingle: true
    }
];

export const FIRST_AIDER_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/first-aider/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Assigned Incidents',
        path: '/first-aider/my-cases',
        icon: Folder,
        isSingle: true
    },
    {
        label: 'My Registry',
        path: '/first-aider/my-registry',
        icon: FolderOpen,
        isSingle: true
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
        isSingle: true
    }
];

export const HR_SIDEBAR = [
    {
        label: 'Incidents for Review',
        path: '/hr/cases',
        icon: FolderOpen,
        isSingle: true
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
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
        label: 'Assigned Incidents',
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
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
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
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
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
    },
    {
        path: '/profile',
        label: 'My Profile',
        icon: User,
        isSingle: true
    }
];
