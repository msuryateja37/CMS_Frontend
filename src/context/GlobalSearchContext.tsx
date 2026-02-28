import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import casesService from '../services/cases.service';

export interface SearchResult {
    id: string;
    type: 'case' | 'invoice' | 'incident';
    incidentNumber?: string;
    title: string;
    description?: string;
    status?: string;
    severity?: string;
    category?: string;
}

interface GlobalSearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: SearchResult[];
    isSearching: boolean;
    navigateToResult: (result: SearchResult) => void;
    clearSearch: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);

export const GlobalSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const performSearch = useCallback(async (query: string) => {
        try {
            setIsSearching(true);

            // Search cases - limit to 10 results
            const { data: cases } = await casesService.getCases({
                take: 10,
                // Backend should support search, but for now we'll filter client-side
            });

            // Filter cases based on query
            const filteredCases = cases.filter(caseItem => {
                const searchLower = query.toLowerCase();
                return (
                    caseItem.incidentNumber?.toLowerCase().includes(searchLower) ||
                    caseItem.description?.toLowerCase().includes(searchLower) ||
                    caseItem.category?.toLowerCase().includes(searchLower)
                );
            });

            // Transform to SearchResult format
            const results: SearchResult[] = filteredCases.map(caseItem => ({
                id: caseItem.id,
                type: 'case' as const,
                incidentNumber: caseItem.incidentNumber,
                title: caseItem.description ? (caseItem.description.length > 50 ? caseItem.description.substring(0, 50) + '...' : caseItem.description) : (caseItem.incidentNumber || 'Untitled Case'),
                description: caseItem.description,
                status: caseItem.status,
                severity: caseItem.severity || caseItem.severityLevel,
                category: caseItem.category || caseItem.type,
            }));

            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const navigateToResult = useCallback((result: SearchResult) => {
        // Navigation will be handled in the component
        console.log('Navigate to:', result);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
    }, []);

    return (
        <GlobalSearchContext.Provider
            value={{
                searchQuery,
                setSearchQuery,
                searchResults,
                isSearching,
                navigateToResult,
                clearSearch,
            }}
        >
            {children}
        </GlobalSearchContext.Provider>
    );
};

export const useGlobalSearch = () => {
    const context = useContext(GlobalSearchContext);
    if (!context) {
        throw new Error('useGlobalSearch must be used within GlobalSearchProvider');
    }
    return context;
};
