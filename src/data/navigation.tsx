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
    User,
    AlertTriangle,
    ClipboardList,
    BookOpen,
    Bot,
    Zap,
    ArrowUpRight,
    Gavel,
    MapPin
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
            { path: '/ohs/report-incident', label: 'Report New Incident' },
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
        label: 'My Incidents',
        icon: Folder,
        isSingle: true
    },
    {
        path: '/employee/submit-case',
        label: 'Report New Incident',
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
        label: 'Logged Incidents',
        path: '/supervisor/logged-incidents',
        icon: AlertTriangle,
        isSingle: true
    },
    {
        label: 'Report New Incident',
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
        label: 'AI Assistant',
        path: '/supervisor/ai-assistant',
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

export const OHS_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/ohs/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Unassigned Incidents',
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

export const OHS_NATIONAL_SIDEBAR = [
    {
        label: 'Dashboard',
        path: '/ohs-national/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Logged Incidents',
        path: '/ohs-national/logged-incidents',
        icon: AlertTriangle,
        isSingle: true
    },
    {
        label: 'Administration',
        path: '/ohs-national/administration',
        icon: UserCog,
        isSingle: true
    },
    {
        label: 'AI Assistant',
        path: '/ohs-national/ai-assistant',
        icon: MessageSquare,
        isSingle: true
    },
    {
        label: 'My Profile',
        path: '/profile',
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
        label: 'Report Incident',
        path: '/first-aider/report-incident',
        icon: FilePlus,
        isSingle: true
    },
    {
        label: 'My Assigned Cases',
        path: '/first-aider/my-cases',
        icon: Folder,
        isSingle: true
    },
    {
        label: 'Dressing Registry',
        path: '/first-aider/dressing-registry',
        icon: BookOpen,
        isSingle: true
    },
    {
        label: 'My Registry',
        path: '/first-aider/my-registry',
        icon: FolderOpen,
        isSingle: true
    },
    {
        label: 'First Aid Checklist',
        path: '/first-aider/checklist',
        icon: ClipboardList,
        isSingle: true
    },
    {
        label: 'AI Assistant',
        path: '/first-aider/ai-assistant',
        icon: Bot,
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
        label: 'Dashboard',
        path: '/hr/dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        label: 'Logged Incidents',
        path: '/hr/logged-incidents',
        icon: FolderOpen,
        isSingle: true
    },
    {
        label: 'WCL Records',
        path: '/hr/wcl-records',
        icon: ClipboardList,
        isSingle: true
    },
    {
        label: 'AI Assistant',
        path: '/hr/ai-assistant',
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

export const PSSC_SIDEBAR = [
    {
        path: '/pssc/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        path: '/pssc/report-incident',
        label: 'Report New Incident',
        icon: FilePlus,
        isSingle: true
    },
    {
        path: '/pssc/incidents',
        label: 'All Incidents',
        icon: AlertCircle,
        isSingle: true
    },
    {
        path: '/pssc/reports',
        label: 'Reports',
        icon: FileText,
        isSingle: true
    },
    {
        path: '/pssc/hira',
        label: 'HIRA',
        icon: Shield,
        isSingle: true
    },
    {
        path: '/pssc/inspection-registry',
        label: 'Inspection Registry',
        icon: ClipboardList,
        isSingle: true
    },
    {
        path: '/pssc/monthly-statistics',
        label: 'Monthly Statistics',
        icon: BarChart2,
        isSingle: true
    },
    {
        path: '/hr-team',
        label: 'HR Team',
        icon: UserCog,
        isSingle: true
    },
    {
        path: '/pssc/ai-assistant',
        label: 'AI Assistant',
        icon: MessageSquare,
        isSingle: true
    },
    {
        path: '/profile',
        label: 'Profile',
        icon: User,
        isSingle: true
    }
];

export const CHIEF_DIRECTOR_SIDEBAR = [
    {
        path: '/chief-director/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        path: '/chief-director/infrastructure',
        label: 'Infrastructure Incidents',
        icon: Zap,
        isSingle: true
    },
    {
        path: '/chief-director/escalations',
        label: 'Escalation Reports',
        icon: ArrowUpRight,
        isSingle: true
    },
    {
        path: '/chief-director/compliance',
        label: 'Provincial Compliance',
        icon: MapPin,
        isSingle: true
    },
    {
        path: '/chief-director/strategic-decisions',
        label: 'Strategic Decisions',
        icon: Gavel,
        isSingle: true
    },
    {
        path: '/chief-director/ai-assistant',
        label: 'AI Assistant',
        icon: Bot,
        isSingle: true
    },
    {
        path: '/profile',
        label: 'Profile',
        icon: User,
        isSingle: true
    }
];

export const DEPUTY_SIDEBAR = [
    {
        path: '/deputy/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isSingle: true
    },
    {
        path: '/deputy/report-incident',
        label: 'Report New Incident',
        icon: FilePlus,
        isSingle: true
    },
    {
        path: '/deputy/incidents',
        label: 'All Incidents',
        icon: AlertCircle,
        isSingle: true
    },
    {
        path: '/deputy/reports',
        label: 'Reports',
        icon: FileText,
        isSingle: true
    },
    {
        path: '/deputy/hira',
        label: 'HIRA',
        icon: Shield,
        isSingle: true
    },
    {
        path: '/deputy/inspection-registry',
        label: 'Inspection Registry',
        icon: ClipboardList,
        isSingle: true
    },
    {
        path: '/deputy/monthly-statistics',
        label: 'Monthly Statistics',
        icon: BarChart2,
        isSingle: true
    },
    {
        path: '/hr-team',
        label: 'HR Team',
        icon: UserCog,
        isSingle: true
    },
    {
        path: '/deputy/ai-assistant',
        label: 'AI Assistant',
        icon: MessageSquare,
        isSingle: true
    },
    {
        path: '/profile',
        label: 'Profile',
        icon: User,
        isSingle: true
    }
];
