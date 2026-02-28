import api from './api';

export interface Drill {
    id: string;
    name: string;
    type: string;
    location?: string; // Derived from building?
    scheduledDate?: string;
    status: string;
    participants?: string;
    organizer?: string;
    buildingId?: string;
    building?: {
        name: string;
    };
}

export const emergencyService = {
    async getDrills(): Promise<Drill[]> {
        const response = await api.get<Drill[]>('/emergency/drills');
        return response.data;
    },

    async recordDrill(data: any) {
        const response = await api.post('/emergency/drills', data);
        return response.data;
    }
};
