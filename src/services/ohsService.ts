import api from './api';

export interface Inspection {
    id: string;
    title?: string; // specific?
    type: string;
    status: string;
    conductedAt?: string;
    building?: {
        name: string;
    };
    inspector?: {
        fullName: string;
    };
}

export const ohsService = {
    async getInspections(buildingId?: string): Promise<Inspection[]> {
        const response = await api.get<Inspection[]>('/ohs/inspections', {
            params: { buildingId }
        });
        return response.data;
    },

    async scheduleInspection(data: any) {
        const response = await api.post('/ohs/inspections', data);
        return response.data;
    },

    async getRisks() {
        const response = await api.get('/ohs/risks');
        return response.data;
    },

    async getHazards() {
        const response = await api.get('/ohs/hazards');
        return response.data;
    },

    async getJSAs() {
        const response = await api.get('/ohs/jsa');
        return response.data;
    },

    async getSWPs() {
        const response = await api.get('/ohs/swp');
        return response.data;
    },

    async getStats() {
        const response = await api.get('/ohs/stats');
        return response.data;
    }
};
