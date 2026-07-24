/**
 * Helper to safely extract and normalize a role string from a user object or role string.
 * Handles:
 * - user.role as an object: { id: "...", name: "CHIEF_DIRECTOR" } or { name: "Chief Director" }
 * - user.role as a string: "CHIEF_DIRECTOR", "OHS_PRACTITIONER"
 * - user.roleName as a string
 * - direct string input: "CHIEF_DIRECTOR"
 */
export const getUserRoleName = (userOrRole?: any): string => {
    if (!userOrRole) return '';
    let rawRole = '';

    if (typeof userOrRole === 'string') {
        rawRole = userOrRole;
    } else if (typeof userOrRole === 'object') {
        if (typeof userOrRole.role === 'object' && userOrRole.role?.name) {
            rawRole = userOrRole.role.name;
        } else if (typeof userOrRole.role === 'string') {
            rawRole = userOrRole.role;
        } else if (typeof userOrRole.roleName === 'string') {
            rawRole = userOrRole.roleName;
        } else if (typeof userOrRole.name === 'string' && !userOrRole.email && !userOrRole.fullName) {
            rawRole = userOrRole.name;
        }
    }

    const normalized = rawRole.toLowerCase().trim().replace(/[\s-]+/g, '_');

    // Match role aliases & variations safely
    if (normalized.includes('chief_director') || normalized === 'chiefdirector') {
        return 'chief_director';
    }
    if (normalized.includes('facilities') || normalized === 'facilitiescoordinator') {
        return 'facilities_coordinator';
    }
    if (normalized.includes('pssc') || normalized === 'pssccoordinator') {
        return 'pssc_coordinator';
    }
    if (normalized.includes('deputy') || normalized === 'deputydirector') {
        return 'deputy_director';
    }
    if (normalized.includes('national') && (normalized.includes('ohs') || normalized.includes('office'))) {
        return 'ohs_national_office';
    }
    if (normalized.includes('first_aider') || normalized.includes('firstaider')) {
        return 'first_aider';
    }

    return normalized;
};

/**
 * Returns the default dashboard URL path based on user role.
 */
export const getUserDashboardPath = (userOrRole?: any): string => {
    const roleName = getUserRoleName(userOrRole);

    switch (roleName) {
        case 'employee':
            return '/employee/dashboard';
        case 'supervisor':
            return '/supervisor/dashboard';
        case 'ohs_practitioner':
            return '/ohs/dashboard';
        case 'ohs_national_office':
            return '/ohs-national/dashboard';
        case 'first_aider':
            return '/first-aider/dashboard';
        case 'hr':
            return '/hr/dashboard';
        case 'finance_official':
            return '/admin/invoice-management';
        case 'pssc_coordinator':
            return '/pssc/dashboard';
        case 'deputy_director':
            return '/deputy/dashboard';
        case 'chief_director':
            return '/chief-director/dashboard';
        case 'facilities_coordinator':
            return '/facilities/dashboard';
        case 'system_administrator':
        case 'manager':
        case 'admin':
            return '/admin/dashboard';
        default:
            return '/admin/dashboard';
    }
};

/**
 * Resolves the URL base path for role-shared workflow pages.
 */
export const getRoleBasePath = (userOrRole?: any): string => {
    const roleName = getUserRoleName(userOrRole);
    if (roleName === 'facilities_coordinator') return '/facilities';
    if (roleName === 'ohs_national_office') return '/ohs-national';
    if (roleName === 'pssc_coordinator') return '/pssc';
    if (roleName === 'deputy_director') return '/deputy';
    if (roleName === 'chief_director') return '/chief-director';
    if (roleName === 'first_aider') return '/first-aider';
    if (roleName === 'hr') return '/hr';
    if (roleName === 'supervisor') return '/supervisor';
    if (roleName === 'employee') return '/employee';
    return '/ohs';
};

/**
 * Returns a human-friendly display name for the user's role.
 */
export const getUserRoleDisplayName = (userOrRole?: any): string => {
    const roleName = getUserRoleName(userOrRole);
    if (!roleName) return 'User';

    const displayNames: Record<string, string> = {
        employee: 'Employee',
        supervisor: 'Supervisor',
        ohs_practitioner: 'OHS Practitioner',
        ohs_national_office: 'OHS National Office',
        first_aider: 'First Aider',
        hr: 'HR Officer',
        finance_official: 'Finance Official',
        pssc_coordinator: 'PSSC Coordinator',
        deputy_director: 'Deputy Director',
        chief_director: 'Chief Director',
        facilities_coordinator: 'Facilities Co Coordinator',
        system_administrator: 'System Administrator',
        manager: 'Manager',
    };

    if (displayNames[roleName]) {
        return displayNames[roleName];
    }

    return roleName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
