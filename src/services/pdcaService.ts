
import api from './api';

export interface PdcaAction {
    id: string;
    title: string;
    phase: 'Plan' | 'Do' | 'Check' | 'Act';
    description?: string;
    status: string;
    progress: number;
    ownerId?: string;
}

export const pdcaService = {
    async getActions(): Promise<PdcaAction[]> {
        const response = await api.get<PdcaAction[]>('/pdca/actions');
        return response.data;
    },

    async createAction(data: any) {
        const response = await api.post('/pdca/actions', data);
        return response.data;
    },

    async updateAction(id: string, data: any) {
        const response = await api.put(`/pdca/actions/${id}`, data);
        return response.data;
    }
};
