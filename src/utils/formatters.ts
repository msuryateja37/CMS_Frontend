
/**
 * Handles null/undefined inputs.
 */
export const formatCategory = (category: string | undefined | null): string => {
    if (!category) return '';
    if (category.trim() === '') return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

/**
 * Pulls the "[Category Sub-type: X]" tag out of an incident description.
 * Report New Incident stores the chosen "Other" sub-type (Power Outage, Water
 * Outage, Sewer Blockage, MVA, …) as a prefix on the description.
 */
export const extractSubtype = (description?: string | null): string | null => {
    if (!description) return null;
    const match = description.match(/\[Category Sub-type:\s*([^\]]+)\]/i);
    return match ? match[1].trim() : null;
};

/**
 * Display label for an incident's category. For the "Other" category, prefer
 * the specific sub-type (e.g. "Water Outage") so Facilities Co Coordinator
 * lists read like the real incident type instead of a generic "Others".
 */
export const formatIncidentCategory = (
    category?: string | null,
    description?: string | null,
): string => {
    const sub = category?.toLowerCase() === 'others' ? extractSubtype(description) : null;
    return sub || formatCategory(category);
};
