import { create } from 'zustand';
import casesService from '../services/cases.service';

export interface SearchResult {
    id: string;
    type: 'case' | 'invoice' | 'incident';
    incidentNumber?: string;
    invoiceNumber?: string;
    title: string;
    description?: string;
    status?: string;
    severity?: string;
    category?: string;
}

interface SearchState {
    searchQuery: string;
    searchResults: SearchResult[];
    isSearching: boolean;

    setSearchQuery: (query: string) => void;
    performSearch: (query: string) => Promise<void>;
    clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    searchQuery: '',
    searchResults: [],
    isSearching: false,

    setSearchQuery: (query) => {
        set({ searchQuery: query });
        if (!query.trim()) {
            set({ searchResults: [], isSearching: false });
        }
    },

    performSearch: async (query) => {
        if (!query.trim()) return;

        set({ isSearching: true });
        try {
            // Replicating implementation from GlobalSearchContext
            const response = await casesService.getCases({ take: 10 });
            const results = response.data
                .filter((c: any) =>
                    c.incidentNumber?.toLowerCase().includes(query.toLowerCase()) ||
                    c.description?.toLowerCase().includes(query.toLowerCase()) ||
                    c.category?.toLowerCase().includes(query.toLowerCase())
                )
                .map((c: any) => ({
                    id: c.id,
                    type: 'case' as const,
                    incidentNumber: c.incidentNumber,
                    title: c.incidentNumber || 'Unnamed Case',
                    description: c.description,
                    status: c.status,
                    severity: c.severity,
                    category: c.category,
                }));

            set({ searchResults: results, isSearching: false });
        } catch (error) {
            console.error('Search failed:', error);
            set({ searchResults: [], isSearching: false });
        }
    },

    clearSearch: () => set({ searchQuery: '', searchResults: [], isSearching: false }),
}));
