export const PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
];

export const STATUS_OPTIONS = [
    // { value: 'Open', label: 'Open' },
    { value: 'Investigating', label: 'Investigating' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' }
];

export const SEVERITY_OPTIONS = [
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
];

// Centralized filter options for DataTable dropdowns
export const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'RAISED', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'ESCALATED', label: 'Escalated' },
];

/** Maps a raw DB status value to a human-readable display label */
export function getStatusLabel(status: string): string {
    if (status === 'RAISED') return 'Open';
    if (status === 'POOL') return 'Unassigned';
    return status.replace(/_/g, ' ');
}

export const CATEGORY_FILTER_OPTIONS = [
    { value: '', label: 'All Categories' },
    { value: 'health', label: 'Health' },
    { value: 'safety', label: 'Safety' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'security', label: 'Security' },
    { value: 'others', label: 'Other' },
];

export const PRIORITY_FILTER_OPTIONS = [
    { value: '', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

export const INCIDENT_CATEGORIES = [
    {
        id: 'safety',
        name: 'Safety',
        description: 'Work place, accident, hazards',
        caseType: 'INCIDENT'
    },
    {
        id: 'environmental',
        name: 'Environmental',
        description: 'Spills, contamination',
        caseType: 'INCIDENT'
    },
    {
        id: 'equipment',
        name: 'Equipment',
        description: 'Machinery failure',
        caseType: 'INCIDENT'
    },
    {
        id: 'security',
        name: 'Security',
        description: 'Unauthorized access, theft',
        caseType: 'INCIDENT'
    },
    {
        id: 'health',
        name: 'Health',
        description: 'Illness,Exposure',
        caseType: 'INCIDENT'
    },
    {
        id: 'others',
        name: 'Others',
        description: 'Other accidents',
        caseType: 'INCIDENT'
    }
];

export const IMMEDIATE_ACTIONS_BY_CATEGORY: Record<string, { id: string; label: string }[]> = {
    safety: [
        { id: 'cordoned', label: 'Area cordoned off/secured' },
        { id: 'first_aid', label: 'First aid administered' },
        { id: 'evacuated', label: 'Personnel evacuated' },
        { id: 'emergency', label: 'Emergency services contacted' },
        { id: 'management', label: 'Management notified' },
        { id: 'other', label: 'Other' }
    ],

    environmental: [
        { id: 'contain_spill', label: 'Spill contained' },
        { id: 'isolated_source', label: 'Source isolated' },
        { id: 'evacuated_area', label: 'Area evacuated' },
        { id: 'environment_team', label: 'Environmental team notified' },
        { id: 'management', label: 'Management notified' },
        { id: 'other', label: 'Other' }
    ],

    equipment: [
        { id: 'isolated', label: 'Power/utilities isolated' },
        { id: 'equipment_shutdown', label: 'Equipment shut down' },
        { id: 'maintenance_alerted', label: 'Maintenance team alerted' },
        { id: 'area_secured', label: 'Area secured' },
        { id: 'management', label: 'Management notified' },
        { id: 'other', label: 'Other' }
    ],

    security: [
        { id: 'area_secured', label: 'Area secured' },
        { id: 'access_revoked', label: 'Unauthorized access revoked' },
        { id: 'security_team', label: 'Security team notified' },
        { id: 'cctv_review', label: 'CCTV footage secured/reviewed' },
        { id: 'management', label: 'Management notified' },
        { id: 'other', label: 'Other' }
    ],

    health: [
        { id: 'first_aid', label: 'First aid administered' },
        { id: 'medical_attention', label: 'Medical attention provided' },
        { id: 'isolated_person', label: 'Affected person isolated' },
        { id: 'emergency', label: 'Emergency services contacted' },
        { id: 'management', label: 'Management notified' },
        { id: 'other', label: 'Other' }
    ],

    others: [
        { id: 'area_secured', label: 'Area secured' },
        { id: 'first_aid', label: 'First aid administered' },
        { id: 'management', label: 'Management notified' },
        { id: 'investigation_started', label: 'Initial investigation started' },
        { id: 'other', label: 'Other (Specify)' }
    ]
};
