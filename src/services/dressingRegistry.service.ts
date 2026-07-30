import api from './api';

export interface DressingRegistryEntry {
    id?: string;
    officeName: string;
    date: string;
    time: string;
    name: string;
    natureOfInjury: string;
    treatmentRendered: string;
    treatedById?: string;
    treatedBy?: {
        id: string;
        name: string;
        email: string;
    };
    dateResumedWork?: string;
    incidentId?: string;
    incident?: {
        id: string;
        incidentNumber: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export const dressingRegistryService = {
    async submitEntry(data: DressingRegistryEntry): Promise<DressingRegistryEntry> {
        const response = await api.post<DressingRegistryEntry>('/dressing-registry', data);
        return response.data;
    },

    async getMyEntries(): Promise<DressingRegistryEntry[]> {
        const response = await api.get<DressingRegistryEntry[]>('/dressing-registry/my');
        return response.data;
    }
};
