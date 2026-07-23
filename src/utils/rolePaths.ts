// OEM comment
/**
 * Resolves the URL base path for role-shared workflow pages.
 *
 * The OHS Practitioner pages (Dashboard, CasePool, MyCases, CaseAction,
 * ReportIncident) are reused by the Facilities Co Coordinator role. Both use
 * the same components, but their routes live under different prefixes so the
 * sidebar and URLs stay consistent with the logged-in role.
 */
export const getRoleBasePath = (roleName?: string | null): string => {
    const normalized = (roleName || '').toLowerCase().replace(/\s+/g, '_');
    if (normalized === 'facilities_coordinator') return '/facilities';
    return '/ohs';
};
