
/**
 * Handles null/undefined inputs.
 */
export const formatCategory = (category: string | undefined | null): string => {
    if (!category) return '';
    if (category.trim() === '') return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};
